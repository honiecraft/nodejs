import axiosClient from "./axiosClient";

const UserAPI = {
  postLogin: (body) => {
    const url = `/auth/login`;
    return axiosClient.post(url, body);
  },

  postSignUp: (body) => {
    const url = `/auth/signup`;
    return axiosClient.post(url, body);
  },

  getLogout: (userId) => {
    const url = `/auth/logout/${userId}`;
    return axiosClient.get(url);
  },

  putUpdate: (userId, body) => {
    const url = `/users/${userId}`;
    return axiosClient.put(url, body);
  },
};

export default UserAPI;
