import Event from "../models/Event.js";
import GroupMembers from "../models/GroupMembers.js";
import { Op } from "sequelize";

class EventController {
  // Create Event
  createEvent = async (req, res) => {
    const { title, date, time, group_id, location, link, platform } = req.body;
    const user_id = req.user.user_id;

    try {
      // Check if the user is an admin of the group
      const isAdmin = await GroupMembers.findOne({
        where: {
          group_id,
          user_id,
          role: "admin",
        },
      });

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only group admins can create events",
        });
      }

      const newEvent = await Event.create({
        title,
        date,
        time,
        group_id,
        location,
        link,
        platform,
        created_by: user_id,
      });
      res.status(201).json({ success: true, event: newEvent });
    } catch (err) {
      console.error("An error occurred while creating the event", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  // Get all events created by the current user
  getEventsForUser = async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

      // Get events created by the current user
      const groupEvents = await Event.findAll({
        where: {
          created_by: user_id,
          date: { [Op.gte]: today }, // Only future events
        },
      });

      res.json({ success: true, groupEvents });
    } catch (err) {
      console.error("An error occurred while retrieving events", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  getAllEventsForUserGroups = async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get all groups the user is a member of
      const userMemberships = await GroupMembers.findAll({
        where: { user_id },
      });
      const groupIds = userMemberships.map((membership) => membership.group_id);

      // Get ALL events in those groups
      const groupEvents = await Event.findAll({
        where: {
          group_id: { [Op.in]: groupIds },
          date: { [Op.gte]: today },
        },
      });

      res.json({ success: true, groupEvents });
    } catch (err) {
      console.error("An error occurred while retrieving group events", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  // Edit Event
  editEvent = async (req, res) => {
    const { event_id } = req.params;
    const { title, date, time, location, link, platform } = req.body;
    const user_id = req.user.user_id;

    try {
      const event = await Event.findOne({ where: { event_id } });
      const isAdmin = await GroupMembers.findOne({
        where: {
          group_id: event.group_id,
          user_id,
          role: "admin",
        },
      });

      if (!isAdmin || event.created_by !== user_id) {
        return res.status(403).json({
          success: false,
          message: "Only the event creator (admin) can edit events",
        });
      }

      await Event.update(
        { title, date, time, location, link, platform },
        { where: { event_id } }
      );
      res.json({ success: true, message: "Event updated successfully" });
    } catch (err) {
      console.error("An error occurred while editing the event", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  // Delete Event
  deleteEvent = async (req, res) => {
    const { event_id } = req.params;
    const user_id = req.user.user_id;

    try {
      const event = await Event.findOne({ where: { event_id } });
      const isAdmin = await GroupMembers.findOne({
        where: {
          group_id: event.group_id,
          user_id,
          role: "admin",
        },
      });

      if (!isAdmin || event.created_by !== user_id) {
        return res.status(403).json({
          success: false,
          message: "Only the event creator (admin) can delete events",
        });
      }

      await Event.destroy({ where: { event_id } });
      res.json({ success: true, message: "Event deleted successfully" });
    } catch (err) {
      console.error("An error occurred while deleting the event", err);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  // Delete past events (optional)
  deletePastEvents = async () => {
    try {
      await Event.destroy({
        where: {
          date: { [Op.lt]: new Date(new Date() - 24 * 60 * 60 * 1000) },
        },
      });
    } catch (err) {
      console.error("An error occurred while deleting past events", err);
    }
  };
}

export default EventController;
