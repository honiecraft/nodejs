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

  getStatusChat: () => {
    const url = `/users/statusChat`;
    return axiosClient.get(url);
  },

  getNumberUsers: () => {
    const url = `/users/numberUsers`;
    return axiosClient.get(url);
  },
};

export default UserAPI;
