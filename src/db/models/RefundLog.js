import { Model, DataTypes } from "sequelize";

  class RefundLog extends Model {}
  
  export function init(connection) {
    RefundLog.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        refundStatus: {
            type: DataTypes.ENUM('PENDING', 'COMPLETED', 'FAILED'),
            allowNull: false,
            defaultValue: 'PENDING',
        },
        transactionReference: {
            type: DataTypes.STRING,
            allowNull: false
        },  
        isDeleted: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue:false ,
        }
      }, {
        tableName: 'RefundLog',
        sequelize: connection,
        timestamps: true,
        underscored:false,
        indexes: [
            {
              unique: false, 
              fields: ['transactionReference'],
            },
          ],
      });
    }
  
  export default RefundLog ;
  
  
  
    
  
    