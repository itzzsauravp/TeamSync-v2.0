import axiosInstance from "./axiosInstance";

const fetchAllGroups = async () => {
  try {
    const response = await axiosInstance.get("/group/list");
    return response.data;
  } catch (err) {
    console.error("There was an error while fetching all groups", err);
  }
};
const createOneonOneGroup = async (userId: string) => {
  try {
    const response = await axiosInstance.post("/group/one-on-one", {
      targetUserId: userId,
    });
    return response.data;
  } catch (err) {
    console.error("There was an error while creating a one on one group", err);
  }
};

const createGroupChat = async (groupName: string) => {
  const response = await axiosInstance.post("/group/create", { groupName });
  return response.data;
};

const fetchAllChatForUser = async () => {
  try {
    const response = await axiosInstance.get("/group/user-chat");
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  } catch (error) {
    console.error(
      "There was an error while fetching groups where the user is added",
      error
    );
    // Return empty default value
    return { chats: [] };
  }
};

const addUserToGroup = async (groupId: string, userId: string) => {
  try {
    const response = await axiosInstance.post("/group/add", {
      groupId,
      userId,
    });
    const { data } = response;
    if (data.success) {
      return response;
    } else {
      throw new Error();
    }
  } catch {
    console.error("Error while adding user to the group");
  }
};

const deleteGroup = async (groupId: string) => {
  try {
    const { data } = await axiosInstance.delete(`/group/delete/${groupId}`);
    return data;
  } catch (err) {
    console.error("Error deleting group:", err);
    return { success: false };
  }
};


export {
  fetchAllGroups,
  createOneonOneGroup,
  createGroupChat,
  fetchAllChatForUser,
  addUserToGroup,
  deleteGroup,
};
