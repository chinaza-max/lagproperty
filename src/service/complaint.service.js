import {
  Complaint,
  ComplaintMessage,
  PropertyManager,
  ProspectiveTenant,
  Admin,
  Building,
  Notification,
} from "../db/models/index.js";
import { NotFoundError, BadRequestError, ForbiddenError } from "../errors/index.js";
import { getPaginationParams, formatPaginatedResponse } from "../utils/pagination.util.js";
import { sendPushNotification } from "../config/firebase.js";
import serverConfig from "../config/server.js";

function processAttachments(files = [], bodyAttachments = null) {
  const attachmentUrls = [];

  if (Array.isArray(files) && files.length > 0) {
    for (const file of files) {
      if (file.filename) {
        attachmentUrls.push(`${serverConfig.DOMAIN}/images/${file.filename}`);
      } else if (file.path) {
        const cleanPath = file.path.replace(/\\/g, "/").replace(/^public\//, "").replace(/^\/public\//, "");
        attachmentUrls.push(`${serverConfig.DOMAIN}/${cleanPath}`);
      }
    }
  }

  if (bodyAttachments) {
    if (Array.isArray(bodyAttachments)) {
      attachmentUrls.push(...bodyAttachments);
    } else if (typeof bodyAttachments === "string") {
      try {
        const parsed = JSON.parse(bodyAttachments);
        if (Array.isArray(parsed)) {
          attachmentUrls.push(...parsed);
        } else {
          attachmentUrls.push(bodyAttachments);
        }
      } catch (e) {
        attachmentUrls.push(bodyAttachments);
      }
    }
  }

  const uniqueUrls = [...new Set(attachmentUrls.filter(Boolean))];
  return uniqueUrls.length > 0 ? JSON.stringify(uniqueUrls) : null;
}

class ComplaintService {
  /**
   * User files a report/complaint against an Agent, Landlord, or Building
   */
  async createComplaint(userId, userRole, bodyData) {
    const { reportedAgentOrLandlordId, buildingId, category, subject, description, attachments, files } = bodyData;

    if (!subject || !subject.trim() || !description || !description.trim()) {
      throw new BadRequestError("subject and description are required to file a report.");
    }

    const processedAttachments = processAttachments(files, attachments);

    let reportedManager = null;
    if (reportedAgentOrLandlordId) {
      reportedManager = await PropertyManager.findOne({
        where: { id: reportedAgentOrLandlordId, isDeleted: false },
      });
      if (!reportedManager) {
        throw new NotFoundError("The reported Landlord/Agent account was not found.");
      }
    }

    if (buildingId) {
      const building = await Building.findOne({
        where: { id: buildingId, isDeleted: false },
      });
      if (!building) {
        throw new NotFoundError("Associated property was not found.");
      }
    }

    let senderName = "User";
    const userType = userRole === "list" || userRole === "agent" || userRole === "landLord" ? "list" : "rent";

    if (userType === "rent") {
      const tenant = await ProspectiveTenant.findOne({ where: { id: userId } });
      if (tenant) senderName = `${tenant.firstName} ${tenant.lastName}`;
    } else {
      const manager = await PropertyManager.findOne({ where: { id: userId } });
      if (manager) senderName = `${manager.firstName} ${manager.lastName}`;
    }

    const complaint = await Complaint.create({
      userId,
      userType,
      reportedAgentOrLandlordId: reportedAgentOrLandlordId || null,
      buildingId: buildingId || null,
      category: category ? category.trim().toLowerCase() : "general",
      subject: subject.trim(),
      description: description.trim(),
      status: "pending",
      isDeleted: false,
    });

    // Initial message in thread
    await ComplaintMessage.create({
      complaintId: complaint.id,
      senderType: "user",
      senderId: userId,
      senderName,
      message: description.trim(),
      attachments: processedAttachments,
      isDeleted: false,
    });

    return complaint;
  }

  /**
   * User gets list of their filed complaints (paginated)
   */
  async getUserComplaints(userId, queryParams) {
    const { page, limit, status } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const whereClause = { userId, isDeleted: false };
    if (status) whereClause.status = status;

    const { count, rows: complaints } = await Complaint.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PropertyManager,
          as: "reportedManager",
          attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "type"],
        },
        {
          model: Building,
          as: "building",
          attributes: ["id", "propertyPreference", "propertyLocation", "city", "address"],
        },
        {
          model: ComplaintMessage,
          as: "messages",
          attributes: ["id", "senderType", "senderName", "message", "attachments", "createdAt"],
          order: [["createdAt", "DESC"]],
          limit: 1, // latest message preview
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: true,
    });

    return formatPaginatedResponse({
      data: complaints,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * Get complaint details with full chat history (for user or admin)
   */
  async getComplaintDetails(complaintId, requestingUserId, isAdmin = false) {
    const complaint = await Complaint.findOne({
      where: { id: complaintId, isDeleted: false },
      include: [
        {
          model: PropertyManager,
          as: "reportedManager",
          attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "type", "isBlacklisted"],
        },
        {
          model: Building,
          as: "building",
          attributes: ["id", "propertyPreference", "propertyLocation", "city", "address", "price"],
        },
        {
          model: Admin,
          as: "assignedAdmin",
          attributes: ["id", "firstName", "lastName", "role"],
        },
        {
          model: ComplaintMessage,
          as: "messages",
          where: { isDeleted: false },
          required: false,
          attributes: ["id", "senderType", "senderId", "senderName", "message", "attachments", "createdAt"],
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!complaint) {
      throw new NotFoundError("Complaint ticket not found.");
    }

    if (!isAdmin && complaint.userId !== requestingUserId) {
      throw new ForbiddenError("You do not have permission to view this complaint ticket.");
    }

    // Fetch reporter details
    let reporter = null;
    if (complaint.userType === "rent") {
      reporter = await ProspectiveTenant.findOne({
        where: { id: complaint.userId },
        attributes: ["id", "firstName", "lastName", "emailAddress", "tel", "image"],
      });
    } else {
      reporter = await PropertyManager.findOne({
        where: { id: complaint.userId },
        attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "image"],
      });
    }

    return {
      complaint,
      reporter,
    };
  }

  /**
   * User posts a new message in complaint chat thread
   */
  async addUserMessage(complaintId, userId, userRole, bodyData) {
    const { message, attachments, files } = bodyData;

    if (!message || !message.trim()) {
      throw new BadRequestError("Message content is required.");
    }

    const complaint = await Complaint.findOne({
      where: { id: complaintId, isDeleted: false },
    });

    if (!complaint) {
      throw new NotFoundError("Complaint ticket not found.");
    }

    if (complaint.userId !== userId) {
      throw new ForbiddenError("You are not authorized to post messages on this complaint ticket.");
    }

    let senderName = "User";
    const userType = userRole === "list" || userRole === "agent" || userRole === "landLord" ? "list" : "rent";

    if (userType === "rent") {
      const tenant = await ProspectiveTenant.findOne({ where: { id: userId } });
      if (tenant) senderName = `${tenant.firstName} ${tenant.lastName}`;
    } else {
      const manager = await PropertyManager.findOne({ where: { id: userId } });
      if (manager) senderName = `${manager.firstName} ${manager.lastName}`;
    }

    const processedAttachments = processAttachments(files, attachments);

    const newMessage = await ComplaintMessage.create({
      complaintId: complaint.id,
      senderType: "user",
      senderId: userId,
      senderName,
      message: message.trim(),
      attachments: processedAttachments,
      isDeleted: false,
    });

    // Automatically update complaint status to pending/in_progress
    if (complaint.status === "resolved" || complaint.status === "dismissed") {
      await complaint.update({ status: "in_progress" });
    }

    return newMessage;
  }

  /**
   * Admin lists all complaints with pagination and search
   */
  async getAllComplaintsAdmin(queryParams) {
    const { page, limit, status, category, search } = queryParams;
    const { limit: pageSize, offset, page: currentPage } = getPaginationParams({ page, limit });

    const whereClause = { isDeleted: false };
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    const { count, rows: complaints } = await Complaint.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PropertyManager,
          as: "reportedManager",
          attributes: ["id", "firstName", "lastName", "companyName", "emailAddress", "tel", "type"],
        },
        {
          model: Building,
          as: "building",
          attributes: ["id", "propertyPreference", "propertyLocation", "city", "address"],
        },
        {
          model: Admin,
          as: "assignedAdmin",
          attributes: ["id", "firstName", "lastName", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: true,
    });

    return formatPaginatedResponse({
      data: complaints,
      totalItems: count,
      page: currentPage,
      limit: pageSize,
    });
  }

  /**
   * Admin replies in complaint chat thread & notifies user
   */
  async addAdminMessage(complaintId, adminId, bodyData) {
    const { message, attachments, files, updateStatus } = bodyData;

    if (!message || !message.trim()) {
      throw new BadRequestError("Message content is required.");
    }

    const complaint = await Complaint.findOne({
      where: { id: complaintId, isDeleted: false },
    });

    if (!complaint) {
      throw new NotFoundError("Complaint ticket not found.");
    }

    const admin = await Admin.findOne({ where: { id: adminId } });
    const adminName = admin ? `${admin.firstName} ${admin.lastName} (Admin)` : "Support Admin";

    const processedAttachments = processAttachments(files, attachments);

    const newMessage = await ComplaintMessage.create({
      complaintId: complaint.id,
      senderType: "admin",
      senderId: adminId,
      senderName: adminName,
      message: message.trim(),
      attachments: processedAttachments,
      isDeleted: false,
    });

    const updatePayload = { assignedAdminId: adminId };
    if (updateStatus && ["pending", "in_progress", "resolved", "dismissed"].includes(updateStatus)) {
      updatePayload.status = updateStatus;
    } else if (complaint.status === "pending") {
      updatePayload.status = "in_progress";
    }

    await complaint.update(updatePayload);

    // Create Notification & FCM Push for the user
    try {
      await Notification.create({
        userId: complaint.userId,
        notificationFor: complaint.userType,
        type: "discount", // General message notification type
        message: `New reply from Admin on Ticket #${complaint.id}: ${message.trim().substring(0, 80)}...`,
        buildingId: complaint.buildingId || null,
        isDeleted: false,
      });

      // Push FCM Notification if user token exists
      let userRecord = null;
      if (complaint.userType === "rent") {
        userRecord = await ProspectiveTenant.findOne({ where: { id: complaint.userId } });
      } else {
        userRecord = await PropertyManager.findOne({ where: { id: complaint.userId } });
      }

      if (userRecord && userRecord.fcmToken) {
        await sendPushNotification({
          token: userRecord.fcmToken,
          title: `Reply on Complaint Ticket #${complaint.id}`,
          body: message.trim(),
          data: {
            complaintId: String(complaint.id),
            type: "COMPLAINT_REPLIED",
          },
        });
      }
    } catch (notifErr) {
      console.error("[ComplaintService] Failed to dispatch user notification:", notifErr.message);
    }

    return newMessage;
  }

  /**
   * Admin updates status of complaint ticket
   */
  async updateComplaintStatusAdmin(complaintId, adminId, statusData) {
    const { status } = statusData;

    const allowedStatuses = ["pending", "in_progress", "resolved", "dismissed"];
    if (!status || !allowedStatuses.includes(status.toLowerCase())) {
      throw new BadRequestError(`Invalid status. Allowed values: ${allowedStatuses.join(", ")}`);
    }

    const complaint = await Complaint.findOne({
      where: { id: complaintId, isDeleted: false },
    });

    if (!complaint) {
      throw new NotFoundError("Complaint ticket not found.");
    }

    await complaint.update({
      status: status.toLowerCase(),
      assignedAdminId: adminId,
    });

    // Notify user
    try {
      await Notification.create({
        userId: complaint.userId,
        notificationFor: complaint.userType,
        type: "discount",
        message: `Your complaint ticket #${complaint.id} status has been updated to '${status}'.`,
        buildingId: complaint.buildingId || null,
        isDeleted: false,
      });
    } catch (e) {
      console.error("[ComplaintService] Notification error:", e.message);
    }

    return complaint;
  }
}

export default new ComplaintService();
