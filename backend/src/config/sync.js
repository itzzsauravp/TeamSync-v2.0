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
    await Users.sync({ force: true });
    await Groups.sync({ force: true });
    await GroupMembers.sync({ force: true });
    await Messages.sync({ force: true });
    await TaskColumn.sync({ force: true });
    await Task.sync({ force: true });
    await Event.sync({ force: true });

    // Sync Kanban model last
    await Kanban.sync({ force: true });

    console.log("Database reset complete!");
  } catch (error) {
    console.error("Error resetting the database:", error);
  }
})();
