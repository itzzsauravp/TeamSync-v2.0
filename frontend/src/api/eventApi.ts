import axiosInstance from "./axiosInstance";

const createEvent = async (eventDetails: object) => {
  try {
    const response = await axiosInstance.post("/event/create", eventDetails);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// this is to get all the events that is created by the user.
const getEventsForUser = async () => {
  try {
    const response = await axiosInstance.post("/event/user-events");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// this is to get all the events from all the groups that the user is associated with.
const getAllGroupEvents = async () => {
  try {
    const response = await axiosInstance.post("/event/group-events");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const editEvent = async (eventId: string, eventDetails: object) => {
  try {
    const response = await axiosInstance.put(
      `/event/edit/${eventId}`,
      eventDetails
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const deleteEvent = async (eventId: string) => {
  try {
    const response = await axiosInstance.delete(`/event/delete/${eventId}`);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getEventsForGroup = async (groupId: string) => {
  try {
    const response = await axiosInstance.get(`/event/group/${groupId}`);
    return response.data;
  } catch (err) {
    console.error("Error fetching events for group:", err);
    throw err;
  }
};

export {
  createEvent,
  getEventsForUser,
  editEvent,
  deleteEvent,
  getAllGroupEvents,
  getEventsForGroup,
};
