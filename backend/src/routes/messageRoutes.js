// routes/messageRouter.js
import { Router } from "express";
import MessageController from "../controllers/messageController.js";
import authenticateJWT from "../middlewares/authenticateJWT.js";
import multer from "multer";

// Use Multer with memory storage so that the file is available as a Buffer
const upload = multer({ storage: multer.memoryStorage() });

const messageRouter = Router();
const {
  sendMessage,
  getAllMessage,
  updateMessage,
  deleteMessage,
  sendFileMessage,
  updateFileMessage,
  deleteFileMessage,
  getFileData,
} = new MessageController();

// Existing text message endpoints
messageRouter.post("/send", authenticateJWT, sendMessage);
messageRouter.get("/all/:groupID", authenticateJWT, getAllMessage);
messageRouter.put("/update/:msgID", authenticateJWT, updateMessage);
messageRouter.delete("/delete/:msgID", authenticateJWT, deleteMessage);

// New endpoints for file messages
messageRouter.post(
  "/send-file",
  authenticateJWT,
  upload.single("file"),
  sendFileMessage
);
messageRouter.put(
  "/update-file/:msgID",
  authenticateJWT,
  upload.single("file"),
  updateFileMessage
);
messageRouter.delete("/delete-file/:msgID", authenticateJWT, deleteFileMessage);

// Endpoint to retrieve the actual file binary data
messageRouter.get("/file/:msgID", authenticateJWT, getFileData);

export default messageRouter;
