import { Router } from "express";
import {
  createTask,
  updateTask,
  deleteTask,
  getTasks,
  getTasksByGroup,
  assignUserToTask,
  getTasksByUserId,
  getUserGroupTasks,
} from "../controllers/TaskController.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const taskRouter = Router();

// taskRouter.route("/").post(createTask).get(getTasks);
taskRouter.post("/", authenticateJWT, createTask);
taskRouter.get("/", authenticateJWT, getTasks);

taskRouter.route("/:task_id").put(updateTask).delete(deleteTask);

taskRouter.post("/listByGroup", getTasksByGroup);
taskRouter.post("/listByUser", getTasksByUserId);

taskRouter.post("/assign", assignUserToTask);
taskRouter.get("/user-group-task", authenticateJWT, getUserGroupTasks);

export default taskRouter;
