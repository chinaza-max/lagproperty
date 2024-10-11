import { Model, DataTypes } from "sequelize";


class Notification extends Model {}

export function init(connection) {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },  
      notificationFor: {
        type: DataTypes.ENUM(
          'list',
          'admin',
          'rent'
        ),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(
          'inspection',
          'discount',
          'rentPayment'
        ),
        allowNull: false,
      },
      message:{
        type: DataTypes.TEXT,
        allowNull: false,
      },
      buildingId:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'Notification',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }

export default Notification ;



  

  