import axiosInstance from "./axiosInstance";

class Task {
    async addTask(task_name, column_id) {
        try {
            const response = await axiosInstance.post("task/add", {
                task_name, column_id
            })
            return { success: true, ...response.data };
        }
        catch (e) {
            console.log("there was an error adding task", e);
            return { success: false };
        }
    }
    async removeTask(task_id) {
        const response = await axiosInstance.post(`task/remove/${task_id}`);
        return { success: true, ...response.data };
    }
    async listTask(column_id) {
        try {
            const response = await axiosInstance.post(`task/list`, { column_id });
            return { success: true, ...response.data };
        }
        catch (e) {
            console.log("there was error" + e);
            return { success: false };
        }
    }
}

export default Task;