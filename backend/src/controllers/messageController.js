import { Messages, Users, Groups } from "../models/association.js";
import GroupMembers from "../models/GroupMembers.js";
import { io } from "../socket/socket.js";
import { encryptMessage, decryptMessage } from "../utils/cryptoUtil.js";
class MessageController {
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

      const encryptedContent = encryptMessage(messageContent);

      const newMessage = await Messages.create({
        sender_id,
        group_id: groupID,
        message_content: encryptedContent,
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
        message_content: decryptMessage(message.message_content),
        sender: message.user?.username || "Unknown",
        sent_at: message.sent_at,
        profilePicture: message.user?.profilePicture,
        is_current_user: message.sender_id === req.user.user_id,
        group_id: groupID,
      }));
      io.to(groupID).emit("newMessage", formattedMessage);
      return res.status(201).json({
        success: true,
        message: formattedMessage,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      return res.status(500).json({
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
        message_content: decryptMessage(message.message_content),
        file_name: message.file_name,
        file_type: message.file_type,
        sent_at: message.sent_at,
        profilePicture: message.user?.profilePicture,
        is_current_user: message.sender_id === currentUserId,
        group_id: groupID,
      }));

      return res.json({ success: true, messages: formattedMessages });
    } catch (err) {
      console.error("Error fetching messages:", err);
      return res.status(500).json({
        success: false,
        message: "An error occurred while retrieving all messages",
      });
    }
  };

  // ----- Update Text Message -----
  updateMessage = async (req, res) => {
    const { newMessageContent } = req.body;
    const { msgID } = req.params;
    const currentUserID = req.user.user_id;
    try {
      const messageToUpdate = await Messages.findByPk(msgID);
      if (!messageToUpdate) {
        return res
          .status(400)
          .json({ success: false, message: "No message found" });
      }
      if (messageToUpdate.sender_id !== currentUserID) {
        return res.status(400).json({
          success: false,
          message: "User is not the sender for this message",
        });
      }
      // Update the content
      messageToUpdate.message_content = newMessageContent;
      await messageToUpdate.save();

      // Retrieve the updated message with user info and add an "edited" flag
      const formattedMessage = await Messages.findByPk(msgID, {
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["username", "profilePicture"],
          },
        ],
      }).then((msg) => ({
        message_id: msg.message_id,
        sender_id: msg.sender_id,
        sender: msg.user?.username || "Unknown",
        message_content: msg.message_content,
        file_name: msg.file_name,
        file_type: msg.file_type,
        sent_at: msg.sent_at,
        profilePicture: msg.user?.profilePicture,
        is_current_user: msg.sender_id === req.user.user_id,
        edited: msg.updatedAt.getTime() !== msg.createdAt.getTime(),
      }));

      // Emit the updated message to the group room
      io.to(messageToUpdate.group_id).emit("updateMessage", formattedMessage);
      return res.json({ success: true, message: formattedMessage });
    } catch (err) {
      console.error("An error occurred during message update", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  // ----- Delete Text Message -----
  deleteMessage = async (req, res) => {
    const { msgID } = req.params;
    const currentUserID = req.user.user_id;

    try {
      const messageToDelete = await Messages.findByPk(msgID);
      if (!messageToDelete) {
        return res
          .status(400)
          .json({ success: false, message: "No message found" });
      }
      if (messageToDelete.sender_id !== currentUserID) {
        return res.status(400).json({
          success: false,
          message: "User is not the sender for this message",
        });
      }

      await messageToDelete.destroy();

      // Emit deletion event so all clients remove this message
      io.to(messageToDelete.group_id).emit("deleteMessage", {
        message_id: msgID,
      });
      return res.json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (err) {
      console.error("An error occurred during message delete", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  // ----- Send File Message -----
  sendFileMessage = async (req, res) => {
    const { groupID, messageContent } = req.body;
    const sender_id = req.user.user_id;

    if (!req.file || !groupID) {
      return res.status(400).json({
        success: false,
        message: "File or group ID is missing.",
      });
    }

    try {
      // Validate group and membership
      const group = await Groups.findByPk(groupID);
      if (!group) {
        return res
          .status(404)
          .json({ success: false, message: "Group not found." });
      }
      const member = await GroupMembers.findOne({
        where: { group_id: groupID, user_id: sender_id },
      });
      if (!member) {
        return res.status(403).json({
          success: false,
          message: "User is not a member of this group.",
        });
      }

      // Create a new message with file attachment
      const newMessage = await Messages.create({
        sender_id,
        group_id: groupID,
        message_content: messageContent || "", // optional caption
        file_data: req.file.buffer,
        file_name: req.file.originalname,
        file_type: req.file.mimetype,
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
        file_name: message.file_name,
        file_type: message.file_type,
        sent_at: message.sent_at,
        profilePicture: message.user?.profilePicture,
        is_current_user: message.sender_id === req.user.user_id,
        group_id: groupID,
      }));

      io.to(groupID).emit("newMessage", formattedMessage);
      return res.status(201).json({ success: true, message: formattedMessage });
    } catch (err) {
      console.error("Error sending file message:", err);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending the file.",
      });
    }
  };

  // ----- Update File Message -----
  updateFileMessage = async (req, res) => {
    const { msgID } = req.params;
    const { messageContent } = req.body; // optional caption update
    const sender_id = req.user.user_id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file provided for update." });
    }

    try {
      const message = await Messages.findByPk(msgID);
      if (!message) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found." });
      }
      if (message.sender_id !== sender_id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this file.",
        });
      }

      // Update the file data and optional caption
      message.file_data = req.file.buffer;
      message.file_name = req.file.originalname;
      message.file_type = req.file.mimetype;
      if (messageContent !== undefined) {
        message.message_content = messageContent;
      }
      await message.save();

      const formattedMessage = await Messages.findByPk(message.message_id, {
        include: [
          {
            model: Users,
            as: "user",
            attributes: ["username", "profilePicture"],
          },
        ],
      }).then((msg) => ({
        message_id: msg.message_id,
        sender_id: msg.sender_id,
        sender: msg.user?.username || "Unknown",
        message_content: msg.message_content,
        file_name: msg.file_name,
        file_type: msg.file_type,
        sent_at: msg.sent_at,
        profilePicture: msg.user?.profilePicture,
        is_current_user: msg.sender_id === sender_id,
        edited: msg.updatedAt.getTime() !== msg.createdAt.getTime(),
      }));

      io.to(message.group_id).emit("updateMessage", formattedMessage);
      return res.json({ success: true, message: formattedMessage });
    } catch (err) {
      console.error("Error updating file message:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error while updating file.",
      });
    }
  };

  // ----- Delete File Message -----
  deleteFileMessage = async (req, res) => {
    const { msgID } = req.params;
    const sender_id = req.user.user_id;

    try {
      const message = await Messages.findByPk(msgID);
      if (!message) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found." });
      }
      if (message.sender_id !== sender_id) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this file.",
        });
      }

      await message.destroy();
      io.to(message.group_id).emit("deleteMessage", { message_id: msgID });
      return res.json({
        success: true,
        message: "File message deleted successfully.",
      });
    } catch (err) {
      console.error("Error deleting file message:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error while deleting file message.",
      });
    }
  };

  // ----- Retrieve File Data -----
  getFileData = async (req, res) => {
    const { msgID } = req.params;
    try {
      const message = await Messages.findByPk(msgID);
      if (!message || !message.file_data) {
        return res
          .status(404)
          .json({ success: false, message: "File not found." });
      }
      res.set("Content-Type", message.file_type);
      return res.send(message.file_data);
    } catch (err) {
      console.error("Error retrieving file data:", err);
      return res.status(500).json({
        success: false,
        message: "Internal server error while retrieving file data.",
      });
    }
  };
}

export default MessageController;
