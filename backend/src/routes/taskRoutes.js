import { Router } from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTasksByGroup
} from "../controllers/TaskController.js";
const taskRouter = Router();

taskRouter.route("/").post(createTask).get(getTasks);

taskRouter.route("/:task_id").put(updateTask).delete(deleteTask);

taskRouter.get("/listByGroup", getTasksByGroup);

export default taskRouter;
