import { Task } from "../models/association.js";

const createTask = async (req, res) => {
  console.log("tyring to create task");
  console.log(req.body);
  try {
    // Add validation for required fields
    /* if (!req.body.task_name || !req.body.column_id) {
      return res.status(400).json({
        error: "Task name and column ID are required",
      });
    } */

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
    const { group_id } = req.body; 
    if (!group_id) {
      return res.status(400).json({ error: "group_id is required" });
    }
    const tasks = await Task.findAll({
      where: { group_id },
    });
    res.json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const assignUserToTask = async (req, res) => {
  try {
    const { task_id } = req.body; 
    const { user_id } = req.body;

    if (!task_id) {
      return res.status(400).json({ message: "Task ID is required." });
    }

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required to assign." });
    }

    // Check if the task exists (optional but recommended)
    const task = await Task.findByPk(task_id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // You might want to check if the user exists as well in your users table
    // before assigning, but for this example, we'll assume userId is valid.

    const updatedTask = await Task.update(
      { assigned_to: user_id }, // Fields to update
      {
        where: {
          task_id: task_id,    // Condition to find the task
        },
      }
    );

    if (updatedTask[0] === 0) {
      // updatedTask is an array, and the first element is the number of rows affected.
      // If it's 0, no rows were updated, which might mean task not found again (unlikely here)
      return res.status(404).json({ message: "Task not found or no changes applied." }); // More generic message
    }

    // Fetch the updated task to return in the response (optional)
    const fetchedUpdatedTask = await Task.findByPk(task_id);


    res.status(200).json({
      message: "User assigned to task successfully.",
      task: fetchedUpdatedTask, // Optionally return the updated task
    });

  } catch (error) {
    console.error("Error assigning user to task:", error);
    res.status(500).json({ message: "Error assigning user to task.", error: error.message });
  }
};

const getTasksByUserId = async (req, res) => {
  try {
    const { user_id } = req.body; // Assuming userId is passed as a route parameter

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const tasks = await Task.findAll({
      where: {
        assigned_to: user_id,
      },
    });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found for this user." });
    }

    res.status(200).json({
      message: "Tasks fetched successfully for user.",
      tasks: tasks,
    });
  } catch (error) {
    console.error("Error fetching tasks by user ID:", error);
    res.status(500).json({
      message: "Error fetching tasks by user ID.",
      error: error.message,
    });
  }
};


export { createTask, getTasks, updateTask, deleteTask, getTasksByGroup, assignUserToTask, getTasksByUserId};
