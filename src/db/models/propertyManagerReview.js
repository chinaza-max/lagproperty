import { Model, DataTypes } from "sequelize";


class PropertyManagerReview extends Model {}



export function init(connection) {
  PropertyManagerReview.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      propertyManagerId: {
        type: DataTypes.INTEGER ,
        allowNull: false
      },
      prospectiveTenantId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
      }
    }, {
      tableName: 'PropertyManagerReview',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }

export default PropertyManagerReview ;



  

  