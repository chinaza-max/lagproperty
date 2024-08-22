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
      buidingId: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      tenantId: {
        type: DataTypes.NUMBER,
        allowNull: false,
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
        allowNull: false,
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM(
            'Male',
            'Female'
        ),
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: false,
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



  

  