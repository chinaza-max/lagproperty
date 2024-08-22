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
      transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      propertyManagerStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      tenentStatus: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      transactionType: {
        type: DataTypes.ENUM(
            'rent',
            'appointmentAndRent',
            'payOut',
            'refund'
          ),
        allowNull: false,
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



  

  