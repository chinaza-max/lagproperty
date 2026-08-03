import { Router } from "express";
import adminController from "../controllers/admin/admin.controller.js";
import rbacMiddleware from "../middlewares/rbac.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Admin Directory & Management
 *   description: Comprehensive Admin APIs for managing Tenants, Landlords, Agents, Listed Buildings, and Reviews
 */

const router = Router();

// Protect all admin routes with Admin RBAC
router.use(rbacMiddleware.requireAdmin);

// Admin Account Management
router.post("/create", rbacMiddleware.requireAdminRole("super_admin"), adminController.createAdmin);
router.get("/list", rbacMiddleware.requireAdminRole("super_admin", "support_admin"), adminController.getAllAdmins);
router.patch("/:id/role", rbacMiddleware.requireAdminRole("super_admin"), adminController.updateAdminRole);
router.patch("/:id/status", rbacMiddleware.requireAdminRole("super_admin"), adminController.toggleAdminStatus);

// User Directory (Tenants, Landlords & Agents)
router.get(
  "/users/tenants",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getTenants
);
router.get(
  "/users/landlords-agents",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getLandlordsAndAgents
);
router.get(
  "/users/tenant-details/:id",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getTenantDetails
);
router.get(
  "/users/manager-details/:id",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getManagerDetails
);
router.get(
  "/users/manager-properties/:managerId",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getManagerProperties
);

// Listed Buildings / Houses & Reviews Directory
router.get(
  "/buildings/all",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "property_admin"),
  adminController.getBuildings
);
router.get(
  "/buildings/:id/details",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "property_admin"),
  adminController.getBuildingDetails
);
router.get(
  "/buildings/:id/terms",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "property_admin"),
  adminController.getBuildingTerms
);

// Reports & Export
router.get(
  "/reports/export",
  rbacMiddleware.requireAdminRole("super_admin", "finance_admin", "compliance_admin", "property_admin"),
  adminController.exportReportExcel
);

// Push Notifications
router.post(
  "/notifications/send",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin"),
  adminController.sendTargetedNotifications
);

// Agent Blacklisting
router.post(
  "/agents/:id/blacklist",
  rbacMiddleware.requireAdminRole("super_admin", "compliance_admin"),
  adminController.blacklistAgent
);
router.post(
  "/agents/:id/unblacklist",
  rbacMiddleware.requireAdminRole("super_admin", "compliance_admin"),
  adminController.unblacklistAgent
);
router.get(
  "/agents/blacklisted",
  rbacMiddleware.requireAdminRole("super_admin", "compliance_admin", "support_admin"),
  adminController.getBlacklistedAgents
);

export default router;
