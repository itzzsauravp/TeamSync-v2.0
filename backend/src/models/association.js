import Users from "./Users.js";
import Groups from "./Groups.js";
import GroupMembers from "./GroupMembers.js";
import Messages from "./Messages.js";
import TaskColumn from "./TaskColumn.js";
import Task from "./Task.js";

Groups.hasMany(GroupMembers, { foreignKey: "group_id" });
GroupMembers.belongsTo(Groups, { foreignKey: "group_id" });

Users.hasMany(GroupMembers, { foreignKey: "user_id" });
GroupMembers.belongsTo(Users, { foreignKey: "user_id" });

Groups.hasMany(Messages, { foreignKey: "group_id" });
Messages.belongsTo(Groups, { foreignKey: "group_id" });

Users.hasMany(Messages, { foreignKey: "sender_id" });
Messages.belongsTo(Users, { foreignKey: "sender_id" });

Groups.hasMany(TaskColumn, { foreignKey: "group_id" });
TaskColumn.belongsTo(Groups, { foreignKey: "group_id" });

TaskColumn.hasMany(Task, { foreignKey: "column_id" });
Task.belongsTo(TaskColumn, { foreignKey: "column_id" });

Users.hasMany(Task, { foreignKey: "assigned_to" });
Task.belongsTo(Users, { foreignKey: "assigned_to" });

Groups.hasMany(Task, { foreignKey: "group_id" });
Task.belongsTo(Groups, { foreignKey: "group_id" });

export { Users, Groups, GroupMembers, Messages, TaskColumn, Task };
