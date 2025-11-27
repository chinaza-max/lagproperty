import { Model, DataTypes } from "sequelize";

class Inspection extends Model {}

export function init(connection) {
  Inspection.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      transactionReference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      buildingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prospectiveTenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      propertyManagerStatus: {
        //this attribute set to true means that the landlord has accepted the tenant
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      tenentStatus: {
        //this attribute set to true means that the prospective tenant likes the building
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      inspectionStatus: {
        type: DataTypes.ENUM(
          "pending", // date for inspection has been created but property owner has not accepted
          "accepted", // date for inspection has been accepted
          "declined", // date for inspection not suitable
          "refunded", // either tenant or landlord rejected the compatibility so fund refunded
          "disbursed", // tenant and landlord  has accepted themself fund disbursed
          "notCreated" //created after fund transfer but no date has been scheduled
        ),
        allowNull: false,
        defaultValue: "notCreated",
      },
      agentPaidStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      landlordPaidStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      inspectionMode: {
        type: DataTypes.ENUM("inPerson", "videoChat"),
        allowNull: true,
      },
      fullDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM("Male", "Female"),
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      refundReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      notificationAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "Inspection",
      sequelize: connection,
      timestamps: true,
      underscored: false,
    }
  );
}

export default Inspection;
