import axios from "axios";
import queryString from "query-string";
import alertify from "alertifyjs";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  headers: {
    "content-type": "application/json",
  },
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => {
      queryString.stringify(params);
    },
  },
});

axiosClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const tokenInfor = JSON.parse(sessionStorage.getItem("token"));
  if(user && !tokenInfor) {
    localStorage.removeItem("user");
    window.location.href = "/";
  };    
  const token = tokenInfor ? tokenInfor : null;
  config.headers.Authorization = token ? `Bearer ${token}` : ``;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.message === "Network Error") {
      alertify.set("notifier", "position", "top-left");
      alertify.error("Network Error");
    } else if (
      (error.response.data.status === 401 &&
        error.response.data.message === "Not Authenticated!") ||
      (error.response.data.status === 403 &&
        error.response.data.message === "Unvalid Token!")
    ) {
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    } else if (error.response.status === 500) {
      window.location.href = "/500";
    }

    throw error;
  }
);

export default axiosClient;
