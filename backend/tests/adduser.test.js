import app from "../app.js";
import request from "supertest";
import Functions from "./functions.js";
const { getRandomString, addUser } = new Functions();
// just add some random name user

describe("POST /user", () => {
    it("should add a new user to the database and return the user data", async () => {
        let userConfig = {
            "email": getRandomString(),
            "username": getRandomString(),
            "first_name": "firstName",
            "last_name": "lastname",
            "password": "password"
        };
        const response = await addUser(userConfig);
        // console.log("response is ");
        console.log(response.body);
        expect(response.body.success).toBe(true);
    })
})
