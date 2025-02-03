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
} = new groupController();

groupRouter.post("/create", authenticateJWT, createGroup);
groupRouter.post("/add", authenticateJWT, addToGroup);
groupRouter.post("/one-on-one", authenticateJWT, createOneOnOneChat);
groupRouter.get("/list", listGroups);
groupRouter.get("/user-chat", authenticateJWT, getUserChats);
export default groupRouter;
