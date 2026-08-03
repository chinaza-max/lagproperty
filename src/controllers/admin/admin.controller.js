import adminService from "../../service/admin.service.js";

class AdminController {
  /**
   * POST /api/v1/admin/create
   * Create a new Admin with role and privileges
   */
  async createAdmin(req, res, next) {
    try {
      const result = await adminService.createAdmin(req.body);
      return res.status(201).json({
        status: 201,
        message: "Admin account created successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/list
   * Get all admins (paginated)
   */
  async getAllAdmins(req, res, next) {
    try {
      const result = await adminService.getAllAdmins(req.query);
      return res.status(200).json({
        status: 200,
        message: "Admin list fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/:id/role
   * Update admin role and privileges
   */
  async updateAdminRole(req, res, next) {
    try {
      const result = await adminService.updateAdminRole(req.params.id, req.body);
      return res.status(200).json({
        status: 200,
        message: "Admin role/privileges updated successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/:id/status
   * Enable or disable admin account
   */
  async toggleAdminStatus(req, res, next) {
    try {
      const result = await adminService.toggleAdminStatus(req.params.id, req.body);
      return res.status(200).json({
        status: 200,
        message: "Admin status toggled successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * POST /api/v1/admin/agents/:id/blacklist
   * Blacklist an agent and record reason
   */
  async blacklistAgent(req, res, next) {
    try {
      const performingAdminId = req.user ? req.user.id : null;
      const result = await adminService.blacklistAgent(req.params.id, req.body, performingAdminId);
      return res.status(200).json({
        status: 200,
        message: "Agent has been blacklisted successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * POST /api/v1/admin/agents/:id/unblacklist
   * Unblacklist an agent
   */
  async unblacklistAgent(req, res, next) {
    try {
      const result = await adminService.unblacklistAgent(req.params.id);
      return res.status(200).json({
        status: 200,
        message: "Agent blacklisting has been revoked.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/agents/blacklisted
   * Get all blacklisted agents with pagination
   */
  async getBlacklistedAgents(req, res, next) {
    try {
      const result = await adminService.getBlacklistedAgents(req.query);
      return res.status(200).json({
        status: 200,
        message: "Blacklisted agents retrieved successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/tenants
   * Get all tenants & prospective tenants with search, filter, and rental status
   */
  async getTenants(req, res, next) {
    try {
      const result = await adminService.getAdminTenants(req.query);
      return res.status(200).json({
        status: 200,
        message: "Tenants list fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/landlords-agents
   * Get all landlords and agents with listed buildings breakdown
   */
  async getLandlordsAndAgents(req, res, next) {
    try {
      const result = await adminService.getAdminLandlordsAndAgents(req.query);
      return res.status(200).json({
        status: 200,
        message: "Landlords and agents list fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/tenant-details/:id
   * Complete detail view of a tenant (profile, rented houses, inspections, transactions)
   */
  async getTenantDetails(req, res, next) {
    try {
      const data = await adminService.getAdminTenantDetails(req.params.id);
      return res.status(200).json({
        status: 200,
        message: "Tenant details fetched successfully.",
        data,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/manager-details/:id
   * Complete detail view of a landlord or agent (profile, listed houses, availability, reviews)
   */
  async getManagerDetails(req, res, next) {
    try {
      const data = await adminService.getAdminManagerDetails(req.params.id);
      return res.status(200).json({
        status: 200,
        message: "Landlord/Agent details fetched successfully.",
        data,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/buildings/all
   * Directory of all listed houses/buildings with availability status and owner details
   */
  async getBuildings(req, res, next) {
    try {
      const result = await adminService.getAdminBuildings(req.query);
      return res.status(200).json({
        status: 200,
        message: "Buildings list fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/buildings/:id/details
   * Comprehensive detailed view of a building (specs, owner, tenants, inspections, reviews)
   */
  async getBuildingDetails(req, res, next) {
    try {
      const data = await adminService.getAdminBuildingDetails(req.params.id);
      return res.status(200).json({
        status: 200,
        message: "Building details fetched successfully.",
        data,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/users/manager-properties/:managerId
   * List all properties listed by a specific Landlord or Agent (with pagination)
   */
  async getManagerProperties(req, res, next) {
    try {
      const result = await adminService.getManagerProperties(req.params.managerId, req.query);
      return res.status(200).json({
        status: 200,
        message: "Landlord/Agent listed properties retrieved successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/buildings/:id/terms
   * View uploaded Terms & Conditions for a building
   */
  async getBuildingTerms(req, res, next) {
    try {
      const data = await adminService.getBuildingTerms(req.params.id);
      return res.status(200).json({
        status: 200,
        message: "Building uploaded terms and conditions fetched successfully.",
        data,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/reports/export
   * Export administrative reports as an Excel file (.xlsx)
   */
  async exportReportExcel(req, res, next) {
    try {
      const reportType = req.query.type || "buildings";
      const buffer = await adminService.exportReportExcel(reportType, req.query);

      const filename = `${reportType}_report_${Date.now()}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      return res.status(200).send(buffer);
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * POST /api/v1/admin/notifications/send
   * Send targeted push notifications to agents, landlords, tenants, or all users
   */
  async sendTargetedNotifications(req, res, next) {
    try {
      const result = await adminService.sendTargetedNotifications(req.body);
      return res.status(200).json({
        status: 200,
        message: "Targeted push notifications dispatched successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

export default new AdminController();
