import ProspectiveTenant, { init as initProspectiveTenant } from "./prospectiveTenant.js";
import Tenant, { init as initTenant } from "./tenant.js";
import TenantReview, { init as initTenantReview } from "./tenantReview.js";
import Admin, { init as initAdmin } from "./admin.js";
import Building, { init as initBuilding } from "./building.js";
import Chat, { init as initChat } from "./chat.js";
import EmailandTelValidation, { init as initEmailandTelValidation } from "./emailAndTelValidation.js";
import Inspection, { init as initInspection } from "./inspection.js";
import PasswordReset, { init as initPasswordReset } from "./passwordReset.js";
import PropertyManager, { init as initPropertyManager } from "./propertyManager.js";
import PropertyManagerReview, { init as initPropertyManagerReview } from "./propertyManagerReview.js";
import Transaction , { init as initTransaction } from "./transaction.js";
import RefundLog , { init as initRefundLog } from "./RefundLog.js";
import QuitNotice , { init as initQuitNotice } from "./quitNotice.js";
import Setting , { init as initSetting } from "./setting.js";
import Notification , { init as initNotification } from "./notification.js";





function associate() {


  ProspectiveTenant.hasMany(Tenant, {
    foreignKey: 'prospectiveTenantId',
    as: "rentalhistory",
  });
  Tenant.belongsTo(ProspectiveTenant, {
    foreignKey: 'prospectiveTenantId',
  })

  Chat.belongsTo(Chat, {
    as: 'RepliedMessage',
    foreignKey: 'repliedMessageId',
  });

  

  Tenant.hasMany(QuitNotice, {
    foreignKey: 'tenantId',
    as: "myQuitNotice",
  });
  QuitNotice.belongsTo(Tenant, {
    foreignKey: 'tenantId',
  })




  PropertyManager.hasMany(QuitNotice, {
    foreignKey: 'propertyManagerId',
    as: "ManagerQuitNotice",
  });
  QuitNotice.belongsTo(PropertyManager, {
    foreignKey: 'propertyManagerId',
  })



  Building.hasMany(QuitNotice, {
    foreignKey: 'buildingId',
    as: "BuildingQuitNotice",
  });
  QuitNotice.belongsTo(Building, {
    foreignKey: 'buildingId',
  })



  
  Building.hasMany(Notification, {
    foreignKey: 'buildingId',
    as: "BuildingNotification",
  });
  Notification.belongsTo(Building, {
    foreignKey: 'buildingId',
  })


  Building.hasMany(TenantReview, {
    foreignKey: 'buildingId',
    as: "BuildingReview",
  });
  TenantReview.belongsTo(Building, {
    foreignKey: 'buildingId',
  })



  ProspectiveTenant.hasMany(TenantReview, {
    foreignKey: 'prospectiveTenantId',
    as: "MyBuildingReview",
  });

  TenantReview.belongsTo(ProspectiveTenant, {
    foreignKey: 'prospectiveTenantId',
  })


  Building.hasMany(Transaction, {
    foreignKey: 'buildingId',
    as: "BuildingTransaction",
  });
  Transaction.belongsTo(Building, {
    foreignKey: 'buildingId',
  })


  PropertyManager.hasMany(PropertyManagerReview, {
    foreignKey: 'propertyManagerId',
    as: "PropertyManagerReview",
  });
  PropertyManagerReview.belongsTo(PropertyManager, {
    foreignKey: 'propertyManagerId',
  })


  ProspectiveTenant.hasMany(PropertyManagerReview, {
    foreignKey: 'prospectiveTenantId',
    as: "PropertyManagerReview",
  });
  PropertyManagerReview.belongsTo(ProspectiveTenant, {
    foreignKey: 'prospectiveTenantId',
  })


  ProspectiveTenant.hasMany(Inspection, {
    foreignKey: 'prospectiveTenantId',
    as: "MyInspection", 
  });
  Inspection.belongsTo(ProspectiveTenant, {
    foreignKey: 'prospectiveTenantId',
  })

  Building.hasMany(Inspection, {
    foreignKey: 'buildingId',
    as: "BuildingInspection",
  });
  Inspection.belongsTo(Building, {
    foreignKey: 'buildingId',
  })


  Building.hasMany(RefundLog, {
    foreignKey: 'buildingId',
    as: "BuildingRefundLog",
  });
  RefundLog.belongsTo(Building, {
    foreignKey: 'buildingId',
  })



  Building.hasMany(Tenant, {
    foreignKey: 'buildingId',
    as: "BuildingTenant",
  });
  Tenant.belongsTo(Building, {
    foreignKey: 'buildingId',
  })

  PropertyManager.hasMany(Building, {
    foreignKey: 'propertyManagerId',
    as: "propertyManagerBuilding",
  });
  Building.belongsTo(PropertyManager, {
    foreignKey: 'propertyManagerId',
  })

 


  //console.log(BusinessSpot.associations)
  //console.log(UserDate.associations)

  
}

async function authenticateConnection(connection) {
  try {
    await connection.authenticate();
    console.log('Connection to database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

export {
  PasswordReset,
  EmailandTelValidation,
  ProspectiveTenant,
  TenantReview,
  Admin,
  Building,
  Chat,
  Inspection,
  PropertyManager,
  PropertyManagerReview,
  Transaction,
  RefundLog,
  QuitNotice,
  Tenant,
  Setting,
  Notification
}

export function init(connection) {
  initProspectiveTenant(connection);
  initTenantReview(connection);
  initAdmin(connection);
  initBuilding(connection);
  initChat(connection);
  initEmailandTelValidation(connection)
  initInspection(connection)
  initPasswordReset(connection)
  initPropertyManager(connection)
  initPropertyManagerReview(connection)
  initTransaction(connection)
  initTenant(connection)
  initRefundLog(connection)
  initQuitNotice(connection)
  initSetting(connection)
  initNotification(connection)

  associate();
  authenticateConnection(connection)
}
