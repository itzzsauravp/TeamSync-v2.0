import { Router } from "express";
import "dotenv/config";
import groupController from "../controllers/groupController.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const groupRouter = Router();
const {
  createGroup,
  addToGroup,
  listGroups,
  createOneOnOneChat,
  getUserChats,
  deleteGroup,
  updateGroupWeights,
  getGroupWeights,
  getGroupAndMembersDetails
} = new groupController();

groupRouter.post("/create", authenticateJWT, createGroup);
groupRouter.post("/add", authenticateJWT, addToGroup);
groupRouter.post("/one-on-one", authenticateJWT, createOneOnOneChat);
groupRouter.delete("/delete/:groupID", authenticateJWT, deleteGroup);
groupRouter.get("/list", listGroups);
groupRouter.get("/user-chat", authenticateJWT, getUserChats);
groupRouter.put("/update-weights", authenticateJWT, updateGroupWeights);
groupRouter.get("/weights/:groupID", getGroupWeights);
groupRouter.get("/list-details",authenticateJWT, getGroupAndMembersDetails);
export default groupRouter;
