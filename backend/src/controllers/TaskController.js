import { Task } from "../models/association.js";

const createTask = async (req, res) => {
  try {
    // Add validation for required fields
    if (!req.body.task_name || !req.body.column_id) {
      return res.status(400).json({
        error: "Task name and column ID are required",
      });
    }

    // Ensure valid UUID format for relations
    if (!validator.isUUID(req.body.column_id)) {
      return res.status(400).json({
        error: "Invalid column ID format",
      });
    }

    const task = await Task.create({
      ...req.body,
      // Provide default values for required fields
      group_id: req.body.group_id || null, // If allowed to be null
      assigned_to: req.body.assigned_to || null,
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Creation Error:", error);
    res.status(500).json({
      error: "Task creation failed",
      details: error.errors?.map((e) => e.message),
    });
  }
};
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    const [updated] = await Task.update(req.body, {
      where: { task_id },
      returning: true, // For PostgreSQL
    });

    if (!updated) return res.status(404).json({ error: "Task not found" });
    const updatedTask = await Task.findByPk(task_id);
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteTask = async (req, res) => {
  try {
    const { task_id } = req.params;
    await Task.destroy({ where: { task_id } });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getTasksByGroup = async (req, res) => {
  try {
    const { group_id } = req.query; // Expecting the group ID as a query parameter
    if (!group_id) {
      return res.status(400).json({ error: "group_id is required" });
    }
    const tasks = await Task.findAll({
      where: { group_id },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createTask, getTasks, updateTask, deleteTask, getTasksByGroup};
