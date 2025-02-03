import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Groups from "./Groups.js";
import Users from "./Users.js";

const GroupMembers = sequelize.define("groupMembers", {
  group_id: {
    type: DataTypes.UUID,
    references: {
      model: Groups,
      key: "group_id",
    },
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: Users,
      key: "user_id",
    },
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM("admin", "moderator", "member"),
    allowNull: false,
    defaultValue: "member",
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  primaryKey: ["group_id", "user_id"],
});

Groups.hasMany(GroupMembers, { foreignKey: "group_id" });
Users.hasMany(GroupMembers, { foreignKey: "user_id" });
GroupMembers.belongsTo(Groups, { foreignKey: "group_id" });
GroupMembers.belongsTo(Users, { foreignKey: "user_id" });

export default GroupMembers;
