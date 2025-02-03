import { Messages, Users, Groups } from "../models/association.js";
import GroupMembers from "../models/GroupMembers.js";
import { io } from "../socket/socket.js";

class MessageController {
  // TODO encrypt the messages
  sendMessage = async (req, res) => {
    const { messageContent, groupID } = req.body;
    const sender_id = req.user.user_id;

    if (!messageContent || !groupID) {
      return res.status(400).json({
        success: false,
        message: "Message content or group ID is empty",
      });
    }

    try {
      const group = await Groups.findByPk(groupID);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found",
        });
      }

      const member = await GroupMembers.findOne({
        where: {
          group_id: groupID,
          user_id: sender_id,
        },
      });
      if (!member) {
        return res.status(403).json({
          success: false,
          message: "User is not a member of this group",
        });
      }

      const newMessage = await Messages.create({
        sender_id,
        group_id: groupID,
        message_content: messageContent,
      });

      const formattedMessage = await Messages.findByPk(newMessage.message_id, {
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["username", "profilePicture"],
          },
        ],
      }).then((message) => ({
        message_id: message.message_id,
        sender_id: message.sender_id,
        sender: message.user?.username || "Unknown",
        message_content: message.message_content,
        sent_at: message.sent_at,
        profilePicture: message.user?.profilePicture,
        is_current_user: message.sender_id === req.user.user_id,
      }));
      io.to(groupID).emit("newMessage", formattedMessage);
      res.status(201).json({
        success: true,
        message: formattedMessage,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({
        success: false,
        message: "Error occurred while sending the message",
      });
    }
  };

  getAllMessage = async (req, res) => {
    const { groupID } = req.params;
    const currentUserId = req.user.user_id;
    if (!groupID) {
      return res.status(404).json({
        success: false,
        message: "Group ID is empty",
      });
    }

    try {
      const messages = await Messages.findAll({
        where: { group_id: groupID },
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["username", "profilePicture"],
          },
        ],
        order: [["sent_at", "ASC"]],
      });

      if (!messages || messages.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No messages were found",
        });
      }
      const formattedMessages = messages.map((message) => ({
        message_id: message.message_id,
        sender_id: message.sender_id,
        sender: message.user ? message.user.username : "Unknown",
        message_content: message.message_content,
        sent_at: message.sent_at,
        profilePicture: message.user.profilePicture,
        is_current_user: message.sender_id === currentUserId,
      }));

      res.json({ success: true, messages: formattedMessages });
    } catch (err) {
      console.error("Error fetching messages:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while retrieving all messages",
      });
    }
  };

  updateMessage = async (req, res) => {
    const { newMessageContent } = req.body;
    const { msgID } = req.body;
    const currentUserID = req.user.user_id;
    try {
      const result = await Messages.findByPk(msgID);
      if (!result) {
        return res
          .status(400)
          .json({ success: false, message: "No message found" });
      }
      if (result.sender_id !== currentUserID) {
        return res.status(400).json({
          success: false,
          message: "User is not the sender for this message",
        });
      }
      result.message_content = newMessageContent;
      await result.save();
      res.json({ success: true, message: "message deleted successfully" });
    } catch (err) {
      console.error("An error occured during message update");
      res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  };

  deleteMessage = async (req, res) => {
    const { msgID } = req.body;
    const currentUserID = req.user.user_id;
    try {
      const result = await Messages.findByPk(msgID);
      if (!result) {
        return res
          .status(400)
          .json({ success: false, message: "No message found" });
      }
      if (result.sender_id !== currentUserID) {
        return res.status(400).json({
          success: false,
          message: "User is not the sender for this message",
        });
      }
      await result.destroy();
      res.json({ success: true, message: result });
    } catch (err) {
      console.error("An error occured during message delete");
      res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  };
}

export default MessageController;
