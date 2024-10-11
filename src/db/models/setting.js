import { Model, DataTypes } from "sequelize";


class Setting extends Model {}

export function init(connection) {
  Setting.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      commissionPercentage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      accountNumber: {
        type: DataTypes.STRING,
        defaultValue: '5948568393',
      },
      failedDisburseRetry: {
        type: DataTypes.STRING,//in seconds
        defaultValue: '1800',
      },
      failedRefundRetry: {
        type: DataTypes.STRING,//in seconds
        defaultValue: '1800',
      },
      notificationAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:true
      },   
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'Setting',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }

export default Setting ;



  

  