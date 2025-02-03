import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Users from "./Users.js";
import Groups from "./Groups.js";

const Messages = sequelize.define("messages", {
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
  message_content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  sent_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

Messages.belongsTo(Users, { foreignKey: "sender_id" });
Messages.belongsTo(Groups, { foreignKey: "group_id" });

export default Messages;
