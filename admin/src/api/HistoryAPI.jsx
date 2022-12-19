import axiosClient from "./axiosClient";

const HistoryAPI = {
  getOrders: () => {
    const url = `/orders`;
    return axiosClient.get(url);
  },

  getOrder: (orderId) => {
    const url = `/orders/findById/${orderId}`;
    return axiosClient.get(url);
  },

  getNumberNewOrders: () => {
    const url = `/orders/newOrders`;
    return axiosClient.get(url);
  },

  getEarningsOfMonth: () => {
    const url = `/orders/earnings`;
    return axiosClient.get(url);
  },
};

export default HistoryAPI;
