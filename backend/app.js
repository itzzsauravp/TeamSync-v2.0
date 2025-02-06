import express from "express";
import cors from "cors";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import messageRouter from "./src/routes/messageRoutes.js";
import groupRouter from "./src/routes/groupRoutes.js";
import columnRouter from "./src/routes/columnRoutes.js";
import taskRouter from "./src/routes/taskRoutes.js";
import kanbanRouter from "./src/routes/kanbanRoutes.js";
import groupMembersRouter from "./src/routes/groupMembersRoutes.js";
import eventRouter from "./src/routes/eventRoutes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    method: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/group", groupRouter);
app.use("/api/v1/column", columnRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/kanban", kanbanRouter);
app.use("/api/v1/group-members", groupMembersRouter);
app.use("/api/v1/event", eventRouter);
export { app };
