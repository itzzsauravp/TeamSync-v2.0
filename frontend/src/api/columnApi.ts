import axiosInstance from "./axiosInstance";

class Column {
  // because of naming conflict
  async addColumnApi(group_id: string, column_name: string) {
    try {
      const response = await axiosInstance.post("/column/add", {
        group_id,
        column_name,
      });
      return { success: true, ...response.data };
    } catch (err) {
      console.log("there was error getting all columns", err);
      return { success: false };
    }
  }

  async removeColumnApi(column_id: string) {
    try {
      const response = await axiosInstance.post("/column/remove", {
        column_id,
      });
      return { success: true, ...response.data };
    } catch (e) {
      console.log("there was error removing column", e);
      return { success: false };
    }
  }

  async getAllColumnApi(group_id: string) {
    try {
      const response = await axiosInstance.post("/column/list", {
        group_id,
      });
    //   const result = {};
      return response;
    } catch {
      console.log("there was error getting all the columns");
      return { success: false };
    }
  }
}

export default Column;
