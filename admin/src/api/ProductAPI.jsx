import axiosClient from "./axiosClient";

const ProductAPI = {
  getProducts: () => {
    const url = `/products`;
    return axiosClient.get(url);
  },

  getDetail: (id) => {
    const url = `/products/${id}`;
    return axiosClient.get(url);
  },

  postNewProduct: (body) => {
    const url = `/products`;
    return axiosClient.post(url, body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  editProduct: (id, body) => {
    const url = `/products/${id}`;
    return axiosClient.put(url, body, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteProduct: (id) => {
    const url = `/products/${id}`;
    return axiosClient.delete(url);
  },
};

export default ProductAPI;
