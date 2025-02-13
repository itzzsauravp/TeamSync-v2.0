import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Task = sequelize.define(
  "task",
  {
    task_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    task_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Renamed and changed: "difficulty" is now "taskSkillLevel" of type int
    taskSkillLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estimated_time: {
      type: DataTypes.INTEGER, // In minutes or hours
      allowNull: false,
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    assigned_by: {
      type: DataTypes.UUID,
      allowNull: true, // may be be dont make this null because assigned_by is always the current users_ids
      references: {
        model: "users",
        key: "user_id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    column_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "taskColumns",
        key: "column_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "groups",
        key: "group_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    taskPriority: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("ongoing", "pending", "aborted", "complete"),
      allowNull: false,
      defaultValue: "ongoing",
    },
    taskQuality: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    taskExpertise: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  }
);

export default Task;
