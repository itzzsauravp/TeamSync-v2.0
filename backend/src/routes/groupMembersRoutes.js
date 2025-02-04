import { Router } from "express";
import GroupMembersController from "../controllers/groupMembersController.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const groupMembersRouter = Router();
const { leaveGroup, removeMember } = new GroupMembersController();

// Endpoint for the current user to leave a group
groupMembersRouter.post("/leave", authenticateJWT, leaveGroup);

// Endpoint for an admin to remove a member from a group
groupMembersRouter.delete("/remove", authenticateJWT, removeMember);

export default groupMembersRouter;
