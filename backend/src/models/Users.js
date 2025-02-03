import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Users = sequelize.define("users", {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other", "not-selected"),
    allowNull: false,
    defaultValue: "not-selected",
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  profilePicture: {
    type: DataTypes.STRING,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
}, {
  timestamps: true,
});

export default Users;
