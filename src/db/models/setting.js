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
        type: DataTypes.FLOAT,
        defaultValue: 0.01
      },
      appPercentage: {
        type: DataTypes.FLOAT,//in seconds
        defaultValue: 0.05
      },
      accountNumber: {
        type: DataTypes.STRING,
        defaultValue: '5948568393',
      },
      failedDisburseRetry: {
        type: DataTypes.INTEGER,//in seconds
        defaultValue: 1800,
      },
      failedRefundRetry: {
        type: DataTypes.INTEGER,//in seconds
        defaultValue: 1800,
      },
      pendingDisburseRetry: {
        type: DataTypes.INTEGER,//in seconds
        defaultValue: 1800,
      },
      pendingDisburseRentRetry: {
        type: DataTypes.INTEGER,//in seconds
        defaultValue: 1800,
      },
      appShare: {
        type: DataTypes.INTEGER,//in seconds
        defaultValue: 1800,
      },
      preferences: {
        type: DataTypes.JSON, 
        allowNull: true,
        defaultValue: {} 
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



  

  