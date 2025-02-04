import { Router } from "express";
import KanbanController from "../controllers/kanbanController.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const kanbanRouter = Router();
const {
  createKanban,
  getAllKanbans,
  getKanbanById,
  updateKanban,
  deleteKanban,
} = new KanbanController();

// Apply authentication middleware to all Kanban routes
kanbanRouter.post("/", authenticateJWT, createKanban);
kanbanRouter.get("/", authenticateJWT, getAllKanbans);
kanbanRouter.get("/:id", authenticateJWT, getKanbanById);
kanbanRouter.put("/:id", authenticateJWT, updateKanban);
kanbanRouter.delete("/:id", authenticateJWT, deleteKanban);

export default kanbanRouter;
