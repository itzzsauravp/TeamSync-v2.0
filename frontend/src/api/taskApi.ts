import axiosInstance from "./axiosInstance";

async function addTask(task_name, column_id) {
  try {
    const response = await axiosInstance.post("task/add", {
      task_name,
      column_id,
    });
    return { success: true, ...response.data };
  } catch (e) {
    console.log("there was an error adding task", e);
    return { success: false };
  }
}
async function removeTask(task_id) {
  const response = await axiosInstance.post(`task/remove/${task_id}`);
  return { success: true, ...response.data };
}
async function listTask(column_id) {
  try {
    const response = await axiosInstance.post(`task/list`, { column_id });
    return { success: true, ...response.data };
  } catch (e) {
    console.log("there was error" + e);
    return { success: false };
  }
}
async function createTaskApi(taskPayload) {
  try {
    const response = await axiosInstance.post("task/", taskPayload);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error };
  }
}
async function listGroupTasksApi(group_id) {
  try {
    const response = await axiosInstance.post("task/listByGroup", { group_id });
    // console.log("this is api from frontend");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching group tasks:", error);
    return { success: false, error };
  }
}
async function listUserTasksApi(user_id) {
  try {
    const response = await axiosInstance.post("task/listByUser", { user_id });
    // console.log("this is api from frontend");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching user tasks:", error);
    return { success: false, error };
  }
}
async function assignTaskApi(user_id, task_id){
  try {
    const response = await axiosInstance.post("task/assign", { user_id, task_id});
    // console.log("this is api from frontend");
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
}

async function listAllGroupsTasks() {
  try {
    const response = await axiosInstance.get("task/user-group-task");
    const { data } = response;
    return data.tasks;
  } catch (error) {
    console.error("Error fetching all the group's tasks:", error);
    return { success: false, error };
  }
}

async function listAllGroupsTasks() {
  try {
    const response = await axiosInstance.get("task/user-group-task");
    const { data } = response;
    return data.tasks;
  } catch (error) {
    console.error("Error fetching all the group's tasks:", error);
    return { success: false, error };
  }
}

export {
  addTask,
  removeTask,
  listTask,
  createTaskApi,
  listGroupTasksApi,
  listUserTasksApi,
  listAllGroupsTasks,
  assignTaskApi
};
