import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Users from "./Users.js"; // Ensure the Users model is imported

const Event = sequelize.define(
  "events",
  {
    event_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // New field to record the creator/admin of the event
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Users,
        key: "user_id",
      },
    },
  },
  {
    timestamps: true,
  }
);

export default Event;
