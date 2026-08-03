import analyticsService from "../../service/analytics.service.js";

class AnalyticsController {
  /**
   * GET /api/v1/analytics/nin-transactions
   * Search transactions, spent/received totals, and activity by user NIN
   */
  async getUserNINTransactions(req, res, next) {
    try {
      const result = await analyticsService.getTransactionsByUserNIN(req.query);

      return res.status(200).json({
        status: 200,
        message: "User NIN transaction data fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/analytics/housing-by-location
   * Housing and landlord/agent distribution per area or city
   */
  async getHousingByLocation(req, res, next) {
    try {
      const result = await analyticsService.getHousingByLocationAnalytics(req.query);

      return res.status(200).json({
        status: 200,
        message: "Housing location analytics fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/analytics/dashboard-overview
   * Summary overview KPI metrics for system dashboard
   */
  async getDashboardOverview(req, res, next) {
    try {
      const data = await analyticsService.getDashboardOverviewAnalytics();

      return res.status(200).json({
        status: 200,
        message: "Dashboard overview metrics retrieved successfully.",
        data,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/analytics/property-distribution
   * Property preference distribution and price stats
   */
  async getPropertyTypesDistribution(req, res, next) {
    try {
      const data = await analyticsService.getPropertyTypesDistribution();

      return res.status(200).json({
        status: 200,
        message: "Property distribution analytics retrieved successfully.",
        data,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

export default new AnalyticsController();
