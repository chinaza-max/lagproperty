import { Model, DataTypes } from "sequelize";

class ComplaintMessage extends Model {}

export function init(connection) {
  ComplaintMessage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      complaintId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Complaint",
          key: "id",
        },
      },
      senderType: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      attachments: {
        type: DataTypes.TEXT, // JSON array string for image/file URLs
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "ComplaintMessage",
      sequelize: connection,
      timestamps: true,
      underscored: false,
      indexes: [
        { fields: ["complaintId"] },
        { fields: ["senderType"] },
      ],
    }
  );
}

export default ComplaintMessage;
