import { Users, GroupMembers } from "../models/association.js";
import { Op } from "@sequelize/core";

class UserController {
  // Get all users except the current user
  getAllUsers = async (req, res) => {
    try {
      // const users = await Users.findAll({
      //   where: {
      //     user_id: { [Op.ne]: req.user.user_id },
      //   },
      // });
      // why omit the current user?????
      const users = await Users.findAll();
      if (!users || users.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No users found" });
      }
      // Remove password from each user object
      const usersWithoutPassword = users.map((user) => {
        const userObject = user.toJSON();
        delete userObject.password;
        return userObject;
      });
      res.json({ success: true, users: usersWithoutPassword });
    } catch (err) {
      console.error("An error occurred while retrieving all the users", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Get users matching a username prefix, excluding the current user
  getSpecificUser = async (req, res) => {
    const { username } = req.body;
    try {
      const users = await Users.findAll({
        where: {
          username: { [Op.iLike]: `${username}%` },
          user_id: { [Op.ne]: req.user.user_id },
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
      const {
        username,
        first_name,
        last_name,
        phone_number,
        address,
        userExpertise,
      } = req.body;
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
      user.userExpertise = userExpertise || user.userExpertise;

      await user.save();
      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Error updating user",
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
        message: "Error deleting user",
        error_msg: err,
      });
    }
  };

  updateUserAttributes = async (req, res) => {
    try {
      const { userId, skillLevel, userBusyUntill, userExpertise } = req.body;
      if (!userId) {
        return res
          .status(400)
          .json({ success: false, message: "Missing userId in request body" });
      }
      const currentUserId = req.user.user_id;
      const adminMemberships = await GroupMembers.findAll({
        where: { user_id: currentUserId, role: "admin" },
        attributes: ["group_id"],
      });
      if (adminMemberships.length === 0) {
        return res
          .status(403)
          .json({ success: false, message: "You are not admin in any group" });
      }
      const adminGroupIds = adminMemberships.map(
        (membership) => membership.group_id
      );
      const commonMembership = await GroupMembers.findOne({
        where: {
          group_id: adminGroupIds,
          user_id: userId,
        },
      });
      if (!commonMembership) {
        return res.status(403).json({
          success: false,
          message: "You are not admin in a group that contains this user",
        });
      }
      const targetUser = await Users.findByPk(userId);
      if (!targetUser) {
        return res
          .status(404)
          .json({ success: false, message: "Target user not found" });
      }
      targetUser.skillLevel =
        skillLevel !== undefined ? skillLevel : targetUser.skillLevel;
      targetUser.userBusyUntill =
        userBusyUntill !== undefined
          ? userBusyUntill
          : targetUser.userBusyUntill;
      targetUser.userExpertise =
        userExpertise !== undefined ? userExpertise : targetUser.userExpertise;
      await targetUser.save();
      res.status(200).json({
        success: true,
        message: "User attributes updated successfully",
        user: targetUser,
      });
    } catch (error) {
      console.error("Error updating user attributes:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error_msg: error.message,
      });
    }
  };
}

export default UserController;
