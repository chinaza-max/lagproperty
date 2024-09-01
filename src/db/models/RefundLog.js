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
            type: DataTypes.ENUM('PAID', 'OVERPAID', 'PARTIALLY_PAID'
                , 'PENDING', 'ABANDONED', 'CANCELLED'
                , 'FAILED', 'REVERSED', 'EXPIRED'
            ),
            allowNull: false,
            defaultValue: 'PENDING',
        },
        role: {
          type: DataTypes.ENUM(
            'list',
            'rent'
          ),
          allowNull: false,
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
  
  
  
    
  
    