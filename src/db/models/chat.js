import { Model, DataTypes } from "sequelize";


class Chat extends Model {}

export function init(connection) {
  Chat.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      senderId: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      receiverId: {
        type: DataTypes.NUMBER,
        allowNull: false
      },
      messageType: { 
        type: DataTypes.ENUM(
          'text',
          'file'
        ),
        allowNull: false,
      },
      message: { 
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      repliedMessageId: {
        type: DataTypes.NUMBER,
        allowNull: true,
        references: {
          model: 'Chats',
          key: 'id',
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false ,
      }
    }, {
      tableName: 'Chat',
      sequelize: connection,
      timestamps: true,
      underscored:false
    });
  }

export default Chat ;



  

  