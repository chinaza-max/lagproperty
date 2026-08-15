import { Model, DataTypes } from "sequelize";

class Complaint extends Model {}

export function init(connection) {
  Complaint.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "ID of the user filing the report (Tenant or Landlord)",
      },
      userType: {
        type: DataTypes.ENUM("rent", "list"),
        allowNull: false,
        defaultValue: "rent",
      },
      reportedAgentOrLandlordId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID of PropertyManager being reported",
      },
      buildingId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "ID of property involved if applicable",
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "general", // e.g. fraud, unresponsive, maintenance, illegal_eviction, harassment
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "in_progress", "resolved", "dismissed"),
        allowNull: false,
        defaultValue: "pending",
      },
      assignedAdminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "Complaint",
      sequelize: connection,
      timestamps: true,
      underscored: false,
      indexes: [
        { fields: ["userId"] },
        { fields: ["reportedAgentOrLandlordId"] },
        { fields: ["status"] },
        { fields: ["category"] },
      ],
    }
  );
}

export default Complaint;
