import {
  GroupMembers,
  Groups,
  Messages,
  Users,
} from "../models/association.js";
import { Op } from "@sequelize/core";
class GroupController {
  createGroup = async (req, res) => {
    const { groupName } = req.body;
    const creatorUserId = req.user.user_id;
    if (!groupName) {
      return res.json({
        success: false,
        message: "Group name is invalid or empty",
      });
    }
    try {
      const group = await Groups.create({ group_name: groupName });
      await GroupMembers.create({
        group_id: group.group_id,
        user_id: creatorUserId,
        role: "admin",
      });

      res.json({
        success: true,
        message: `Group '${groupName}' created and you are the admin`,
        groupId: group.group_id,
      });
    } catch (err) {
      console.error("Error creating group:", err);
      res.json({
        success: false,
        message: `Cannot create group '${groupName}'`,
      });
    }
  };

  listGroups = async (req, res) => {
    try {
      const groups = await Groups.findAll();
      res.json({ success: true, groups });
    } catch (err) {
      console.error("Error listing groups:", err);
      res.json({ success: false, message: "Unable to list groups" });
    }
  };

  addToGroup = async (req, res) => {
    const { groupId, userId } = req.body;
    const invitersUserId = req.user.user_id;

    if (!groupId || !userId) {
      return res.json({
        success: false,
        message: "Group ID or User ID is empty",
      });
    }

    try {
      const canInviteOthers = await GroupMembers.findOne({
        where: {
          user_id: invitersUserId,
          role: { [Op.or]: ["admin", "moderator"] },
        },
      });

      if (!canInviteOthers) {
        return res.json({
          success: false,
          message: "User must be an admin or moderator to send invites",
        });
      }

      await GroupMembers.create({ group_id: groupId, user_id: userId });
      res.json({ success: true, message: "User added to group" });
    } catch (err) {
      console.error("Error adding user to group:", err);
      res.json({ success: false, message: "Couldn't add user to group" });
    }
  };

  createOneOnOneChat = async (req, res) => {
    const { targetUserId } = req.body;
    const currentUserId = req.user.user_id;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Target user ID is empty",
      });
    }

    try {
      const existingGroup = await Groups.findOne({
        include: [
          {
            model: GroupMembers,
            where: {
              [Op.or]: [{ user_id: currentUserId }, { user_id: targetUserId }],
            },
          },
        ],
        where: {
          group_name: {
            [Op.or]: [
              `${currentUserId}/${targetUserId}`,
              `${targetUserId}/${currentUserId}`,
            ],
          },
        },
      });

      if (existingGroup) {
        return res.status(200).json({
          success: false,
          group: existingGroup,
          message: "Chat already exists",
        });
      }

      const groupName = `${currentUserId}/${targetUserId}`;
      const group = await Groups.create({ group_name: groupName });

      await GroupMembers.bulkCreate([
        { group_id: group.group_id, user_id: currentUserId, role: "admin" },
        { group_id: group.group_id, user_id: targetUserId },
      ]);

      return res.status(201).json({
        success: true,
        group,
        message: "New chat created",
      });
    } catch (err) {
      console.error("Error creating one-on-one chat:", err);
      res.status(500).json({
        success: false,
        message: "Cannot create chat",
      });
    }
  };
  getUserChats = async (req, res) => {
    const userId = req.user.user_id;
    try {
      const userGroups = await GroupMembers.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Groups,
            include: [
              {
                model: GroupMembers,
                include: [
                  {
                    model: Users,
                    attributes: ["user_id", "username", "profilePicture"],
                  },
                ],
              },
            ],
          },
        ],
        order: [[Groups, "updatedAt", "DESC"]],
      });
      if (!userGroups?.length) {
        return res
          .status(404)
          .json({ success: false, message: "No chats found for this user" });
      }
      const formattedGroups = userGroups
        .map((groupMember) => {
          const group = groupMember.group;
          if (!group) return null;
          const groupMembers = group.groupMembers || [];
          const isDirectMessage = groupMembers.length === 2;
          let groupName, chatInfo;
          if (isDirectMessage) {
            const otherMember = groupMembers.find(
              (member) => member.user_id !== userId
            );
            if (!otherMember?.user) return null;
            groupName = `${otherMember.user.username}`;
            chatInfo = {
              otherUser: {
                user_id: otherMember.user.user_id,
                username: otherMember.user.username,
                profilePicture: otherMember.user.profilePicture,
              },
            };
          } else {
            groupName = group.group_name;
            chatInfo = {
              members: groupMembers
                .map((member) => ({
                  user_id: member.user.user_id,
                  username: member.user.username,
                  profilePicture: member.user.profilePicture,
                  role: member.role,
                }))
                .filter(Boolean),
            };
          }
          return {
            group_id: group.group_id,
            group_name: groupName,
            is_direct_message: isDirectMessage,
            chat_info: chatInfo,
            member_count: groupMembers.length,
            created_at: group.createdAt,
          };
        })
        .filter(Boolean);
      res.json({
        success: true,
        total_chats: formattedGroups.length,
        chats: formattedGroups,
      });
    } catch (error) {
      console.error("Error in getUserChats:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user chats",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  };
}

export default GroupController;
