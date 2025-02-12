import { Router } from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTasksByGroup,
  assignUserToTask,
  getTasksByUserId
} from "../controllers/TaskController.js";
const taskRouter = Router();

taskRouter.route("/").post(createTask).get(getTasks);

taskRouter.route("/:task_id").put(updateTask).delete(deleteTask);

taskRouter.post("/listByGroup", getTasksByGroup);
taskRouter.post("/listByUser", getTasksByUserId)

taskRouter.post("/assign", assignUserToTask);

export default taskRouter;
