/**
 * Notification Event Mapper Dictionary
 * Standardized mapping of all system notification events, action types, default templates,
 * target audiences, and expected FCM push payload schemas for Frontend developers.
 */

export const NOTIFICATION_EVENTS = {
  RENT_DISBURSED: {
    eventCode: "RENT_DISBURSED",
    category: "Financial",
    targetGroup: "list", // Landlords & Agents
    description: "Triggered when tenant rent payment has been successfully disbursed to landlord account.",
    defaultTitle: "Rent Payment Disbursed",
    defaultBody: "Your rent payment of ₦{amount} for {buildingTitle} has been disbursed.",
    payloadSchema: {
      type: "rentDisbursed",
      buildingId: "number",
      transactionId: "number",
      amount: "number",
      actionUrl: "/manager/transactions/{transactionId}",
    },
  },

  RENT_PAYMENT_DUE: {
    eventCode: "RENT_PAYMENT_DUE",
    category: "Rentals",
    targetGroup: "rent", // Tenants
    description: "Triggered when a tenant's annual or monthly rent due date is approaching or overdue.",
    defaultTitle: "Rent Payment Due Reminder",
    defaultBody: "Your rent for {buildingTitle} is due on {dueDate}. Please renew your tenancy.",
    payloadSchema: {
      type: "rentPaymentDue",
      buildingId: "number",
      dueDate: "ISO-String",
      actionUrl: "/tenant/rent/pay/{buildingId}",
    },
  },

  INSPECTION_REQUESTED: {
    eventCode: "INSPECTION_REQUESTED",
    category: "Inspections",
    targetGroup: "list", // Landlords & Agents
    description: "Triggered when a prospective tenant schedules a property inspection.",
    defaultTitle: "New Property Inspection Request",
    defaultBody: "{tenantName} requested an inspection for {buildingTitle} on {inspectionDate}.",
    payloadSchema: {
      type: "inspectionRequested",
      inspectionId: "number",
      buildingId: "number",
      actionUrl: "/manager/inspections/{inspectionId}",
    },
  },

  INSPECTION_STATUS_UPDATED: {
    eventCode: "INSPECTION_STATUS_UPDATED",
    category: "Inspections",
    targetGroup: "rent", // Tenants
    description: "Triggered when landlord/agent updates an inspection status (accepted, rescheduled, cancelled).",
    defaultTitle: "Inspection Status Update",
    defaultBody: "Your inspection request for {buildingTitle} has been updated to {status}.",
    payloadSchema: {
      type: "inspectionStatusUpdated",
      inspectionId: "number",
      buildingId: "number",
      status: "string",
      actionUrl: "/tenant/inspections/{inspectionId}",
    },
  },

  COMPLAINT_CREATED: {
    eventCode: "COMPLAINT_CREATED",
    category: "Complaints & Reports",
    targetGroup: "admin", // Admin team
    description: "Triggered when a tenant or user files a report/complaint against an agent or landlord.",
    defaultTitle: "New Report Filed by User",
    defaultBody: "{userName} submitted a complaint against {reportedPartyName}: '{subject}'",
    payloadSchema: {
      type: "complaintCreated",
      complaintId: "number",
      category: "string",
      actionUrl: "/admin/complaints/{complaintId}",
    },
  },

  COMPLAINT_REPLIED: {
    eventCode: "COMPLAINT_REPLIED",
    category: "Complaints & Reports",
    targetGroup: "rent_or_list", // Reporter User or Admin
    description: "Triggered when admin or user posts a new reply message in the complaint chat thread.",
    defaultTitle: "New Reply on Your Complaint Ticket",
    defaultBody: "{senderName} sent a reply on Ticket #{complaintId}: '{messageSnippet}'",
    payloadSchema: {
      type: "complaintReplied",
      complaintId: "number",
      senderType: "user | admin",
      actionUrl: "/user/complaints/{complaintId}",
    },
  },

  COMPLAINT_STATUS_UPDATED: {
    eventCode: "COMPLAINT_STATUS_UPDATED",
    category: "Complaints & Reports",
    targetGroup: "rent_or_list", // User reporter
    description: "Triggered when Admin updates the resolution status of a complaint ticket.",
    defaultTitle: "Complaint Ticket Status Updated",
    defaultBody: "Your complaint ticket #{complaintId} status has been updated to '{status}'.",
    payloadSchema: {
      type: "complaintStatusUpdated",
      complaintId: "number",
      status: "pending | in_progress | resolved | dismissed",
      actionUrl: "/user/complaints/{complaintId}",
    },
  },

  AGENT_BLACKLISTED: {
    eventCode: "AGENT_BLACKLISTED",
    category: "Compliance & Safety",
    targetGroup: "list", // Blacklisted Agent
    description: "Triggered when an admin blacklists an agent/landlord account due to policy violation.",
    defaultTitle: "Account Status Alert",
    defaultBody: "Your property manager account has been flagged/blacklisted. Reason: {reason}",
    payloadSchema: {
      type: "agentBlacklisted",
      agentId: "number",
      reason: "string",
      actionUrl: "/support",
    },
  },

  SYSTEM_ANNOUNCEMENT: {
    eventCode: "SYSTEM_ANNOUNCEMENT",
    category: "Marketing & Updates",
    targetGroup: "all", // Everyone or targeted group
    description: "Triggered by admins to broadcast targeted marketing or platform system updates.",
    defaultTitle: "LagProperty Announcement",
    defaultBody: "{message}",
    payloadSchema: {
      type: "systemAnnouncement",
      buildingId: "number | optional",
      actionUrl: "/announcements",
    },
  },
};

/**
 * Get formatted event dictionary list for API responses & documentation
 */
export function getNotificationEventsList() {
  return Object.values(NOTIFICATION_EVENTS);
}

export default {
  NOTIFICATION_EVENTS,
  getNotificationEventsList,
};
