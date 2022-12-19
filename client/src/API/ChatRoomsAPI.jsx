import axiosClient from "./axiosClient";

const ChatRoomsAPI = {
  getMessageByRoomId: (roomId) => {
    const url = `/chatrooms/findByRoomId/${roomId}`;
    return axiosClient.get(url);
  },

  getMessageByUserId: (userId) => {
    const url = `/chatrooms/findByUserId/${userId}`;
    return axiosClient.get(url);
  },

  createNewRoom: (body) => {
    const url = `/chatrooms/create`;
    return axiosClient.post(url, body);
  },

  addMessage: (roomId, body) => {
    const url = `/chatrooms/addMessage/${roomId}`;
    return axiosClient.put(url, body);
  },
};

export default ChatRoomsAPI;
