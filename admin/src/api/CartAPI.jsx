import axiosClient from "./axiosClient";

const CartAPI = {
  getCart: (userId) => {
    const url = `/carts/${userId}`;
    return axiosClient.get(url);
  },

  postAddToCart: (userId, body) => {
    const url = `/carts/${userId}`;
    return axiosClient.post(url, body);
  },

  updateCart: (userId, body) => {
    const url = `/carts/${userId}`;
    return axiosClient.patch(url, body);
  },

  deleteCart: (userId, productId) => {
    const url = `/carts/${userId}?prodId=${productId}`;
    return axiosClient.delete(url);
  },
};

export default CartAPI;
