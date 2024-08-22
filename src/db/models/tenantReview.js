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
      buidingId: {
        type: DataTypes.NUMBER,
        allowNull: false
      },
      tenentId: {
        type: DataTypes.NUMBER,
        allowNull: false
      },
      review: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      rating: {
        type: DataTypes.NUMBER,
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



  

  