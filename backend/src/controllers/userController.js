import { Users } from "../models/association.js";
import { Op } from "@sequelize/core";
class UserController {
  getAllUsers = async (req, res) => {
    try {
      const users = await Users.findAll();
      if (!users) {
        return res
          .status(404)
          .json({ success: false, message: "No users found" });
      }
      const usersWithoutPassword = users.map((user) => {
        const userObject = user.toJSON();
        delete userObject.password;
        return userObject;
      });
      res.json({ success: true, users: usersWithoutPassword });
    } catch (err) {
      console.error("An error occured while retriving all the users", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getSpecificUser = async (req, res) => {
    const { username } = req.body;
    try {
      const users = await Users.findAll({
        where: {
          username: { [Op.iLike]: `${username}%` },
        },
      });
      if (users.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No such user found" });
      }
      res.json({ success: true, users });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getUserProfile = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await Users.findByPk(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.json({
        success: true,
        message: "Successfully fetched user profile",
        user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error fetching the user profile",
        error_msg: err,
      });
    }
  };

  updateUserProfile = async (req, res) => {
    try {
      const { username, first_name, last_name, phone_number, address } =
        req.body;
      const user = await Users.findByPk(req.user.user_id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      user.username = username || user.username;
      user.first_name = first_name || user.first_name;
      user.last_name = last_name || user.last_name;
      user.phone_number = phone_number || user.phone_number;
      user.address = address || user.address;

      await user.save();
      res.json({ success: true, message: "Profile updated Sucessfully", user });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error Updating user",
        error_msg: err,
      });
    }
  };

  deleteUserProfile = async (req, res) => {
    try {
      const { user_id } = req.user;
      const user = await Users.destroy({
        where: {
          user_id,
        },
      });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "Couldn't delete user" });
      }
      res.json({ success: true, message: "User deleted" });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error Deleting User",
        error_msg: err,
      });
    }
  };
}

export default UserController;
