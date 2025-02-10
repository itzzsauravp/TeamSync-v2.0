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
  weight: {
    type: DataTypes.STRING,
    allowNull: true, // handle null value in the frontend, compatible with existing add group function
  },
}, {
  timestamps: true,
});

export default Groups;