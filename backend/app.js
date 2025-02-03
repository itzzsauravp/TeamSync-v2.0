import express from "express";
import cors from "cors";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import messageRouter from "./src/routes/messageRoutes.js";
import groupRouter from "./src/routes/groupRoutes.js";
import columnRouter from "./src/routes/columnRoutes.js";
import taskRouter from "./src/routes/taskRoutes.js";

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

export { app };
