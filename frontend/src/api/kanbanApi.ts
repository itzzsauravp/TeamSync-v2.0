import axiosInstance from "./axiosInstance";

const createKanban = async (reqBody: {
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  dueDate?: string;
  status?: "todo" | "ongoing" | "pending_verification" | "completed";
}) => {
  try {
    const response = await axiosInstance.post("/kanban", reqBody);
    return response.data;
  } catch (err) {
    console.error("Error creating Kanban task:", err);
  }
};

const getAllKanbans = async () => {
  try {
    const response = await axiosInstance.get("/kanban");
    return response.data;
  } catch (err) {
    console.error("Error fetching Kanban tasks:", err);
    return { tasks: [] };
  }
};

const getKanbanById = async (kanbanId: string) => {
  try {
    const response = await axiosInstance.get(`/kanban/${kanbanId}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching Kanban task:", err);
  }
};

const updateKanban = async (
  kanbanId: string,
  reqBody: {
    title?: string;
    description?: string;
    priority?: "high" | "medium" | "low";
    dueDate?: string;
    status?: "todo" | "ongoing" | "pending_verification" | "completed";
  }
) => {
  try {
    const response = await axiosInstance.put(`/kanban/${kanbanId}`, reqBody);
    return response.data;
  } catch (err) {
    console.error("Error updating Kanban task:", err);
  }
};

const deleteKanban = async (kanbanId: string) => {
  try {
    const response = await axiosInstance.delete(`/kanban/${kanbanId}`);
    return response.data;
  } catch (err) {
    console.error("Error deleting Kanban task:", err);
  }
};

export { createKanban, getAllKanbans, getKanbanById, updateKanban, deleteKanban };
