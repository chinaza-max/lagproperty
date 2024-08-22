import {  Sequelize } from "sequelize";
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



function associate() {

  Tenant.hasMany(TenantReview, {
    foreignKey: 'tenentId',
    as: "TenantReview",
  });
  TenantReview.belongsTo(Tenant, {
    foreignKey: 'tenentId',
  })


  Building.hasMany(TenantReview, {
    foreignKey: 'buidingId',
    as: "BuildingReview",
  });
  TenantReview.belongsTo(Building, {
    foreignKey: 'buidingId',
  })


  PropertyManager.hasMany(PropertyManagerReview, {
    foreignKey: 'tenentId',
    as: "PropertyManagerReview",
  });
  PropertyManagerReview.belongsTo(PropertyManager, {
    foreignKey: 'tenentId',
  })


  Tenant.hasMany(Inspection, {
    foreignKey: 'tenentId',
    as: "Inspection",
  });
  Inspection.belongsTo(Tenant, {
    foreignKey: 'tenentId',
  })


  Building.hasMany(Inspection, {
    foreignKey: 'tenentId',
    as: "BuildingInspection",
  });
  Inspection.belongsTo(Building, {
    foreignKey: 'tenentId',
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
  Tenant,
  TenantReview,
  Admin,
  Building,
  Chat,
  Inspection,
  PropertyManager,
  PropertyManagerReview,
  Transaction
}

export function init(connection) {
  initTenant(connection);
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

  associate();
  authenticateConnection(connection)
}
