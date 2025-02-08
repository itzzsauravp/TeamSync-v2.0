// import { app } from "../app.js";
import { server } from "../src/socket/socket.js";
import request from "supertest";
import sequelize from "../src/config/database.js";
import Groups from "../src/models/Groups.js";
import Users from "../src/models/Users.js";
import Messages from "../src/models/Messages.js";
import GroupMembers from "../src/models/GroupMembers.js";

let app = server;
class Functions {

  async initdb() {
    request(app);
    try {
      // Messages.belongsTo(Groups, { foreignKey: 'group_id', as: 'groups' });
      // Groups.belongsTo(Users, { foreignKey: 'user_id', as: 'groups' });
      await Users.sync({ force: true });
      await sequelize.sync({ force: true });
      console.log("syncing database success");
    } catch (e) {
      console.log(e);
      console.log("database syncing error");
    }
  }

  getRandomString() {
    return (Math.random() + 1).toString(36).substring(7);
  }

  async addUser(config) {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(config);
    return response;
  }

  async loginUser(config) {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(config)
    // console.log(response._body.token);
    return response;
  }

  async makeGroup(config, token) {
    const response = await request(app)
      .post("/api/v1/group/create")
      .set("Authorization", `Bearer ${token}`)
      .send(config)
    return response;

  }

  async addToGroup(config, token) {
    // i need group id and user id to 
    const response = await request(app)
      .post("/api/v1/group/add")
      .set("Authorization", `Bearer ${token}`)
      .send(config)
    return response

  }
  async sendMessage(groupId, config, token) {
    const response = await request(app)
      .post(`/api/v1/message/send`)
      .set("Authorization", `Bearer ${token}`)
      .send({...config, groupID:groupId})
    return response;
  }
  async getAllMessage(groupId, token) {
    const response = await request(app)
      .get(`/api/v1/message/all/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send()
    return response;
  }
  async addColumn(group_id, column_name, token) {
    const obj = {
      group_id,
      column_name,
    }
    const response = await request(app)
      .post("/api/v1/column/add")
      .set("Authorization", `Bearer ${token}`)
      .send(obj)
    return response;
  }
  async listColumn(group_id, token) {
    const response = await request(app)
      .post("/api/v1/column/list")
      .set("Authorization", `Bearer ${token}`)
      .send({ group_id })
    return response;
  }
  async addTask(task_name, column_id, token) {
    const response = await request(app)
      .post("/api/v1/task/add")
      .set("Authorization", `Bearer ${token}`)
      .send({ task_name, column_id })
    return response;
  }

}
export default Functions;
