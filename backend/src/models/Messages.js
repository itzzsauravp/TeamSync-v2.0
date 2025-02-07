// models/Messages.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Users from "./Users.js";
import Groups from "./Groups.js";

const Messages = sequelize.define(
  "messages",
  {
    message_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.UUID,
      references: {
        model: Users,
        key: "user_id",
      },
      allowNull: false,
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Groups,
        key: "group_id",
      },
    },
    // For text messages. (For file messages, this may be empty.)
    message_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // New fields for file attachments:
    file_data: {
      type: DataTypes.BLOB("long"), // stores binary data (for small files)
      allowNull: true,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sent_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

Messages.belongsTo(Users, { foreignKey: "sender_id", as: "user" });
Messages.belongsTo(Groups, { foreignKey: "group_id" });

export default Messages;
