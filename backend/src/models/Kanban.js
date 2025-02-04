import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Users from "./Users.js";

const Kanban = sequelize.define(
  "kanban",
  {
    kanban_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("high", "medium", "low"),
      defaultValue: "medium",
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "todo",
        "ongoing",
        "pending_verification",
        "completed"
      ),
      defaultValue: "todo",
      allowNull: false,
    },
    user_id: {
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

export default Kanban;
