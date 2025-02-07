import axiosInstance from "./axiosInstance";

const initialHiMessage = async (
  group_id: string,
  targetUserId: string,
  messageContent: null | string = null
) => {
  try {
    const responseInitial = await axiosInstance.get(
      `/user/profile/${targetUserId}`
    );
    const { data } = responseInitial;
    const username = data.user.username;
    const response = await axiosInstance.post("/message/send", {
      groupID: group_id,
      messageContent:
        messageContent || `Hey!! ${username} Lets connect and talk`,
    });
    return response.data;
  } catch (err) {
    console.error(
      "There was an error while sending the initial Hi message",
      err
    );
  }
};

const sendMessage = async (groupID: string, messageContent: string) => {
  try {
    const response = await axiosInstance.post("/message/send", {
      groupID,
      messageContent,
    });
    return response.data;
  } catch (err) {
    console.error("There was an error while sending the message", err);
  }
};

const getAllMessages = async (groupID: string) => {
  try {
    const response = await axiosInstance.get(`/message/all/${groupID}`);
    return response.data;
  } catch (err) {
    console.error("There was an error while fetching all the messages", err);
  }
};

const sendFileMessage = async (
  groupID: string,
  file: File,
  messageContent?: string
) => {
  try {
    const formData = new FormData();
    formData.append("groupID", groupID);
    if (messageContent) {
      formData.append("messageContent", messageContent);
    }
    formData.append("file", file);
    const response = await axiosInstance.post("/message/send-file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("There was an error while sending the file message", error);
  }
};

const updateFileMessage = async (
  msgID: string,
  file: File,
  messageContent?: string
) => {
  try {
    const formData = new FormData();
    if (messageContent) {
      formData.append("messageContent", messageContent);
    }
    formData.append("file", file);
    const response = await axiosInstance.put(
      `/message/update-file/${msgID}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("There was an error while updating the file message", error);
  }
};

const deleteFileMessage = async (msgID: string) => {
  try {
    const response = await axiosInstance.delete(
      `/message/delete-file/${msgID}`
    );
    return response.data;
  } catch (error) {
    console.error("There was an error while deleting the file message", error);
  }
};

const getFileData = async (msgID: string) => {
  try {
    const response = await axiosInstance.get(`/message/file/${msgID}`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("There was an error while fetching the file data", error);
  }
};

// New functions for text message update and delete.
const updateMessage = async (msgID: string, newMessageContent: string) => {
  try {
    const response = await axiosInstance.put(`/message/update/${msgID}`, {
      newMessageContent,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating message:", error);
  }
};

const deleteMessage = async (msgID: string) => {
  try {
    const response = await axiosInstance.delete(`/message/delete/${msgID}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
  }
};

export {
  initialHiMessage,
  sendMessage,
  getAllMessages,
  sendFileMessage,
  updateFileMessage,
  deleteFileMessage,
  getFileData,
  updateMessage,
  deleteMessage,
};
