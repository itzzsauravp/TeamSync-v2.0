import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskColumn = sequelize.define(
  "TaskColumn",
  {
    column_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    column_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "groups",
        key: "group_id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "taskColumns",
    timestamps: false,
  }
);

export default TaskColumn;
