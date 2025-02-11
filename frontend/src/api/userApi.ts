import axiosInstance from "./axiosInstance";

const updateUserInformation = async (reqBody: object) => {
  try {
    const response = await axiosInstance.put("/user/profile", reqBody);
    return response.data;
  } catch (err) {
    console.error("There was an error while updating your info", err);
  }
};

const deleteUser = async () => {
  try {
    const response = await axiosInstance.delete("/user/delete");
    return response.data;
  } catch (err) {
    console.error("There was an error while deleting your profile", err);
  }
};

const fetchUsers = async (reqBody: object) => {
  try {
    const response = await axiosInstance.post("/user/username", reqBody);
    if (!response.data?.users) {
      throw new Error("No users data received from server");
    }
    const { users } = response.data;
    const usersWithoutPassword = users.map((item: object) => {
      const { password, ...userWithoutPassword } = item;
      return userWithoutPassword;
    });
    return usersWithoutPassword;
  } catch (error) {
    console.error("There was an error while fetching users", error);
    // Return empty default value
    return [];
  }
};

const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get("/user/all");
    return response;
  }
  catch (e) {
    console.log("there was error getting all users");
  }
}

export { updateUserInformation, deleteUser, fetchUsers, fetchAllUsers };
