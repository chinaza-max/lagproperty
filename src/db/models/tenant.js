import { Model, DataTypes } from "sequelize";


class Tenant extends Model {}

export function init(connection) {
  Tenant.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      emailAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isEmailValid: {
        type: DataTypes.BOOLEAN,
        defaultValue:false,
        allowNull: false,
      },
      tel: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isTelValid: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      telCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      }, 
      maritalStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM(
          'Male',
          'Female'
        ),
        allowNull: true,
      },  
      dateOfBirth: {
       type: DataTypes.DATE,
        allowNull: true,
      }, 
      lasrraId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      familySize: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rentalDuration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      budgetMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      budgetMax: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      occupation: {
        type: DataTypes.STRING,
        allowNull: true,
      }, 
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      }, 
      stateOfOrigin: {
        type: DataTypes.STRING,
        allowNull: true,
      }, 
      nin: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }, 
      lasrraId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankAccout: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      propertyPreference: {
        type: DataTypes.ENUM(
          'flats',
          'duplex',
          'selfContains',
          'roomAndParlour',
        ),
        allowNull: true,
      },
      propertyType: {
        type: DataTypes.ENUM(
          'residential',
          'gras',
          'estates'
        ),
        allowNull: true,
      },
      propertyType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disableAccount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false
      },
      notificationAllowed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:true
      },   
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'propertyManager',
      sequelize: connection,
      timestamps: true,
      underscored:false
  });
  }

export default Tenant ;



  

  