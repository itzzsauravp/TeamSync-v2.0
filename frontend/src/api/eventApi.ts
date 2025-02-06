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

const getEventsForUser = async () => {
  try {
    const response = await axiosInstance.post("/event/user-events");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

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
      `/events/edit/${eventId}`,
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

export {
  createEvent,
  getEventsForUser,
  editEvent,
  deleteEvent,
  getAllGroupEvents,
};
