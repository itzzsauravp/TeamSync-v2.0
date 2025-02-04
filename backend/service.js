import { server } from "./src/socket/socket.js"; // HTTP server with Socket.IO attached
import sequelize from "./src/config/database.js";
import "dotenv/config";

const port = process.env.HOME_PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    server.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Unable to connect or sync the database:", error);
  }
};

startServer();
