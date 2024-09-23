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
      propertyPreference: {
        type: DataTypes.ENUM(
          'flats',
          'duplex',
          'selfContains',
          'roomAndParlour',
        ),
        allowNull: false,
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
        allowNull: false,
      },
      lng: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      propertyTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:'4 Bedroom Terrace Duplex'
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
      roomPreference: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      electricityBill: {
        type: DataTypes.INTEGER ,
        allowNull: false,
      },
      wasteBill: {
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
      bedroomSizeLength: {
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      bedroomSizeWidth: {
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      bedroomSizeImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      kitchenSizeLength: {
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      kitchenSizeWidth: {
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      kitchenSizeImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      livingRoomSizeLength: {
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      livingRoomSizeWidth: {
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      livingRoomSizeImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diningAreaSizeLength: {
        type: DataTypes.INTEGER ,
        allowNull: true,
      },
      diningAreaSizeWidth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      diningAreaSizeImage: {
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



  

  