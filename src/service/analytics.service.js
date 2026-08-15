import { Op, Sequelize } from "sequelize";
import {
  ProspectiveTenant,
  PropertyManager,
  Building,
  Transaction,
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

    if (tenantUser) {
      const [{ count, rows: transactions }, totalSpentResult] = await Promise.all([
        Transaction.findAndCountAll({
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
        }),
        Transaction.sum("amount", {
          where: {
            userId: tenantUser.id,
            isDeleted: false,
            paymentStatus: ["successful", "paid", "completed", "approved"],
          },
        }),
      ]);

      return formatPaginatedResponse({
        data: transactions,
        totalItems: count,
        page: currentPage,
        limit: pageSize,
        extra: {
          user: {
            id: tenantUser.id,
            firstName: tenantUser.firstName,
            lastName: tenantUser.lastName,
            emailAddress: tenantUser.emailAddress,
            tel: tenantUser.tel,
            nin: tenantUser.nin,
            role: "tenant",
          },
          summary: {
            totalSpent: totalSpentResult || 0,
            totalReceived: 0,
            transactionCount: count,
          },
        },
      });
    }

    if (managerUser) {
      const buildings = await Building.findAll({
        where: { propertyManagerId: managerUser.id, isDeleted: false },
        attributes: ["id"],
      });
      const buildingIds = buildings.map((b) => b.id);

      const transactionWhereClause = {
        isDeleted: false,
        [Op.or]: [
          { userId: managerUser.id },
          ...(buildingIds.length > 0 ? [{ buildingId: { [Op.in]: buildingIds } }] : []),
        ],
      };

      const [{ count, rows: transactions }, totalReceivedResult, totalSpentResult] = await Promise.all([
        Transaction.findAndCountAll({
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
        }),
        Transaction.sum("amount", {
          where: {
            ...transactionWhereClause,
            paymentStatus: ["successful", "paid", "completed", "approved"],
            transactionType: ["firstRent", "rent", "subsequentRent", "commission"],
          },
        }),
        Transaction.sum("amount", {
          where: {
            userId: managerUser.id,
            isDeleted: false,
            paymentStatus: ["successful", "paid", "completed", "approved"],
          },
        }),
      ]);

      return formatPaginatedResponse({
        data: transactions,
        totalItems: count,
        page: currentPage,
        limit: pageSize,
        extra: {
          user: {
            id: managerUser.id,
            firstName: managerUser.firstName,
            lastName: managerUser.lastName,
            companyName: managerUser.companyName,
            emailAddress: managerUser.emailAddress,
            tel: managerUser.tel,
            nin: managerUser.nin,
            type: managerUser.type,
            role: managerUser.type === "agent" ? "agent" : "landlord",
            isBlacklisted: managerUser.isBlacklisted || false,
          },
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
   * Area/Location Housing Analytics — HIGHLY OPTIMIZED (single batch query, no N+1)
   * propertyLocation = area/neighborhood inside a city (e.g. Lekki, Ikeja, Maryland)
   */
  async getHousingByLocationAnalytics(queryParams) {
    const { city, location, propertyLocation, state, page, limit } = queryParams;

    // Cap max limit to 50 to prevent memory overload
    const safeLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    const safePage = Math.max(parseInt(page) || 1, 1);

    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page: safePage, limit: safeLimit });

    const whereClause = { isDeleted: false };
    if (city && String(city).trim() && String(city).trim() !== "1") {
      whereClause.city = { [Op.like]: `%${String(city).trim()}%` };
    }

    const locationFilter = location || propertyLocation || state;
    // Ignore dummy placeholder parameters like "1" or numbers passed by frontend components
    if (locationFilter && String(locationFilter).trim() && String(locationFilter).trim() !== "1" && isNaN(Number(locationFilter))) {
      whereClause.propertyLocation = { [Op.like]: `%${String(locationFilter).trim()}%` };
    }

    // STEP 1: Aggregated query — counts per city + location group
    const locationStatsRaw = await Building.findAll({
      attributes: [
        "city",
        "propertyLocation",
        [Sequelize.fn("COUNT", Sequelize.col("Building.id")), "totalBuildings"],
        [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN availability = 'vacant' THEN 1 ELSE 0 END")), "vacantCount"],
        [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN availability = 'occupied' THEN 1 ELSE 0 END")), "occupiedCount"],
        [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN availability = 'booked' THEN 1 ELSE 0 END")), "bookedCount"],
        [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("Building.propertyManagerId"))), "totalPropertyManagers"],
      ],
      where: whereClause,
      group: ["city", "propertyLocation"],
      raw: true,
    });

    if (!locationStatsRaw || locationStatsRaw.length === 0) {
      return formatPaginatedResponse({ data: [], totalItems: 0, page: 1, limit: pageSize });
    }

    const totalLocations = locationStatsRaw.length;
    // Fallback to page 1 if requested page offset exceeds total available items
    const actualOffset = offset >= totalLocations ? 0 : offset;
    const actualPage = offset >= totalLocations ? 1 : currentPage;

    const paginatedLocations = locationStatsRaw.slice(actualOffset, actualOffset + pageSize);

    // STEP 2: Batch query property managers for the current page
    const pageCities = paginatedLocations.map((r) => r.city).filter(Boolean);
    const pageLocations = paginatedLocations.map((r) => r.propertyLocation).filter(Boolean);

    let pmBreakdownMap = {};

    if (pageCities.length > 0) {
      const buildingsForPage = await Building.findAll({
        where: {
          city: { [Op.in]: pageCities },
          propertyLocation: { [Op.in]: pageLocations },
          isDeleted: false,
        },
        attributes: ["city", "propertyLocation", "propertyManagerId"],
        raw: true,
      });

      const pmIdsByArea = {};
      for (const b of buildingsForPage) {
        const key = `${b.city}|${b.propertyLocation}`;
        if (!pmIdsByArea[key]) pmIdsByArea[key] = new Set();
        if (b.propertyManagerId) pmIdsByArea[key].add(b.propertyManagerId);
      }

      const allPmIds = [...new Set(buildingsForPage.map((b) => b.propertyManagerId).filter(Boolean))];

      if (allPmIds.length > 0) {
        const managers = await PropertyManager.findAll({
          where: { id: { [Op.in]: allPmIds }, isDeleted: false },
          attributes: ["id", "type"],
          raw: true,
        });

        const managerTypeMap = {};
        for (const m of managers) {
          managerTypeMap[m.id] = m.type;
        }

        for (const [key, pmIds] of Object.entries(pmIdsByArea)) {
          let agentCount = 0;
          let landlordCount = 0;
          for (const pmId of pmIds) {
            if (managerTypeMap[pmId] === "agent") agentCount++;
            else if (managerTypeMap[pmId] === "landLord") landlordCount++;
          }
          pmBreakdownMap[key] = { agentCount, landlordCount };
        }
      }
    }

    // STEP 3: Assemble final optimized response
    const enrichedLocations = paginatedLocations.map((item) => {
      const key = `${item.city}|${item.propertyLocation}`;
      const { agentCount = 0, landlordCount = 0 } = pmBreakdownMap[key] || {};
      return {
        city: item.city || "",
        location: item.propertyLocation || "",
        propertyLocation: item.propertyLocation || "",
        totalBuildings: parseInt(item.totalBuildings, 10) || 0,
        vacantCount: parseInt(item.vacantCount, 10) || 0,
        occupiedCount: parseInt(item.occupiedCount, 10) || 0,
        bookedCount: parseInt(item.bookedCount, 10) || 0,
        totalPropertyManagers: parseInt(item.totalPropertyManagers, 10) || 0,
        agentCount,
        landlordCount,
      };
    });

    return formatPaginatedResponse({
      data: enrichedLocations,
      totalItems: totalLocations,
      page: actualPage,
      limit: pageSize,
    });
  }

  /**
   * System Overview Analytics Dashboard KPI stats — OPTIMIZED (all queries in parallel)
   */
  async getDashboardOverviewAnalytics() {
    const [
      totalTenants,
      totalLandlords,
      totalAgents,
      totalBlacklistedAgents,
      totalBuildings,
      vacantBuildings,
      occupiedBuildings,
      bookedBuildings,
      totalTransactions,
      totalVolumeResult,
    ] = await Promise.all([
      ProspectiveTenant.count({ where: { isDeleted: false } }).catch(() => 0),
      PropertyManager.count({ where: { type: "landLord", isDeleted: false } }).catch(() => 0),
      PropertyManager.count({ where: { type: "agent", isDeleted: false } }).catch(() => 0),
      PropertyManager.count({ where: { isBlacklisted: true, isDeleted: false } }).catch(() => 0),
      Building.count({ where: { isDeleted: false } }).catch(() => 0),
      Building.count({ where: { availability: "vacant", isDeleted: false } }).catch(() => 0),
      Building.count({ where: { availability: "occupied", isDeleted: false } }).catch(() => 0),
      Building.count({ where: { availability: "booked", isDeleted: false } }).catch(() => 0),
      Transaction.count({ where: { isDeleted: false } }).catch(() => 0),
      Transaction.sum("amount", {
        where: { paymentStatus: ["successful", "paid", "completed", "approved"], isDeleted: false },
      }).catch(() => 0),
    ]);

    return {
      users: {
        totalTenants: totalTenants || 0,
        totalLandlords: totalLandlords || 0,
        totalAgents: totalAgents || 0,
        totalBlacklistedAgents: totalBlacklistedAgents || 0,
      },
      properties: {
        totalBuildings: totalBuildings || 0,
        vacantBuildings: vacantBuildings || 0,
        occupiedBuildings: occupiedBuildings || 0,
        bookedBuildings: bookedBuildings || 0,
      },
      financials: {
        totalTransactions: totalTransactions || 0,
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
      propertyType: item.propertyPreference || "Unspecified",
      count: parseInt(item.count, 10) || 0,
      averagePrice: Math.round(parseFloat(item.averagePrice) || 0),
      minPrice: parseInt(item.minPrice, 10) || 0,
      maxPrice: parseInt(item.maxPrice, 10) || 0,
    }));
  }
}

export default new AnalyticsService();
