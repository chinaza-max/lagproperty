import { Model, DataTypes } from "sequelize";

class QuitNotice extends Model {}

export function init(connection) {
  QuitNotice.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tenant', 
          key: 'id',
        },
      },
      buildingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      propertyManagerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quitDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'served',
          'acknowledged'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    }, {
      tableName: 'QuitNotice',
      sequelize: connection,
      timestamps: true,
      underscored: false
    }
  );
}

export default QuitNotice;
