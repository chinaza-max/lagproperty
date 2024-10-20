import { Model, DataTypes } from "sequelize";


class ProspectiveTenant extends Model {}

export function init(connection) {
  ProspectiveTenant.init(
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.STRING,
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
      bankAccount: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      propertyPreference: {
        type: DataTypes.TEXT,
        defaultValue: '[]',
        get() {
          const rawValue = this.getDataValue('propertyPreference');
          return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
          if (Array.isArray(value)) {
            this.setDataValue('propertyPreference', JSON.stringify(value));
          } else {
            this.setDataValue('propertyPreference', JSON.stringify([]));
          }
        },
        validate: {
          isValidJSON(value) {
            try {
              JSON.parse(value);
            } catch (e) {
              throw new Error('Invalid JSON string for propertyPreference');
            }
          }
        }
      },
      propertyLocation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'rent',
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
      tableName: 'ProspectiveTenant',
      sequelize: connection,
      timestamps: true,
      underscored:false
  });
  }

export default ProspectiveTenant ;



  

  