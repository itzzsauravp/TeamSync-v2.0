import { Router } from "express";
import MessageController from "../controllers/messageController.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";

const messageRouter = Router();
const { sendMessage, getAllMessage, updateMessage, deleteMessage } =
  new MessageController();

messageRouter.post("/send", authenticateJWT, sendMessage);
messageRouter.get("/all/:groupID", authenticateJWT, getAllMessage);
messageRouter.put("/update/:msgID", authenticateJWT, updateMessage);
messageRouter.delete("/delete/:msgID", authenticateJWT, deleteMessage);

export default messageRouter;
