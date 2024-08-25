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
      transactionId: {
        type: DataTypes.INTEGER ,
        allowNull: false,
      },
      buidingId: {
        type: DataTypes.INTEGER ,
        allowNull: false,
      },
      tenantId: {
        type: DataTypes.INTEGER ,
        allowNull: false,
      },
      propertyManagerStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      tenentStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      inspectionStatus: {
        type: DataTypes.ENUM(
            'pending',
            'accepted',
            'decline',
            'notCreated',
        ),
        allowNull: false,
        defaultValue:"notCreated"
      },
      inspectionDeclineMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      inspectionMode: {
        type: DataTypes.ENUM(
            'inPerson',
            'videoChat'
        ),
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
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM(
            'Male',
            'Female'
        ),
        allowNull: true,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: 'Inspection',
      sequelize: connection, 
      timestamps: true,
      underscored:false
    });
  }

export default Inspection ;



  

  