import complaintService from "../service/complaint.service.js";
import { getNotificationEventsList } from "../utils/notificationEvents.js";

class ComplaintController {
  /**
   * POST /api/v1/user/complaints/create
   * File a report/complaint against an agent, landlord, or building
   */
  async createComplaint(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role || req.user.type;
      const files = req.files || (req.file ? [req.file] : []);
      const bodyData = {
        ...req.body,
        files,
      };
      const result = await complaintService.createComplaint(userId, userRole, bodyData);
      return res.status(201).json({
        status: 201,
        message: "Report/Complaint filed successfully. Support admin team has been notified.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/user/complaints/my-complaints
   * Get list of complaints filed by the current user
   */
  async getUserComplaints(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await complaintService.getUserComplaints(userId, req.query);
      return res.status(200).json({
        status: 200,
        message: "Complaints fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/user/complaints/:id
   * User detailed view of a complaint ticket with chat history
   */
  async getComplaintDetailsUser(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await complaintService.getComplaintDetails(req.params.id, userId, false);
      return res.status(200).json({
        status: 200,
        message: "Complaint ticket details fetched successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * POST /api/v1/user/complaints/:id/messages
   * User posts a message/reply in the complaint chat thread
   */
  async addUserMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role || req.user.type;
      const files = req.files || (req.file ? [req.file] : []);
      const bodyData = {
        ...req.body,
        files,
      };
      const result = await complaintService.addUserMessage(req.params.id, userId, userRole, bodyData);
      return res.status(201).json({
        status: 201,
        message: "Reply posted successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/complaints/all
   * Admin lists all complaints (with filters)
   */
  async getAllComplaintsAdmin(req, res, next) {
    try {
      const result = await complaintService.getAllComplaintsAdmin(req.query);
      return res.status(200).json({
        status: 200,
        message: "Complaints list fetched successfully.",
        ...result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/admin/complaints/:id
   * Admin detailed view of a complaint ticket with full chat history
   */
  async getComplaintDetailsAdmin(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await complaintService.getComplaintDetails(req.params.id, adminId, true);
      return res.status(200).json({
        status: 200,
        message: "Complaint ticket details fetched successfully for admin.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * POST /api/v1/admin/complaints/:id/messages
   * Admin replies in the complaint chat thread
   */
  async addAdminMessage(req, res, next) {
    try {
      const adminId = req.user.id;
      const files = req.files || (req.file ? [req.file] : []);
      const bodyData = {
        ...req.body,
        files,
      };
      const result = await complaintService.addAdminMessage(req.params.id, adminId, bodyData);
      return res.status(201).json({
        status: 201,
        message: "Admin response posted successfully and user notified.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/complaints/:id/status
   * Admin updates status of complaint ticket
   */
  async updateComplaintStatusAdmin(req, res, next) {
    try {
      const adminId = req.user.id;
      const result = await complaintService.updateComplaintStatusAdmin(req.params.id, adminId, req.body);
      return res.status(200).json({
        status: 200,
        message: "Complaint status updated successfully.",
        data: result,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * GET /api/v1/notifications/events
   * Fetch notification event dictionary list for frontend developers
   */
  getNotificationEvents(req, res, next) {
    try {
      const events = getNotificationEventsList();
      return res.status(200).json({
        status: 200,
        message: "Notification event dictionary fetched successfully.",
        data: events,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
}

export default new ComplaintController();
