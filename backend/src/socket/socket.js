import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "../../app.js";
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

const userSocketMap = {};

io.on("connection", (socket) => {
  const { userId } = socket.handshake.query;
  if (userId) userSocketMap[userId] = socket.id;
  io.emit("getActiveUsers", Object.keys(userSocketMap));

  socket.on("joinChat", (groupIDs) => {
    if (!groupIDs) { return };
    groupIDs.forEach(groupID => socket.join(groupID))
  })

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getActiveUsers", Object.keys(userSocketMap));
  });
});

export { server, io };
