import axiosClient from "./axiosClient";

const HistoryAPI = {
  getOrders: (userId, orderId) => {
    const url = `/orders/${userId}?orderId=${orderId}`;
    return axiosClient.get(url);
  },
};

export default HistoryAPI;
