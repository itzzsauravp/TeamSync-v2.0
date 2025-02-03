import axios, { AxiosInstance } from "axios";

// Create an Axios instance with a base URL and default headers
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://localhost:3000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in the headers
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {}; // Ensure headers object exists
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
