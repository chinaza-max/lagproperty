import { Model, DataTypes } from "sequelize";


class Tenant extends Model {}

export function init(connection) {
  Tenant.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      buildingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prospectiveTenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          'terminated',
          'active',
          'rentDue'
        ),
        allowNull: false,
      },
      rentNextDueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      paymentReference: {
        type: DataTypes.STRING,
        allowNull: false,
      },        
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'Tenant',
      sequelize: connection,
      timestamps: true,
      underscored:false
  });
  }

export default Tenant ;



  

  