import bcrypt from "bcrypt";
import { Op, Sequelize } from "sequelize";
import ExcelJS from "exceljs";
import {
  Admin,
  PropertyManager,
  ProspectiveTenant,
  Tenant,
  Building,
  Transaction,
  TenantReview,
  PropertyManagerReview,
  Inspection,
  QuitNotice,
  Notification,
} from "../db/models/index.js";
import { NotFoundError, BadRequestError, ConflictError } from "../errors/index.js";
import { getPaginationParams, formatPaginatedResponse } from "../utils/pagination.util.js";

import mailService from "./mail.service.js";
import serverConfig from "../config/server.js";
import { sendBatchedPushNotifications } from "../config/firebase.js";

class AdminService {
  /**
   * Create a new Admin with designated Role & Privilege
   */
  async createAdmin(adminData) {
    const { emailAddress, password, firstName, lastName, role, privilege } = adminData;

    if (!emailAddress || !password || !firstName || !lastName) {
      throw new BadRequestError("emailAddress, password, firstName, and lastName are required.");
    }

    const existingAdmin = await Admin.findOne({
      where: { emailAddress: emailAddress.toLowerCase().trim(), isDeleted: false },
    });

    if (existingAdmin) {
      throw new ConflictError("An admin account with this email address already exists.");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await Admin.create({
      emailAddress: emailAddress.toLowerCase().trim(),
      password: hashedPassword,
      firstName,
      lastName,
      role: role ? role.toLowerCase().trim() : "admin",
      privilege: privilege || "all",
      isEmailValid: true,
      disableAccount: false,
      isDeleted: false,
    });

    // Send email with login credentials
    try {
      await mailService.sendMail({
        to: emailAddress.toLowerCase().trim(),
        subject: "Your Admin Account Credentials - LagProperty",
        templateName: "adminCredentials",
        variables: {
          firstName,
          lastName,
          emailAddress: emailAddress.toLowerCase().trim(),
          password: password, // Raw password before hashing
          role: newAdmin.role,
          privilege: newAdmin.privilege,
          loginUrl: process.env.ADMIN_PORTAL_URL || `${serverConfig.DOMAIN}/admin`,
        },
      });
    } catch (mailErr) {
      console.error("[AdminService] Failed to send admin credential email:", mailErr.message);
    }

    const adminResponse = newAdmin.toJSON();
    delete adminResponse.password;

    return adminResponse;
  }

  /**
   * Delete an Admin user account (soft delete)
   */
  async deleteAdmin(adminId, performingAdminId) {
    if (performingAdminId && String(adminId) === String(performingAdminId)) {
      throw new BadRequestError("You cannot delete your own admin account.");
    }

    const admin = await Admin.findOne({
      where: { id: adminId, isDeleted: false },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found.");
    }

    await admin.update({
      isDeleted: true,
      disableAccount: true,
    });

    return {
      id: admin.id,
      emailAddress: admin.emailAddress,
      firstName: admin.firstName,
      lastName: admin.lastName,
      isDeleted: true,
    };
  }

  /**
   * Update Admin FCM Token for push notifications
   */
  async updateAdminFcmToken(adminId, fcmToken) {
    if (!fcmToken || typeof fcmToken !== "string" || !fcmToken.trim()) {
      throw new BadRequestError("fcmToken is required.");
    }

    const admin = await Admin.findOne({
      where: { id: adminId, isDeleted: false },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found.");
    }

    await admin.update({ fcmToken: fcmToken.trim() });
    return { id: admin.id, fcmTokenUpdated: true };
  }

  /**
   * Get all admin users with pagination
   */
  async getAllAdmins(queryParams) {
    const { page, limit } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const { count, rows: admins } = await Admin.findAndCountAll({
      where: { isDeleted: false },
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
    });

    return formatPaginatedResponse({
      data: admins,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * Update admin role & privileges
   */
  async updateAdminRole(adminId, updateData) {
    const { role, privilege } = updateData;

    const admin = await Admin.findOne({
      where: { id: adminId, isDeleted: false },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found.");
    }

    const updatePayload = {};
    if (role) updatePayload.role = role.toLowerCase().trim();
    if (privilege) updatePayload.privilege = privilege;

    await admin.update(updatePayload);

    const response = admin.toJSON();
    delete response.password;
    return response;
  }

  /**
   * Toggle admin disable status
   */
  async toggleAdminStatus(adminId, statusData) {
    const { disableAccount } = statusData;

    const admin = await Admin.findOne({
      where: { id: adminId, isDeleted: false },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found.");
    }

    await admin.update({
      disableAccount: typeof disableAccount === "boolean" ? disableAccount : !admin.disableAccount,
    });

    const response = admin.toJSON();
    delete response.password;
    return response;
  }

  /**
   * Logged-in admin changes their own password
   */
  async changeAdminPassword(adminId, passwordData) {
    const { oldPassword, newPassword } = passwordData;

    if (!oldPassword || !newPassword) {
      throw new BadRequestError("Both oldPassword and newPassword are required.");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters long.");
    }

    const admin = await Admin.findOne({
      where: { id: adminId, isDeleted: false },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found.");
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      throw new BadRequestError("Incorrect current password.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({ password: hashedPassword });

    const response = admin.toJSON();
    delete response.password;
    return response;
  }

  /**
   * Super Admin resets password for an Admin account
   */
  async resetAdminPassword(targetAdminId, bodyData) {
    let { newPassword } = bodyData || {};

    const admin = await Admin.findOne({
      where: { id: targetAdminId, isDeleted: false },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found.");
    }

    // Auto-generate secure password if not provided
    if (!newPassword || !newPassword.trim()) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      newPassword = `Pass@${randomSuffix}`;
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters long.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({ password: hashedPassword });

    // Send password update notification email
    try {
      await mailService.sendMail({
        to: admin.emailAddress,
        subject: "Your Admin Password Has Been Reset - LagProperty",
        templateName: "adminCredentials",
        variables: {
          firstName: admin.firstName,
          lastName: admin.lastName,
          emailAddress: admin.emailAddress,
          password: newPassword,
          role: admin.role,
          privilege: admin.privilege,
          loginUrl: process.env.ADMIN_PORTAL_URL || `${serverConfig.DOMAIN}/admin`,
        },
      });
    } catch (mailErr) {
      console.error("[AdminService] Failed to send password reset email:", mailErr.message);
    }

    const response = admin.toJSON();
    delete response.password;
    return {
      admin: response,
      newPassword, // Returned so Super Admin can copy directly
    };
  }

  /**
   * Update Admin Profile (name, email)
   */
  async updateAdminProfile(adminId, profileData) {
    const { firstName, lastName, emailAddress } = profileData;

    const admin = await Admin.findOne({
      where: { id: adminId, isDeleted: false },
    });

    if (!admin) {
      throw new NotFoundError("Admin account not found.");
    }

    const updatePayload = {};
    if (firstName && firstName.trim()) updatePayload.firstName = firstName.trim();
    if (lastName && lastName.trim()) updatePayload.lastName = lastName.trim();
    if (emailAddress && emailAddress.trim()) {
      const cleanEmail = emailAddress.toLowerCase().trim();
      if (cleanEmail !== admin.emailAddress) {
        const existing = await Admin.findOne({
          where: { emailAddress: cleanEmail, isDeleted: false, id: { [Op.ne]: adminId } },
        });
        if (existing) {
          throw new ConflictError("An admin with this email address already exists.");
        }
        updatePayload.emailAddress = cleanEmail;
      }
    }

    await admin.update(updatePayload);

    const response = admin.toJSON();
    delete response.password;
    return response;
  }

  /**
   * Blacklist an Agent with reason
   */
  async blacklistAgent(agentId, bodyData, performingAdminId) {
    const { reason } = bodyData;

    if (!reason || !reason.trim()) {
      throw new BadRequestError("A detailed reason for blacklisting the agent is required.");
    }

    const agent = await PropertyManager.findOne({
      where: { id: agentId, isDeleted: false },
    });

    if (!agent) {
      throw new NotFoundError("Agent/Property Manager account not found.");
    }

    await agent.update({
      isBlacklisted: true,
      blacklistReason: reason.trim(),
      blacklistedAt: new Date(),
      blacklistedBy: performingAdminId || null,
      disableAccount: true,
    });

    return {
      id: agent.id,
      firstName: agent.firstName,
      lastName: agent.lastName,
      companyName: agent.companyName,
      emailAddress: agent.emailAddress,
      tel: agent.tel,
      nin: agent.nin,
      type: agent.type,
      isBlacklisted: agent.isBlacklisted,
      blacklistReason: agent.blacklistReason,
      blacklistedAt: agent.blacklistedAt,
      blacklistedBy: agent.blacklistedBy,
      disableAccount: agent.disableAccount,
    };
  }

  /**
   * Unblacklist an Agent
   */
  async unblacklistAgent(agentId) {
    const agent = await PropertyManager.findOne({
      where: { id: agentId, isDeleted: false },
    });

    if (!agent) {
      throw new NotFoundError("Agent/Property Manager account not found.");
    }

    await agent.update({
      isBlacklisted: false,
      blacklistReason: null,
      blacklistedAt: null,
      blacklistedBy: null,
      disableAccount: false,
    });

    return {
      id: agent.id,
      firstName: agent.firstName,
      lastName: agent.lastName,
      companyName: agent.companyName,
      emailAddress: agent.emailAddress,
      isBlacklisted: agent.isBlacklisted,
      disableAccount: agent.disableAccount,
    };
  }

  /**
   * Get all blacklisted agents with pagination
   */
  async getBlacklistedAgents(queryParams) {
    const { page, limit } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const { count, rows: agents } = await PropertyManager.findAndCountAll({
      where: {
        isBlacklisted: true,
        isDeleted: false,
      },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "companyName",
        "emailAddress",
        "tel",
        "nin",
        "type",
        "state",
        "lga",
        "isBlacklisted",
        "blacklistReason",
        "blacklistedAt",
        "blacklistedBy",
        "disableAccount",
        "createdAt",
      ],
      order: [["blacklistedAt", "DESC"]],
      limit: pageSize,
      offset,
    });

    return formatPaginatedResponse({
      data: agents,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * Admin Directory: Get all Tenants & Prospective Tenants with search & filters
   */
  async getAdminTenants(queryParams) {
    const { search, role, page, limit } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const whereClause = { isDeleted: false };

    if (role) {
      whereClause.role = role;
    }

    if (search) {
      const searchKeyword = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { firstName: { [Op.like]: searchKeyword } },
        { lastName: { [Op.like]: searchKeyword } },
        { emailAddress: { [Op.like]: searchKeyword } },
        { tel: { [Op.like]: searchKeyword } },
        { nin: { [Op.like]: searchKeyword } },
      ];
    }

    const { count, rows: tenants } = await ProspectiveTenant.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Tenant,
          as: "rentalhistory",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: Building,
              attributes: ["id", "propertyPreference", "propertyLocation", "city", "address", "price", "availability"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: true,
    });

    return formatPaginatedResponse({
      data: tenants,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * Admin Directory: Get all Landlords & Agents with search & property summary
   */
  async getAdminLandlordsAndAgents(queryParams) {
    const { search, type, isBlacklisted, page, limit } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const whereClause = { isDeleted: false };

    if (type) {
      whereClause.type = type; // 'landLord', 'agent', 'unset'
    }

    if (typeof isBlacklisted !== "undefined") {
      whereClause.isBlacklisted = isBlacklisted === "true" || isBlacklisted === true;
    }

    if (search) {
      const searchKeyword = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { firstName: { [Op.like]: searchKeyword } },
        { lastName: { [Op.like]: searchKeyword } },
        { companyName: { [Op.like]: searchKeyword } },
        { emailAddress: { [Op.like]: searchKeyword } },
        { tel: { [Op.like]: searchKeyword } },
        { nin: { [Op.like]: searchKeyword } },
      ];
    }

    const { count, rows: managers } = await PropertyManager.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Building,
          as: "propertyManagerBuilding",
          where: { isDeleted: false },
          required: false,
          attributes: ["id", "propertyPreference", "propertyLocation", "city", "availability", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: true,
    });

    // Format managers list with property counts
    const formattedManagers = managers.map((m) => {
      const data = m.toJSON();
      const buildings = data.propertyManagerBuilding || [];
      const vacantCount = buildings.filter((b) => b.availability === "vacant").length;
      const occupiedCount = buildings.filter((b) => b.availability === "occupied").length;
      const bookedCount = buildings.filter((b) => b.availability === "booked").length;

      return {
        ...data,
        summary: {
          totalPropertiesListed: buildings.length,
          vacantPropertiesCount: vacantCount,
          occupiedPropertiesCount: occupiedCount,
          bookedPropertiesCount: bookedCount,
        },
      };
    });

    return formatPaginatedResponse({
      data: formattedManagers,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * Admin Detailed View of a specific Tenant
   */
  async getAdminTenantDetails(tenantId) {
    const tenantUser = await ProspectiveTenant.findOne({
      where: { id: tenantId, isDeleted: false },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Tenant,
          as: "rentalhistory",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: Building,
              attributes: ["id", "propertyPreference", "propertyLocation", "city", "address", "price", "availability"],
              include: [
                {
                  model: PropertyManager,
                  attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel"],
                },
              ],
            },
          ],
        },
        {
          model: Inspection,
          as: "MyInspection",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: Building,
              attributes: ["id", "propertyPreference", "propertyLocation", "city", "address", "price"],
            },
          ],
        },
        {
          model: TenantReview,
          as: "MyBuildingReview",
          required: false,
        },
      ],
    });

    if (!tenantUser) {
      throw new NotFoundError("Tenant record not found.");
    }

    // Retrieve financial transactions
    const transactions = await Transaction.findAll({
      where: { userId: tenantUser.id, isDeleted: false },
      order: [["createdAt", "DESC"]],
    });

    return {
      tenant: tenantUser,
      transactions,
    };
  }

  /**
   * Admin Detailed View of a Landlord or Agent (with listed houses, occupancy status, reviews)
   */
  async getAdminManagerDetails(managerId) {
    const manager = await PropertyManager.findOne({
      where: { id: managerId, isDeleted: false },
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Building,
          as: "propertyManagerBuilding",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: Tenant,
              as: "BuildingTenant",
              where: { isDeleted: false },
              required: false,
              include: [
                {
                  model: ProspectiveTenant,
                  attributes: ["id", "firstName", "lastName", "emailAddress", "tel"],
                },
              ],
            },
            {
              model: TenantReview,
              as: "BuildingReview",
              required: false,
            },
          ],
        },
        {
          model: PropertyManagerReview,
          as: "PropertyManagerReview",
          required: false,
          include: [
            {
              model: ProspectiveTenant,
              attributes: ["id", "firstName", "lastName", "emailAddress"],
            },
          ],
        },
      ],
    });

    if (!manager) {
      throw new NotFoundError("Landlord/Agent record not found.");
    }

    const data = manager.toJSON();
    const buildings = data.propertyManagerBuilding || [];

    const vacantBuildings = buildings.filter((b) => b.availability === "vacant");
    const occupiedBuildings = buildings.filter((b) => b.availability === "occupied");
    const bookedBuildings = buildings.filter((b) => b.availability === "booked");

    return {
      manager: data,
      summary: {
        totalListed: buildings.length,
        vacantCount: vacantBuildings.length,
        occupiedCount: occupiedBuildings.length,
        bookedCount: bookedBuildings.length,
      },
    };
  }

  /**
   * Admin Directory of ALL Buildings/Houses listed on the platform
   */
  async getAdminBuildings(queryParams) {
    const { availability, city, propertyPreference, search, page, limit } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const whereClause = { isDeleted: false };

    if (availability) {
      whereClause.availability = availability; // 'vacant', 'occupied', 'booked'
    }

    if (city) {
      whereClause.city = { [Op.like]: `%${city.trim()}%` };
    }

    if (propertyPreference) {
      whereClause.propertyPreference = { [Op.like]: `%${propertyPreference.trim()}%` };
    }

    if (search) {
      const searchKeyword = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { city: { [Op.like]: searchKeyword } },
        { address: { [Op.like]: searchKeyword } },
        { propertyLocation: { [Op.like]: searchKeyword } },
        { propertyPreference: { [Op.like]: searchKeyword } },
      ];
    }

    const { count, rows: buildings } = await Building.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PropertyManager,
          attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "type", "isBlacklisted"],
        },
        {
          model: Tenant,
          as: "BuildingTenant",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: ProspectiveTenant,
              attributes: ["id", "firstName", "lastName", "emailAddress", "tel"],
            },
          ],
        },
        {
          model: TenantReview,
          as: "BuildingReview",
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: true,
    });

    return formatPaginatedResponse({
      data: buildings,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * Admin Detailed View of a specific Building/House and its Tenant Reviews
   */
  async getAdminBuildingDetails(buildingId) {
    const building = await Building.findOne({
      where: { id: buildingId, isDeleted: false },
      include: [
        {
          model: PropertyManager,
          attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "type", "isBlacklisted", "blacklistReason"],
        },
        {
          model: Tenant,
          as: "BuildingTenant",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: ProspectiveTenant,
              attributes: ["id", "firstName", "lastName", "emailAddress", "tel", "nin", "isNINValid"],
            },
          ],
        },
        {
          model: Inspection,
          as: "BuildingInspection",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: ProspectiveTenant,
              attributes: ["id", "firstName", "lastName", "emailAddress", "tel"],
            },
          ],
        },
        {
          model: TenantReview,
          as: "BuildingReview",
          required: false,
          include: [
            {
              model: ProspectiveTenant,
              attributes: ["id", "firstName", "lastName", "emailAddress"],
            },
          ],
        },
        {
          model: QuitNotice,
          as: "BuildingQuitNotice",
          required: false,
        },
      ],
    });

    if (!building) {
      throw new NotFoundError("Building / House record not found.");
    }

    return building;
  }

  /**
   * Get all properties listed by a specific Landlord or Agent (with pagination and filters)
   */
  async getManagerProperties(managerId, queryParams) {
    const manager = await PropertyManager.findOne({
      where: { id: managerId, isDeleted: false },
      attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "type"],
    });

    if (!manager) {
      throw new NotFoundError("Landlord or Agent not found.");
    }

    const { availability, city, search, page, limit } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const whereClause = { propertyManagerId: managerId, isDeleted: false };

    if (availability) {
      whereClause.availability = availability;
    }

    if (city) {
      whereClause.city = { [Op.like]: `%${city.trim()}%` };
    }

    if (search) {
      const searchKeyword = `%${search.trim()}%`;
      whereClause[Op.or] = [
        { city: { [Op.like]: searchKeyword } },
        { address: { [Op.like]: searchKeyword } },
        { propertyLocation: { [Op.like]: searchKeyword } },
        { propertyPreference: { [Op.like]: searchKeyword } },
      ];
    }

    const { count, rows: buildings } = await Building.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Tenant,
          as: "BuildingTenant",
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: ProspectiveTenant,
              attributes: ["id", "firstName", "lastName", "emailAddress", "tel"],
            },
          ],
        },
        {
          model: TenantReview,
          as: "BuildingReview",
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: true,
    });

    // Summary counts for this specific manager
    const allManagerBuildings = await Building.findAll({
      where: { propertyManagerId: managerId, isDeleted: false },
      attributes: ["availability"],
    });

    const vacantCount = allManagerBuildings.filter((b) => b.availability === "vacant").length;
    const occupiedCount = allManagerBuildings.filter((b) => b.availability === "occupied").length;
    const bookedCount = allManagerBuildings.filter((b) => b.availability === "booked").length;

    return formatPaginatedResponse({
      extra: {
        manager,
        summary: {
          totalListed: allManagerBuildings.length,
          vacantCount,
          occupiedCount,
          bookedCount,
        },
      },
      data: buildings,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * View uploaded Terms & Conditions for a specific Building
   */
  async getBuildingTerms(buildingId) {
    const building = await Building.findOne({
      where: { id: buildingId, isDeleted: false },
      attributes: [
        "id",
        "propertyPreference",
        "city",
        "address",
        "propertyLocation",
        "price",
        "availability",
        "propertyTerms",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: PropertyManager,
          attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "type"],
        },
      ],
    });

    if (!building) {
      throw new NotFoundError("Building / House record not found.");
    }

    return {
      buildingId: building.id,
      propertyPreference: building.propertyPreference,
      city: building.city,
      address: building.address,
      propertyLocation: building.propertyLocation,
      price: building.price,
      availability: building.availability,
      termsAndConditions: building.propertyTerms || "No specific terms & conditions uploaded for this building.",
      uploadedAt: building.updatedAt,
      propertyManager: building.PropertyManager,
    };
  }

  /**
   * Export administrative reports as Excel spreadsheets (.xlsx)
   */
  async exportReportExcel(reportType, queryParams = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "LagProperty Admin System";
    workbook.created = new Date();

    const type = (reportType || "buildings").toLowerCase().trim();

    if (type === "buildings") {
      const sheet = workbook.addWorksheet("Listed Buildings");
      sheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Property Preference", key: "propertyPreference", width: 22 },
        { header: "City", key: "city", width: 18 },
        { header: "Address", key: "address", width: 30 },
        { header: "Location", key: "propertyLocation", width: 25 },
        { header: "Price (NGN)", key: "price", width: 15 },
        { header: "Commission Bill", key: "commissionBill", width: 18 },
        { header: "Availability", key: "availability", width: 15 },
        { header: "Furnishing Status", key: "furnishingStatus", width: 18 },
        { header: "Landlord/Agent Name", key: "managerName", width: 25 },
        { header: "Landlord/Agent Email", key: "managerEmail", width: 25 },
        { header: "Has Uploaded Terms", key: "hasTerms", width: 20 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];

      const buildings = await Building.findAll({
        where: { isDeleted: false },
        include: [{ model: PropertyManager, attributes: ["firstName", "lastName", "emailAddress"] }],
        order: [["createdAt", "DESC"]],
      });

      buildings.forEach((b) => {
        sheet.addRow({
          id: b.id,
          propertyPreference: b.propertyPreference,
          city: b.city,
          address: b.address,
          propertyLocation: b.propertyLocation,
          price: b.price,
          commissionBill: b.commissionBill,
          availability: b.availability,
          furnishingStatus: b.furnishingStatus,
          managerName: b.PropertyManager ? `${b.PropertyManager.firstName} ${b.PropertyManager.lastName}` : "N/A",
          managerEmail: b.PropertyManager ? b.PropertyManager.emailAddress : "N/A",
          hasTerms: b.propertyTerms ? "Yes" : "No",
          createdAt: b.createdAt ? b.createdAt.toISOString().split("T")[0] : "",
        });
      });
    } else if (type === "landlords-agents" || type === "managers") {
      const sheet = workbook.addWorksheet("Landlords & Agents");
      sheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "First Name", key: "firstName", width: 18 },
        { header: "Last Name", key: "lastName", width: 18 },
        { header: "Company Name", key: "companyName", width: 25 },
        { header: "Email Address", key: "emailAddress", width: 28 },
        { header: "Phone Number", key: "tel", width: 18 },
        { header: "NIN", key: "nin", width: 16 },
        { header: "User Type", key: "type", width: 14 },
        { header: "State", key: "state", width: 15 },
        { header: "LGA", key: "lga", width: 15 },
        { header: "Blacklisted", key: "isBlacklisted", width: 14 },
        { header: "Blacklist Reason", key: "blacklistReason", width: 30 },
        { header: "Account Status", key: "status", width: 15 },
        { header: "Registered Date", key: "createdAt", width: 20 },
      ];

      const managers = await PropertyManager.findAll({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
      });

      managers.forEach((m) => {
        sheet.addRow({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          companyName: m.companyName || "N/A",
          emailAddress: m.emailAddress,
          tel: m.tel || "N/A",
          nin: m.nin || "N/A",
          type: m.type,
          state: m.state || "N/A",
          lga: m.lga || "N/A",
          isBlacklisted: m.isBlacklisted ? "Yes" : "No",
          blacklistReason: m.blacklistReason || "N/A",
          status: m.disableAccount ? "Disabled" : "Active",
          createdAt: m.createdAt ? m.createdAt.toISOString().split("T")[0] : "",
        });
      });
    } else if (type === "tenants") {
      const sheet = workbook.addWorksheet("Tenants");
      sheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "First Name", key: "firstName", width: 18 },
        { header: "Last Name", key: "lastName", width: 18 },
        { header: "Email Address", key: "emailAddress", width: 28 },
        { header: "Phone Number", key: "tel", width: 18 },
        { header: "NIN", key: "nin", width: 16 },
        { header: "NIN Validated", key: "isNINValid", width: 15 },
        { header: "Gender", key: "gender", width: 12 },
        { header: "Occupation", key: "occupation", width: 20 },
        { header: "Account Status", key: "status", width: 15 },
        { header: "Registered Date", key: "createdAt", width: 20 },
      ];

      const tenants = await ProspectiveTenant.findAll({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
      });

      tenants.forEach((t) => {
        sheet.addRow({
          id: t.id,
          firstName: t.firstName,
          lastName: t.lastName,
          emailAddress: t.emailAddress,
          tel: t.tel || "N/A",
          nin: t.nin || "N/A",
          isNINValid: t.isNINValid ? "Yes" : "No",
          gender: t.gender || "N/A",
          occupation: t.occupation || "N/A",
          status: t.disableAccount ? "Disabled" : "Active",
          createdAt: t.createdAt ? t.createdAt.toISOString().split("T")[0] : "",
        });
      });
    } else if (type === "transactions") {
      const sheet = workbook.addWorksheet("Transactions");
      sheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "User ID", key: "userId", width: 12 },
        { header: "Amount (NGN)", key: "amount", width: 16 },
        { header: "Transaction Type", key: "transactionType", width: 20 },
        { header: "Payment Status", key: "paymentStatus", width: 18 },
        { header: "Payment Ref", key: "paymentReference", width: 25 },
        { header: "Building ID", key: "buildingId", width: 14 },
        { header: "Date", key: "createdAt", width: 20 },
      ];

      const transactions = await Transaction.findAll({
        where: { isDeleted: false },
        order: [["createdAt", "DESC"]],
      });

      transactions.forEach((tx) => {
        sheet.addRow({
          id: tx.id,
          userId: tx.userId,
          amount: tx.amount,
          transactionType: tx.transactionType,
          paymentStatus: tx.paymentStatus,
          paymentReference: tx.paymentReference || "N/A",
          buildingId: tx.buildingId || "N/A",
          createdAt: tx.createdAt ? tx.createdAt.toISOString().split("T")[0] : "",
        });
      });
    } else if (type === "blacklisted-agents") {
      const sheet = workbook.addWorksheet("Blacklisted Agents");
      sheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "First Name", key: "firstName", width: 18 },
        { header: "Last Name", key: "lastName", width: 18 },
        { header: "Company Name", key: "companyName", width: 25 },
        { header: "Email Address", key: "emailAddress", width: 28 },
        { header: "Phone", key: "tel", width: 18 },
        { header: "NIN", key: "nin", width: 16 },
        { header: "Blacklist Reason", key: "blacklistReason", width: 35 },
        { header: "Blacklisted Date", key: "blacklistedAt", width: 22 },
        { header: "Blacklisted By (Admin ID)", key: "blacklistedBy", width: 22 },
      ];

      const blacklisted = await PropertyManager.findAll({
        where: { isBlacklisted: true, isDeleted: false },
        order: [["blacklistedAt", "DESC"]],
      });

      blacklisted.forEach((b) => {
        sheet.addRow({
          id: b.id,
          firstName: b.firstName,
          lastName: b.lastName,
          companyName: b.companyName || "N/A",
          emailAddress: b.emailAddress,
          tel: b.tel || "N/A",
          nin: b.nin || "N/A",
          blacklistReason: b.blacklistReason || "N/A",
          blacklistedAt: b.blacklistedAt ? b.blacklistedAt.toISOString().split("T")[0] : "",
          blacklistedBy: b.blacklistedBy || "N/A",
        });
      });
    } else {
      throw new BadRequestError(
        `Invalid report type '${reportType}'. Supported types: 'buildings', 'landlords-agents', 'tenants', 'transactions', 'blacklisted-agents'`
      );
    }

    // Style Header Row
    const worksheet = workbook.getWorksheet(1);
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E293B" },
    };

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Send Push Notification to targeted user groups (agent, landlord, prospective tenant, tenant, all, or array of types)
   */
  async sendTargetedNotifications(bodyData) {
    const { targetGroup, title, message, buildingId } = bodyData;

    if (!targetGroup) {
      throw new BadRequestError("targetGroup is required. Allowed values: 'agent', 'landLord', 'tenant', 'prospective_tenant', 'all', or an array of these.");
    }

    if (!message || !message.trim()) {
      throw new BadRequestError("Notification message is required.");
    }

    const targets = Array.isArray(targetGroup)
      ? targetGroup.map((t) => String(t).trim())
      : String(targetGroup)
          .split(",")
          .map((t) => t.trim());

    const isAll = targets.includes("all");
    const includeAgent = isAll || targets.includes("agent");
    const includeLandlord = isAll || targets.includes("landLord") || targets.includes("landlord");
    const includeTenant = isAll || targets.includes("tenant") || targets.includes("prospective_tenant");

    let managerTypes = [];
    if (includeAgent) managerTypes.push("agent");
    if (includeLandlord) managerTypes.push("landLord");

    let recipientManagers = [];
    if (managerTypes.length > 0) {
      recipientManagers = await PropertyManager.findAll({
        where: {
          type: { [Op.in]: managerTypes },
          disableAccount: false,
          isDeleted: false,
        },
        attributes: ["id", "emailAddress", "firstName", "lastName", "type", "fcmToken"],
      });
    }

    let recipientTenants = [];
    if (includeTenant) {
      recipientTenants = await ProspectiveTenant.findAll({
        where: {
          disableAccount: false,
          isDeleted: false,
        },
        attributes: ["id", "emailAddress", "firstName", "lastName", "role", "fcmToken"],
      });
    }

    const notificationRecords = [];
    const fcmTokens = [];

    // Create DB notifications for managers
    for (const manager of recipientManagers) {
      notificationRecords.push({
        userId: manager.id,
        notificationFor: "list",
        type: "discount",
        message: title ? `${title}: ${message}` : message,
        buildingId: buildingId || null,
      });

      if (manager.fcmToken && manager.fcmToken.trim()) {
        fcmTokens.push(manager.fcmToken.trim());
      }
    }

    // Create DB notifications for tenants
    for (const tenant of recipientTenants) {
      notificationRecords.push({
        userId: tenant.id,
        notificationFor: "rent",
        type: "discount",
        message: title ? `${title}: ${message}` : message,
        buildingId: buildingId || null,
      });

      if (tenant.fcmToken && tenant.fcmToken.trim()) {
        fcmTokens.push(tenant.fcmToken.trim());
      }
    }

    if (notificationRecords.length > 0) {
      await Notification.bulkCreate(notificationRecords);
    }

    // Dispatch FCM Push Notifications in scheduled/throttled batches
    let pushResult = { total: 0, successCount: 0, failureCount: 0 };
    if (fcmTokens.length > 0) {
      pushResult = await sendBatchedPushNotifications({
        tokens: fcmTokens,
        title: title || "System Announcement",
        body: message,
        data: {
          buildingId: buildingId || "",
          type: "system_announcement",
        },
        batchSize: 100,
        delayMs: 200,
      });
    }

    const totalRecipients = recipientManagers.length + recipientTenants.length;

    return {
      targetedGroups: targets,
      title: title || "System Announcement",
      message,
      summary: {
        totalRecipients,
        landlordsAndAgentsCount: recipientManagers.length,
        tenantsCount: recipientTenants.length,
        notificationsDispatched: notificationRecords.length,
        pushNotificationsSent: pushResult.successCount,
        pushNotificationsFailed: pushResult.failureCount,
      },
    };
  }
}

export default new AdminService();
