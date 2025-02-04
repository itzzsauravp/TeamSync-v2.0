import axiosInstance from "./axiosInstance";

const leaveGroup = async (groupId: string) => {
  try {
    const response = await axiosInstance.post("/group-members/leave", {
      groupId,
    });
    return response.data;
  } catch (err) {
    console.error("Error leaving group:");
    throw err;
  }
};

const removeMember = async (groupId: string, memberId: string) => {
  try {
    const response = await axiosInstance.delete("/group-members/remove", {
      data: { groupId, memberId },
    });
    return response.data;
  } catch (err) {
    console.error("Error removing member:");
    throw err;
  }
};

export { leaveGroup, removeMember };
