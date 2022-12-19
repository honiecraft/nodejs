import axiosClient from "./axiosClient";

const CheckoutAPI = {
  postOrder: (userId, body) => {
    const url = `/orders/${userId}`;
    return axiosClient.post(url, body);
  },
};

export default CheckoutAPI;
