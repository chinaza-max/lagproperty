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
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'PENDING',
        },
        oldTransactionReference: {//THIS REFERENCE IS FOR THE TRANSACTION MADE THAT IS ABOUT TO BE REFUNDED
            type: DataTypes.STRING,
            allowNull: false
        },
        transactionReference: {
          type: DataTypes.STRING,
          allowNull: false
        },
        inspectionId: {
          type: DataTypes.INTEGER,
          allowNull: true
        },  
        prospectiveTenantId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },  
        buildingId: {
          type: DataTypes.INTEGER,
          allowNull: false
        },  
        refundReason: {
          type: DataTypes.TEXT,
          allowNull: true
        },    
        refundTransactionReference: {
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
  
  
  
    
  
    