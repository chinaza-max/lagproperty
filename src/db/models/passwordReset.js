import {
    DataTypes,
    Model
  } from "sequelize";


  class PasswordReset extends Model {}

  export function init(connection) {
    PasswordReset.init({
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resetKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresIn: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    }, {
      tableName: 'PasswordReset',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }



export default PasswordReset ;



  

  