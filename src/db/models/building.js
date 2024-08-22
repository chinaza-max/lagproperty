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
      propertyPreference: {
        type: DataTypes.ENUM(
          'flats',
          'duplex',
          'selfContains',
          'roomAndParlour',
        ),
        allowNull: false,
      },
      propertyType: {
        type: DataTypes.ENUM(
          'residential',
          'gras',
          'estates'
        ),
        allowNull: false,
      },
      propertyPreferenceImage: {
        type: DataTypes.TEXT,
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
      numberOfFloors: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      numberOfRooms: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      amenity: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      roomPreference: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      availability: {
        type: DataTypes.ENUM(
          'vacant',
          'occupied'
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      electricityBill: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      wasteBill: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      commissionBill: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      propertyDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bedroomSizeLength: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      bedroomSizeWidth: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      bedroomSizeImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      kitchenSizeLength: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      kitchenSizeWidth: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      kitchenSizeImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      livingRoomSizeLength: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      livingRoomSizeWidth: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      livingRoomSizeImage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      diningAreaSizeLength: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      diningAreaSizeWidth: {
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      diningAreaSizeImage: {
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



  

  