import { Model, DataTypes } from "sequelize";


class TenantReview extends Model {}



export function init(connection) {
  TenantReview.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      buildingId: {
        type: DataTypes.INTEGER ,
        allowNull: false
      },
      prospectiveTenantId: {
        type: DataTypes.INTEGER ,
        allowNull: false
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      rating: {
        type: DataTypes.FLOAT ,
        allowNull: true
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
      }
    }, {
      tableName: 'TenantReview',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }

export default TenantReview ;



  

  