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
      isEmailValid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'Setting',
      },
      disableAccount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
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



  

  