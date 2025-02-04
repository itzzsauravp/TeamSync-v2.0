import { Sequelize } from "sequelize";
const sequelize = new Sequelize("TeamSync", "postgres", "root", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
  define: {
    freezeTableName: true,
  },
});

export default sequelize;
