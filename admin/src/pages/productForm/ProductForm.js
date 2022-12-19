import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import alertify from "alertifyjs";

import ProductAPI from "../../api/ProductAPI";
import "./productForm.css";

const ProductForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedProductId = location.pathname.split("/")[2];
  const isEditing = selectedProductId !== "new";

  const initialState = {
    name: "",
    category: "",
    price: "",
    short_desc: "",
    long_desc: "",
    images: "",
  };

  const [inputs, setInputs] = useState(initialState);
  const [error, setError] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const getDetail = async () => {
        setIsLoading(true);
        const response = await ProductAPI.getDetail(selectedProductId);
        setInputs({ ...response, images: "" });
        setIsLoading(false);
      };
      getDetail();
    } else return;
  }, []);

  // Handle Input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "images") {
      setInputs((prev) => ({ ...prev, [name]: e.target.files }));
    }
    setError((prev) => ({ ...prev, [name]: "" }));
  };

  function validateForm() {
    const { name, category, price, short_desc, long_desc, images } = inputs;

    let tempError = {};
    if (!name) {
      tempError.name = "Please enter product name!";
    } else if (name.length < 3) {
      tempError.name = "Product name needs to be at least 3 characters!";
    }
    if (!category) {
      tempError.category = "Please enter product category!";
    } else if (category.length < 3) {
      tempError.category = "Category needs to be at least 3 characters!";
    }
    if (!price) {
      tempError.price = "Please enter product price!";
    }
    if (!short_desc) {
      tempError.short_desc = "Please enter short description!";
    } else if (short_desc.length < 5) {
      tempError.short_desc = "Description needs to be at least 5 characters!";
    }
    if (!long_desc) {
      tempError.long_desc = "Please enter long description!";
    } else if (long_desc.length < 5) {
      tempError.long_desc = "Description needs to be at least 5 characters!";
    }
    if (images.length <= 0 && !isEditing) {
      tempError.images = "Please choose image files!";
    } else if (images.length > 5) {
      tempError.images = "Maximum number of files allowed: 5";
    }
    setError({ ...tempError });
    if (Object.values(tempError).length > 0) {
      return false;
    } else return true;
  }
  // Handle Submit
  const handleClick = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", inputs.name);
    formData.append("category", inputs.category);
    formData.append("price", inputs.price);
    formData.append("short_desc", inputs.short_desc);
    formData.append("long_desc", inputs.long_desc);
    Object.values(inputs.images).forEach((file) => {
      formData.append("images", file);
    });

    const isValid = validateForm();
    if (isValid) {
      const submitProductForm = async () => {
        setIsLoading(true);
        const response = isEditing
          ? await ProductAPI.editProduct(selectedProductId, formData)
          : await ProductAPI.postNewProduct(formData);
        setIsLoading(false);
        alertify.set("notifier", "position", "top-left");
        alertify.success(response.message);
        navigate("/products");
      };
      submitProductForm();
    } else {
      return;
    }
  };

  return (
    <div className="newContainer">
      <div className="formTitle">
        <h1>{isEditing ? "Edit Product" : "Add New Product"}</h1>
      </div>
      <div className="productForm">
        <form>
          {/* Input */}
          <div className="formInput">
            <label>Product Name</label>
            <input
              className="hfinput"
              name="name"
              id="name"
              value={inputs.name}
              // defaultValue={data ? data[input.name] : null}
              onChange={handleChange}
              onBlur={handleChange}
              type="text"
              placeholder="Enter Product Name"
              required
            />
          </div>
          {error.name && (
            <div className="d-flex justify-content-left px-3">
              <span className="text-danger">* {error.name}</span>
            </div>
          )}
          <div className="formInput">
            <label>Category</label>
            <input
              className="hfinput"
              name="category"
              id="category"
              value={inputs.category}
              // defaultValue={data ? data[input.name] : null}
              onChange={handleChange}
              onBlur={handleChange}
              type="text"
              placeholder="Enter Category"
              required
            />
          </div>
          {error.category && (
            <div className="d-flex justify-content-left px-3">
              <span className="text-danger">* {error.category}</span>
            </div>
          )}
          <div className="formInput">
            <label>Price</label>
            <input
              className="hfinput"
              name="price"
              id="price"
              value={inputs.price}
              // defaultValue={data ? data[input.price] : null}
              onChange={handleChange}
              onBlur={handleChange}
              type="number"
              placeholder="Enter Price"
              required
            />
          </div>
          {error.price && (
            <div className="d-flex justify-content-left px-3">
              <span className="text-danger">* {error.price}</span>
            </div>
          )}
          {/* Text area */}
          <div className="formInput">
            <label>Short Description</label>
            <textarea
              name="short_desc"
              id="short_desc"
              value={inputs.short_desc}
              placeholder="Enter Short Description"
              // defaultValue={data ? data["photos"] : ""}
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>
          {error.short_desc && (
            <div className="d-flex justify-content-left px-3">
              <span className="text-danger">* {error.short_desc}</span>
            </div>
          )}
          <div className="formInput">
            <label>Long Description</label>
            <textarea
              name="long_desc"
              id="long_desc"
              value={inputs.long_desc}
              placeholder="Enter Long Description"
              // defaultValue={data ? data["photos"] : ""}
              onChange={handleChange}
              rows="5"
            ></textarea>
          </div>
          {error.long_desc && (
            <div className="d-flex justify-content-left px-3">
              <span className="text-danger">* {error.long_desc}</span>
            </div>
          )}
          {/* Upload File */}
          <div className="formInput">
            <label>Upload image (5 images)</label>
            <input
              style={{ border: "none" }}
              name="images"
              id="images"
              multiple
              onChange={handleChange}
              type="file"
              required
            />
          </div>
          {error.images && (
            <div className="d-flex justify-content-left px-3">
              <span className="text-danger">* {error.images}</span>
            </div>
          )}
          {/* <Button variant="contained">Submit</Button> */}
          <LoadingButton
            loading={isLoading}
            className="productFormBtn"
            loadingIndicator="Loading..."
            variant="contained"
            onClick={handleClick}
          >
            Submit
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
