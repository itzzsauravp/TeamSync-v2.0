import { Router } from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
} from "../controllers/taskController.js";
const taskRouter = Router();

taskRouter.route("/").post(createTask).get(getTasks);

taskRouter.route("/:task_id").put(updateTask).delete(deleteTask);

export default taskRouter;
