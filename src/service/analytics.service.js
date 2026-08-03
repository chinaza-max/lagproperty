import { Op, Sequelize } from "sequelize";
import {
  ProspectiveTenant,
  PropertyManager,
  Building,
  Transaction,
  Tenant,
  Inspection,
} from "../db/models/index.js";
import { NotFoundError, BadRequestError } from "../errors/index.js";
import { getPaginationParams, formatPaginatedResponse } from "../utils/pagination.util.js";

class AnalyticsService {
  /**
   * Look up transactions and financial activity by User NIN
   */
  async getTransactionsByUserNIN(queryParams) {
    const { nin, userType, page, limit } = queryParams;

    if (!nin) {
      throw new BadRequestError("User NIN parameter is required.");
    }

    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    let tenantUser = null;
    let managerUser = null;

    if (!userType || userType === "tenant" || userType === "rent") {
      tenantUser = await ProspectiveTenant.findOne({
        where: { nin: nin.toString().trim(), isDeleted: false },
      });
    }

    if (!tenantUser && (!userType || userType === "landlord" || userType === "agent" || userType === "list")) {
      managerUser = await PropertyManager.findOne({
        where: { nin: nin.toString().trim(), isDeleted: false },
      });
    }

    if (!tenantUser && !managerUser) {
      // Retry search across both if userType was specified but didn't match
      tenantUser = await ProspectiveTenant.findOne({
        where: { nin: nin.toString().trim(), isDeleted: false },
      });
      if (!tenantUser) {
        managerUser = await PropertyManager.findOne({
          where: { nin: nin.toString().trim(), isDeleted: false },
        });
      }
    }

    if (!tenantUser && !managerUser) {
      throw new NotFoundError(`No user found matching NIN: ${nin}`);
    }

    // Process Tenant NIN Lookup
    if (tenantUser) {
      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: { userId: tenantUser.id, isDeleted: false },
        include: [
          {
            model: Building,
            attributes: ["id", "propertyPreference", "propertyLocation", "city", "address", "price"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset,
      });

      // Calculate total amount spent by tenant
      const totalSpentResult = await Transaction.sum("amount", {
        where: {
          userId: tenantUser.id,
          isDeleted: false,
          paymentStatus: ["successful", "paid", "completed", "approved"],
        },
      });

      const totalSpent = totalSpentResult || 0;

      const userProfile = {
        id: tenantUser.id,
        firstName: tenantUser.firstName,
        lastName: tenantUser.lastName,
        emailAddress: tenantUser.emailAddress,
        tel: tenantUser.tel,
        nin: tenantUser.nin,
        isNINValid: tenantUser.isNINValid,
        role: "tenant",
        maritalStatus: tenantUser.maritalStatus,
        gender: tenantUser.gender,
        isProfileCompleted: tenantUser.isProfileCompleted,
        disableAccount: tenantUser.disableAccount,
      };

      return formatPaginatedResponse({
        data: transactions,
        totalItems: count,
        page: currentPage,
        limit: pageSize,
        extra: {
          user: userProfile,
          summary: {
            totalSpent,
            totalReceived: 0,
            transactionCount: count,
          },
        },
      });
    }

    // Process PropertyManager (Landlord or Agent) NIN Lookup
    if (managerUser) {
      // Find all buildings belonging to this property manager
      const buildings = await Building.findAll({
        where: { propertyManagerId: managerUser.id, isDeleted: false },
        attributes: ["id"],
      });

      const buildingIds = buildings.map((b) => b.id);

      const transactionWhereClause = {
        isDeleted: false,
        [Op.or]: [
          { userId: managerUser.id },
          buildingIds.length > 0 ? { buildingId: { [Op.in]: buildingIds } } : null,
        ].filter(Boolean),
      };

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: transactionWhereClause,
        include: [
          {
            model: Building,
            attributes: ["id", "propertyPreference", "propertyLocation", "city", "address", "price"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: pageSize,
        offset,
      });

      // Sum financial amounts received
      const totalReceivedResult = await Transaction.sum("amount", {
        where: {
          ...transactionWhereClause,
          paymentStatus: ["successful", "paid", "completed", "approved"],
          transactionType: ["firstRent", "rent", "subsequentRent", "commission"],
        },
      });

      const totalSpentResult = await Transaction.sum("amount", {
        where: {
          userId: managerUser.id,
          isDeleted: false,
          paymentStatus: ["successful", "paid", "completed", "approved"],
        },
      });

      const userProfile = {
        id: managerUser.id,
        firstName: managerUser.firstName,
        lastName: managerUser.lastName,
        companyName: managerUser.companyName,
        emailAddress: managerUser.emailAddress,
        tel: managerUser.tel,
        nin: managerUser.nin,
        isNINValid: managerUser.isNINValid,
        type: managerUser.type, // 'landLord' or 'agent'
        role: managerUser.type === "agent" ? "agent" : "landlord",
        state: managerUser.state,
        lga: managerUser.lga,
        isBlacklisted: managerUser.isBlacklisted || false,
        blacklistReason: managerUser.blacklistReason || null,
        blacklistedAt: managerUser.blacklistedAt || null,
        disableAccount: managerUser.disableAccount,
      };

      return formatPaginatedResponse({
        data: transactions,
        totalItems: count,
        page: currentPage,
        limit: pageSize,
        extra: {
          user: userProfile,
          summary: {
            totalReceived: totalReceivedResult || 0,
            totalSpent: totalSpentResult || 0,
            transactionCount: count,
            managedBuildingsCount: buildingIds.length,
          },
        },
      });
    }
  }

  /**
   * Area/Location Housing & Entity Analytics
   * Shows houses listed per area, vacant/occupied counts, and number of agents/landlords operating per area
   */
  async getHousingByLocationAnalytics(queryParams) {
    const { city, state, page, limit } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const whereClause = { isDeleted: false };
    if (city) {
      whereClause.city = { [Op.like]: `%${city}%` };
    }
    if (state) {
      whereClause.propertyLocation = { [Op.like]: `%${state}%` };
    }

    // Find location groups from Buildings table
    const locationStatsRaw = await Building.findAll({
      attributes: [
        "city",
        "propertyLocation",
        [Sequelize.fn("COUNT", Sequelize.col("Building.id")), "totalBuildings"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("CASE WHEN availability = 'vacant' THEN 1 ELSE 0 END")
          ),
          "vacantCount",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("CASE WHEN availability = 'occupied' THEN 1 ELSE 0 END")
          ),
          "occupiedCount",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("CASE WHEN availability = 'booked' THEN 1 ELSE 0 END")
          ),
          "bookedCount",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.fn("DISTINCT", Sequelize.col("Building.propertyManagerId"))
          ),
          "totalPropertyManagers",
        ],
      ],
      where: whereClause,
      group: ["city", "propertyLocation"],
      raw: true,
    });

    const totalLocations = locationStatsRaw.length;
    const paginatedLocations = locationStatsRaw.slice(offset, offset + pageSize);

    // Enhance each location with distinct agent and landlord breakdown
    const enrichedLocations = await Promise.all(
      paginatedLocations.map(async (item) => {
        // Find buildings in this city
        const buildingsInArea = await Building.findAll({
          where: {
            city: item.city,
            isDeleted: false,
          },
          attributes: ["propertyManagerId"],
          raw: true,
        });

        const pmIds = Array.from(new Set(buildingsInArea.map((b) => b.propertyManagerId)));

        let agentCount = 0;
        let landlordCount = 0;

        if (pmIds.length > 0) {
          agentCount = await PropertyManager.count({
            where: {
              id: { [Op.in]: pmIds },
              type: "agent",
              isDeleted: false,
            },
          });

          landlordCount = await PropertyManager.count({
            where: {
              id: { [Op.in]: pmIds },
              type: "landLord",
              isDeleted: false,
            },
          });
        }

        return {
          city: item.city,
          state: item.propertyLocation,
          totalBuildings: parseInt(item.totalBuildings, 10) || 0,
          vacantCount: parseInt(item.vacantCount, 10) || 0,
          occupiedCount: parseInt(item.occupiedCount, 10) || 0,
          bookedCount: parseInt(item.bookedCount, 10) || 0,
          totalPropertyManagers: parseInt(item.totalPropertyManagers, 10) || 0,
          agentCount,
          landlordCount,
        };
      })
    );

    return formatPaginatedResponse({
      data: enrichedLocations,
      totalItems: totalLocations,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * System Overview Analytics Dashboard KPI stats
   */
  async getDashboardOverviewAnalytics() {
    const totalTenants = await ProspectiveTenant.count({ where: { isDeleted: false } });
    const totalLandlords = await PropertyManager.count({
      where: { type: "landLord", isDeleted: false },
    });
    const totalAgents = await PropertyManager.count({
      where: { type: "agent", isDeleted: false },
    });
    const totalBlacklistedAgents = await PropertyManager.count({
      where: { isBlacklisted: true, isDeleted: false },
    });

    const totalBuildings = await Building.count({ where: { isDeleted: false } });
    const vacantBuildings = await Building.count({
      where: { availability: "vacant", isDeleted: false },
    });
    const occupiedBuildings = await Building.count({
      where: { availability: "occupied", isDeleted: false },
    });
    const bookedBuildings = await Building.count({
      where: { availability: "booked", isDeleted: false },
    });

    const totalTransactions = await Transaction.count({ where: { isDeleted: false } });
    const totalVolumeResult = await Transaction.sum("amount", {
      where: { paymentStatus: ["successful", "paid", "completed", "approved"], isDeleted: false },
    });

    return {
      users: {
        totalTenants,
        totalLandlords,
        totalAgents,
        totalBlacklistedAgents,
      },
      properties: {
        totalBuildings,
        vacantBuildings,
        occupiedBuildings,
        bookedBuildings,
      },
      financials: {
        totalTransactions,
        totalTransactionVolume: totalVolumeResult || 0,
      },
    };
  }

  /**
   * Property Types & Preferences Analytics
   */
  async getPropertyTypesDistribution() {
    const distribution = await Building.findAll({
      attributes: [
        "propertyPreference",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        [Sequelize.fn("AVG", Sequelize.col("price")), "averagePrice"],
        [Sequelize.fn("MIN", Sequelize.col("price")), "minPrice"],
        [Sequelize.fn("MAX", Sequelize.col("price")), "maxPrice"],
      ],
      where: { isDeleted: false },
      group: ["propertyPreference"],
      raw: true,
    });

    return distribution.map((item) => ({
      propertyType: item.propertyPreference,
      count: parseInt(item.count, 10) || 0,
      averagePrice: Math.round(parseFloat(item.averagePrice) || 0),
      minPrice: parseInt(item.minPrice, 10) || 0,
      maxPrice: parseInt(item.maxPrice, 10) || 0,
    }));
  }
}

export default new AnalyticsService();
