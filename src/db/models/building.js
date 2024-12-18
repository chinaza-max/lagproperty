import { Model, DataTypes } from "sequelize";

class Building extends Model {}

export function init(connection) {
    Building.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      propertyManagerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      propertyPreference: {//property like self con
        type: DataTypes.STRING,
        allowNull: false,
      },
      electricityBillArreas: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      electricityBillArreasType:{
        type: DataTypes.STRING,
        allowNull: true
      },
      waterBillArreas: {
        type: DataTypes.STRING,
        allowNull: true
      },
      propertyLocation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lat: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lng: {
        type: DataTypes.STRING,
        allowNull: false,
      },
     
      numberOfFloors: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      numberOfRooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      amenity: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('amenity');
          return rawValue ? JSON.parse(rawValue) : [];
        }, 
        set(value) {
          this.setDataValue('amenity', JSON.stringify(value));
        }
      },
    
      buildingOccupantPreference: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
          const value = this.getDataValue('buildingOccupantPreference');
 
          try {
            // Ensure it is always parsed to an object
            return typeof value === 'string' ? JSON.parse(value) : value;
          } catch (err) { 
            // Handle any unexpected parsing issues
            console.error('Error parsing buildingOccupantPreference:', err);
            return {}; // Return a default empty object on error
          }
        }
        /*defaultValue: {
          maritalStatus: null,
          religion: null,
          region: null,
          gender: null,
        },*/
      },
      availability: {
        type: DataTypes.ENUM(
          'vacant',
          'occupied',
          'booked'
        ),
        defaultValue:'vacant',
        allowNull: false,
      },
      furnishingStatus : {
        type: DataTypes.ENUM(
          'furnished',
          'unfurnished', 
          'partly furnished', 
          'unset'
        ),
        defaultValue:'unset',
        allowNull: false,
      },
      rentalDuration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER ,
        allowNull: false,
      },
      commissionBill: {
        type: DataTypes.INTEGER ,
        allowNull: false,
      },
      propertyDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      propertyImages: {
        type: DataTypes.TEXT, 
        allowNull: true,
        get() {
          const rawValue = this.getDataValue('propertyImages');
          try {
            return rawValue ? JSON.parse(rawValue) : [];
          } catch (error) {
            return [];
          }
        },
        set(value) {
          this.setDataValue('propertyImages', value ? JSON.stringify(value) : null);
        },
      },
      propertyTerms: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'Building',
      sequelize: connection,
      timestamps: true,
      underscored:false
  });
  }

export default Building ;



  

  