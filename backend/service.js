import { server } from "./src/socket/socket.js"; // Import the HTTP server with Socket.IO attached
import sequelize from "./src/config/database.js";
import "dotenv/config";

const port = process.env.HOME_PORT || 3000;

server.listen(port, async () => {
  console.log(`Server is running at http://localhost:${port}`);

  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
