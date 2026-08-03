import { Router } from "express";
import analyticsController from "../controllers/admin/analytics.controller.js";
import rbacMiddleware from "../middlewares/rbac.middleware.js";

/**
 * @swagger
 * tags:
 *   name: Analytics Dashboard
 *   description: System analytics, location stats, NIN transaction lookup, and overview KPIs
 */

/**
 * @swagger
 * /analytics/nin-transactions:
 *   get:
 *     summary: Look up user transaction information and financial stats by NIN
 *     tags: [Analytics Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nin
 *         required: true
 *         schema:
 *           type: string
 *         description: User's National Identification Number (NIN)
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [tenant, landlord, agent]
 *         description: Optional role filter
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
 *         description: Transaction list, total spent/received summary, and user profile data.
 *       400:
 *         description: Missing NIN parameter.
 *       404:
 *         description: User with NIN not found.
 */

/**
 * @swagger
 * /analytics/housing-by-location:
 *   get:
 *     summary: Get property listing counts and agent/landlord distribution per location/area
 *     tags: [Analytics Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city name
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state/location name
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
 *         description: Paginated location housing analytics.
 */

/**
 * @swagger
 * /analytics/dashboard-overview:
 *   get:
 *     summary: Retrieve system overview KPIs (Users, Properties, Financials)
 *     tags: [Analytics Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics summary overview.
 */

/**
 * @swagger
 * /analytics/property-distribution:
 *   get:
 *     summary: Retrieve breakdown of property preferences and price range statistics
 *     tags: [Analytics Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property type distribution details.
 */

const router = Router();

// Protect analytics with Admin authentication
router.use(rbacMiddleware.requireAdmin);

router.get("/nin-transactions", analyticsController.getUserNINTransactions);
router.get("/housing-by-location", analyticsController.getHousingByLocation);
router.get("/dashboard-overview", analyticsController.getDashboardOverview);
router.get("/property-distribution", analyticsController.getPropertyTypesDistribution);

export default router;
