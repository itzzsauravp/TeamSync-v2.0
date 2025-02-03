import axiosInstance from "./axiosInstance";
const login = async (credentials:object) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const register = async (credentials:object) => {
  try {
    const response = await axiosInstance.post("/auth/register", credentials);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const validateToken = async () => {
  try {
    const response = await axiosInstance.post("/auth/validate-token");
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export { login, register, validateToken };
