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
      propertyTitle: {
        type: DataTypes.STRING,
        allowNull: true,
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
        allowNull: false,
        get() {
          const rawValue = this.getDataValue('amenity');
          return rawValue ? JSON.parse(rawValue) : [];
        }, 
        set(value) {
          this.setDataValue('amenity', JSON.stringify(value));
        }
      },
      roomPreference: {/* take out after test */
        type: DataTypes.TEXT,
        allowNull: false,
      },
      buildingOccupantPreference: {
        type: DataTypes.JSON,
        allowNull: true
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
      electricityBill: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      wasteBill: { //remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
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
      bedroomSizeLength: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      bedroomSizeWidth: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      bedroomSizeImage: {//remove later
        type: DataTypes.TEXT,
        allowNull: true,
      },
      kitchenSizeLength: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      kitchenSizeWidth: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      kitchenSizeImage: {//remove later
        type: DataTypes.TEXT,
        allowNull: true,
      },
      livingRoomSizeLength: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      livingRoomSizeWidth: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      livingRoomSizeImage: {//remove later
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diningAreaSizeLength: {//remove later
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      diningAreaSizeWidth: {//remove later
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diningAreaSizeImage: {//remove later
        type: DataTypes.TEXT,
        allowNull: true,
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



  

  