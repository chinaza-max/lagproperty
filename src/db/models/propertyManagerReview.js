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
        type: DataTypes.NUMBER,
        allowNull: false
      },
      tenantId: {
        type: DataTypes.NUMBER,
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



  

  