import Kanban from "../models/Kanban.js";

class KanbanController {
  createKanban = async (req, res) => {
    const { title, description, priority, dueDate, status } = req.body;
    const user_id = req.user.user_id;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required." });
    }

    try {
      const task = await Kanban.create({
        title,
        description,
        priority,
        dueDate,
        status,
        user_id,
      });
      return res.status(201).json({ success: true, task });
    } catch (error) {
      console.error("Error creating Kanban task:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };

  getAllKanbans = async (req, res) => {
    const user_id = req.user.user_id;
    try {
      const tasks = await Kanban.findAll({ where: { user_id } });
      return res.status(200).json({ success: true, tasks });
    } catch (error) {
      console.error("Error fetching Kanban tasks:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };

  getKanbanById = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;
    try {
      const task = await Kanban.findOne({ where: { kanban_id: id, user_id } });
      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found." });
      }
      return res.status(200).json({ success: true, task });
    } catch (error) {
      console.error("Error fetching Kanban task:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };

  updateKanban = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;
    const { title, description, priority, dueDate, status } = req.body;
    try {
      const task = await Kanban.findOne({ where: { kanban_id: id, user_id } });
      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found." });
      }
      task.title = title || task.title;
      task.description = description || task.description;
      task.priority = priority || task.priority;
      task.dueDate = dueDate || task.dueDate;
      task.status = status || task.status;
      await task.save();
      return res.status(200).json({ success: true, task });
    } catch (error) {
      console.error("Error updating Kanban task:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };

  deleteKanban = async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.user_id;
    try {
      const task = await Kanban.findOne({ where: { kanban_id: id, user_id } });
      if (!task) {
        return res
          .status(404)
          .json({ success: false, message: "Task not found." });
      }
      await task.destroy();
      return res
        .status(200)
        .json({ success: true, message: "Task deleted successfully." });
    } catch (error) {
      console.error("Error deleting Kanban task:", error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  };
}

export default KanbanController;
