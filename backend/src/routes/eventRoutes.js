import { Router } from "express";
import EventController from "../controllers/eventController.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const eventRouter = Router();
const {
  createEvent,
  getEventsForUser,
  getAllEventsForUserGroups,
  editEvent,
  deleteEvent,
} = new EventController();

eventRouter.post("/create", authenticateJWT, createEvent);
eventRouter.post("/user-events", authenticateJWT, getEventsForUser);
eventRouter.post("/group-events", authenticateJWT, getAllEventsForUserGroups);
eventRouter.put("/edit/:event_id", authenticateJWT, editEvent);
eventRouter.delete("/delete/:event_id", authenticateJWT, deleteEvent);

export default eventRouter;
