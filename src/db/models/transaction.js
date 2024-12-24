import { Model, DataTypes } from "sequelize";


class Transaction extends Model {}

export function init(connection) {
  Transaction.init(
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
      buildingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      inspectionId: {
        type: DataTypes.INTEGER,
        allowNull: true
      }, 
      transactionReference: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentReference: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionType: {
        type: DataTypes.ENUM(
            'appointmentAndRent',//INCOMING RENT FOR APPOINTMENT 
            'firstRent',//DISBURSED FIRST RENT 
            'commission',// DISBURSED COMMISSION FROM FIRST RENT
            'refund',// REFUND 
            'rent', 
            'subsequentRent', //PAYMENT SENT TO HOUSE OWNER AS RENT 
          ),
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:'unverified',
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'Transaction',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }

export default Transaction ;



  

  