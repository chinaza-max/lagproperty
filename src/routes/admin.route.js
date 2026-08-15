import { Router } from "express";
import adminController from "../controllers/admin/admin.controller.js";
import complaintController from "../controllers/complaint.controller.js";
import rbacMiddleware from "../middlewares/rbac.middleware.js";
import uploadHandler from "../middlewares/upload.middleware.js";

/**
 * @swagger
 * tags:
 *   - name: Admin Directory & Management
 *     description: Comprehensive Admin APIs for managing Tenants, Landlords, Agents, Listed Buildings, and Reviews
 *   - name: Admin Complaints & Support Chat
 *     description: Admin APIs for reviewing reported agents/landlords, responding via chat threads, and resolving tickets.
 */

const router = Router();

// Protect all admin routes with Admin RBAC
router.use(rbacMiddleware.requireAdmin);

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new Admin user account
 *     description: Creates an admin account with specified role & privileges and sends login credential email to the admin.
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - emailAddress
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Admin
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 example: jane.admin@lagproperty.com
 *               password:
 *                 type: string
 *                 example: SecureAdminPass123!
 *               role:
 *                 type: string
 *                 example: support_admin
 *               privilege:
 *                 type: string
 *                 example: all
 *     responses:
 *       201:
 *         description: Admin account created successfully and credential email sent.
 *       400:
 *         description: Missing required fields or bad input.
 *       409:
 *         description: Admin with email address already exists.
 */
router.post("/create", rbacMiddleware.requireAdminRole("super_admin"), adminController.createAdmin);

/**
 * @swagger
 * /admin/list:
 *   get:
 *     summary: Get all admin users with pagination
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of admin users.
 */
router.get("/list", rbacMiddleware.requireAdminRole("super_admin", "support_admin"), adminController.getAllAdmins);

/**
 * @swagger
 * /admin/{id}/role:
 *   patch:
 *     summary: Update admin role and privileges
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               privilege:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin role/privileges updated successfully.
 */
router.patch("/:id/role", rbacMiddleware.requireAdminRole("super_admin"), adminController.updateAdminRole);

/**
 * @swagger
 * /admin/{id}/status:
 *   patch:
 *     summary: Toggle enable/disable status of an admin account
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disableAccount:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Admin status toggled successfully.
 */
router.patch("/:id/status", rbacMiddleware.requireAdminRole("super_admin"), adminController.toggleAdminStatus);

/**
 * @swagger
 * /admin/fcm-token:
 *   patch:
 *     summary: Update FCM push notification token for logged-in admin
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcmToken
 *             properties:
 *               fcmToken:
 *                 type: string
 *                 example: eK3xP9...fcm_token_string
 *     responses:
 *       200:
 *         description: Admin FCM push token updated successfully.
 */
router.patch("/fcm-token", adminController.updateFcmToken);

/**
 * @swagger
 * /admin/{id}:
 *   delete:
 *     summary: Delete an Admin user account
 *     description: Soft deletes an admin user account by ID. Action restricted to Super Admins.
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique ID of the admin account to delete
 *     responses:
 *       200:
 *         description: Admin account deleted successfully.
 *       400:
 *         description: Cannot delete your own admin account.
 *       404:
 *         description: Admin account not found.
 */
router.delete("/:id", rbacMiddleware.requireAdminRole("super_admin"), adminController.deleteAdmin);

/**
 * @swagger
 * /admin/change-password:
 *   patch:
 *     summary: Logged-in admin changes their own password
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "Admin@1234"
 *               newPassword:
 *                 type: string
 *                 example: "NewAdminPass@2026"
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       400:
 *         description: Incorrect old password or validation error.
 */
router.patch("/change-password", adminController.changeAdminPassword);

/**
 * @swagger
 * /admin/{id}/reset-password:
 *   patch:
 *     summary: Super Admin resets an admin account password
 *     description: Resets an admin's password and dispatches an email notification with new credentials.
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target Admin ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: "ResetPass@9876"
 *                 description: Optional. If omitted, a secure random password is auto-generated.
 *     responses:
 *       200:
 *         description: Admin password reset successfully and notification email sent.
 */
router.patch("/:id/reset-password", rbacMiddleware.requireAdminRole("super_admin"), adminController.resetAdminPassword);

/**
 * @swagger
 * /admin/profile:
 *   patch:
 *     summary: Admin updates login profile details (first name, last name, email)
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Super"
 *               lastName:
 *                 type: string
 *                 example: "Admin"
 *               emailAddress:
 *                 type: string
 *                 example: "super.admin@lagproperty.com"
 *     responses:
 *       200:
 *         description: Admin profile updated successfully.
 */
router.patch("/profile", adminController.updateAdminProfile);

/**
 * @swagger
 * /admin/users/tenants:
 *   get:
 *     summary: Get all tenants & prospective tenants (paginated with search)
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, tel, or NIN
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated tenant directory list.
 */
router.get(
  "/users/tenants",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getTenants
);

/**
 * @swagger
 * /admin/users/landlords-agents:
 *   get:
 *     summary: Get all landlords and agents with property listing counts
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [landLord, agent, unset]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isBlacklisted
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated landlords & agents list with property summary counts.
 */
router.get(
  "/users/landlords-agents",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getLandlordsAndAgents
);

/**
 * @swagger
 * /admin/users/tenant-details/{id}:
 *   get:
 *     summary: Get detailed tenant profile, rental history & transactions
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tenant detailed profile.
 */
router.get(
  "/users/tenant-details/:id",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getTenantDetails
);

/**
 * @swagger
 * /admin/users/manager-details/{id}:
 *   get:
 *     summary: Get detailed landlord/agent profile with listed properties & reviews
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Landlord/Agent detailed profile.
 */
router.get(
  "/users/manager-details/:id",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getManagerDetails
);

/**
 * @swagger
 * /admin/users/manager-properties/{managerId}:
 *   get:
 *     summary: Get all buildings listed by a specific landlord/agent
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: managerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of buildings managed by property manager.
 */
router.get(
  "/users/manager-properties/:managerId",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin", "property_admin"),
  adminController.getManagerProperties
);

/**
 * @swagger
 * /admin/buildings/all:
 *   get:
 *     summary: Get all listed buildings/houses across platform
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [vacant, occupied, booked]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated building directory list.
 */
router.get(
  "/buildings/all",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "property_admin"),
  adminController.getBuildings
);

/**
 * @swagger
 * /admin/buildings/{id}/details:
 *   get:
 *     summary: Get detailed building info, landlord info, tenant info & reviews
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Building details.
 */
router.get(
  "/buildings/:id/details",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "property_admin"),
  adminController.getBuildingDetails
);

/**
 * @swagger
 * /admin/buildings/{id}/terms:
 *   get:
 *     summary: Get property terms document file for a building
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Property terms document.
 */
router.get(
  "/buildings/:id/terms",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "property_admin"),
  adminController.getBuildingTerms
);

/**
 * @swagger
 * /admin/reports/export:
 *   get:
 *     summary: Export comprehensive system Excel report (Tenants, Agents, Buildings, Transactions, Complaints)
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns Excel file download stream (.xlsx).
 */
router.get(
  "/reports/export",
  rbacMiddleware.requireAdminRole("super_admin", "finance_admin", "compliance_admin", "property_admin"),
  adminController.exportReportExcel
);

/**
 * @swagger
 * /admin/notifications/send:
 *   post:
 *     summary: Send targeted push notifications to user groups
 *     description: Sends in-app DB notifications and batched FCM push notifications to targeted groups (agent, landlord, tenant, or all).
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetGroup
 *               - message
 *             properties:
 *               targetGroup:
 *                 type: string
 *                 example: "all"
 *                 description: "Allowed: agent, landLord, tenant, prospective_tenant, all, or array of these"
 *               title:
 *                 type: string
 *                 example: "Platform Maintenance Notice"
 *               message:
 *                 type: string
 *                 example: "Scheduled maintenance will occur tonight at 12:00 AM."
 *               buildingId:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Targeted push notifications dispathed successfully.
 */
router.post(
  "/notifications/send",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin"),
  adminController.sendTargetedNotifications
);

/**
 * @swagger
 * /admin/agents/{id}/blacklist:
 *   post:
 *     summary: Blacklist an agent or landlord account
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Multiple verified fraud complaints filed by tenants."
 *     responses:
 *       200:
 *         description: Agent blacklisted successfully.
 */
router.post(
  "/agents/:id/blacklist",
  rbacMiddleware.requireAdminRole("super_admin", "compliance_admin"),
  adminController.blacklistAgent
);

/**
 * @swagger
 * /admin/agents/{id}/unblacklist:
 *   post:
 *     summary: Remove blacklisting from an agent/landlord account
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Agent unblacklisted successfully.
 */
router.post(
  "/agents/:id/unblacklist",
  rbacMiddleware.requireAdminRole("super_admin", "compliance_admin"),
  adminController.unblacklistAgent
);

/**
 * @swagger
 * /admin/agents/blacklisted:
 *   get:
 *     summary: Get all blacklisted agents with pagination
 *     tags:
 *       - Admin Directory & Management
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of blacklisted agents.
 */
router.get(
  "/agents/blacklisted",
  rbacMiddleware.requireAdminRole("super_admin", "compliance_admin", "support_admin"),
  adminController.getBlacklistedAgents
);

// ==========================================
// Admin Complaints, Reports & Support Chat
// ==========================================

/**
 * @swagger
 * /admin/complaints/all:
 *   get:
 *     summary: List all user complaints & reports against agents/landlords
 *     description: Retrieve paginated list of complaints filed by users with status & category filters.
 *     tags:
 *       - Admin Complaints & Support Chat
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, resolved, dismissed]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated list of complaints.
 */
router.get(
  "/complaints/all",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin"),
  complaintController.getAllComplaintsAdmin
);

/**
 * @swagger
 * /admin/complaints/{id}:
 *   get:
 *     summary: View detailed complaint ticket & complete chat thread
 *     description: View full reporter details, reported manager details, property details, and complete message thread.
 *     tags:
 *       - Admin Complaints & Support Chat
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Complaint ticket details and message thread history.
 */
router.get(
  "/complaints/:id",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin"),
  complaintController.getComplaintDetailsAdmin
);

/**
 * @swagger
 * /admin/complaints/{id}/messages:
 *   post:
 *     summary: Admin reply in complaint chat thread
 *     description: Posts an admin response in the 2-way complaint chat thread and automatically dispatches in-app and FCM push notifications directly to the user.
 *     tags:
 *       - Admin Complaints & Support Chat
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Complaint Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "We have reviewed your report and contacted the agent for justification. Your refund is being processed."
 *               updateStatus:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, dismissed]
 *                 example: "in_progress"
 *                 description: Optional status update to apply simultaneously
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload up to 10 file attachments
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "We have reviewed your report and contacted the agent for justification. Your refund is being processed."
 *               updateStatus:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, dismissed]
 *                 example: "in_progress"
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://res.cloudinary.com/example/resolution.jpg"]
 *     responses:
 *       201:
 *         description: Admin reply posted successfully and push notification dispatched to user.
 *       400:
 *         description: Message content is required.
 *       404:
 *         description: Complaint ticket not found.
 */
router.post(
  "/complaints/:id/messages",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin"),
  uploadHandler.image.array("attachments", 10),
  complaintController.addAdminMessage
);

/**
 * @swagger
 * /admin/complaints/{id}/status:
 *   patch:
 *     summary: Admin update complaint resolution status
 *     tags:
 *       - Admin Complaints & Support Chat
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, resolved, dismissed]
 *                 example: "resolved"
 *     responses:
 *       200:
 *         description: Complaint status updated successfully.
 */
router.patch(
  "/complaints/:id/status",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin"),
  complaintController.updateComplaintStatusAdmin
);

/**
 * @swagger
 * /admin/notification-events:
 *   get:
 *     summary: Fetch system notification event dictionary mapper list
 *     tags:
 *       - Admin Complaints & Support Chat
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns dictionary of all push notification events for frontend integration.
 */
router.get(
  "/notification-events",
  rbacMiddleware.requireAdminRole("super_admin", "support_admin", "compliance_admin"),
  complaintController.getNotificationEvents
);

export default router;
