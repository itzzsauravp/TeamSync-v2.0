import {
  Users,
  Groups,
  GroupMembers,
  Messages,
  TaskColumn,
  Task,
  Event,
} from "../models/association.js";
import Kanban from "../models/Kanban.js";

import { associateModels } from "../models/association.js";
associateModels();

(async () => {
  try {
    await Users.sync({ alter: true });
    await Groups.sync({ alter: true });
    await GroupMembers.sync({ alter: true });
    await Messages.sync({ alter: true });
    await TaskColumn.sync({ alter: true });
    await Task.sync({ alter: true });
    await Event.sync({ alter: true });

    // Sync Kanban model last
    await Kanban.sync({ alter: true });

    console.log("Database reset complete!");
  } catch (error) {
    console.error("Error resetting the database:", error);
  }
})();
