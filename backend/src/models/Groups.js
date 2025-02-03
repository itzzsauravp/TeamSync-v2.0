import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Groups = sequelize.define("groups", {
  group_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  group_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default Groups;
