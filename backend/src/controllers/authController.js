import { Users } from "../models/association.js";
import { Op } from "@sequelize/core";
import { comparePassword, hashPassword } from "../services/passwordService.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

class AuthController {
  async registerUser(req, res) {
    const { email, gender, username, first_name, last_name, password } =
      req.body;
    const hashedPassword = await hashPassword(password);
    const userExists = await Users.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (userExists) {
      if (userExists.username === username) {
        return res
          .status(400)
          .json({ success: false, message: "Username is already taken" });
      }
      if (userExists.email === email) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already registered" });
      }
      return res.status(400).json({
        success: false,
        message: "Username or email is already taken",
      });
    }

    try {
      await Users.create({
        email,
        username,
        first_name,
        last_name,
        gender,
        password: hashedPassword,
        profilePicture: `https://avatar.iran.liara.run/public/${
          gender === "male" ? "boy" : "girl"
        }?username=${username}`,
      });
      res.json({ success: true, message: "User created successfully" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Unable to create user",
      });
    }
  }

  loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await Users.findOne({ where: { username } });
      if (user && (await comparePassword(password, user.password))) {
        const tokenPayload = {
          user_id: user.user_id,
          email: user.email,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        res.json({
          success: true,
          message: "Welcome to TeamSync",
          token,
          userId: user.user_id,
        });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Credentials Mismatch" });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "An error occurred during login",
        error_msg: err,
      });
    }
  };

  validateToken = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      const { user_id } = decode;
      const user = await Users.findByPk(user_id, {
        attributes: [
          "user_id",
          "username",
          "email",
          "first_name",
          "last_name",
          "gender",
          "address",
          "phone_number",
          "profilePicture",
          "userExpertise",
          "skillLevel",
          "userBusyUntill",
        ],
      });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Sorry!! an error occured",
        error_msg: err,
      });
    }
  };
}

export default AuthController;
