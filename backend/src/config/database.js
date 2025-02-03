import { Sequelize } from "sequelize";
const sequelize = new Sequelize("TeamSync", "postgres", "root", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
  define: {
    freezeTableName: true,
  },
});

// NOTE: TO RESET THE DATABASE AND CLEAR ALL THE ENTIRES.....

// (async () => {
//   try {
//     await sequelize.sync({ force: true });
//     console.log("Database reset complete!");
//   } catch (error) {
//     console.error("Error resetting the database:", error);
//   }
// })();

export default sequelize;
