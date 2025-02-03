import axiosInstance from "./axiosInstance";

const initialHiMessage = async (group_id, targetUserId) => {
  try {
    const responseInitial = await axiosInstance.get(
      `/user/profile/${targetUserId}`
    );
    const { data } = responseInitial;
    const username = data.user.username;
    const response = await axiosInstance.post("/message/send", {
      groupID: group_id,
      messageContent: `Hey!! ${username} Lets connect and talk`,
    });
    return response.data;
  } catch (err) {
    console.error(
      "There was an error while sending the initial Hi message",
      err
    );
  }
};

const sendMessage = async (groupID, messageContent) => {
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

const getAllMessages = async (groupID) => {
  try {
    const response = await axiosInstance.get(`/message/all/${groupID}`);
    return response.data;
  } catch (err) {
    console.error("There was an error while fetching all the messages", err);
  }
};

export { initialHiMessage, sendMessage, getAllMessages };
