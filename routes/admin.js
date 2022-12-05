const path = require("path");
const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// /admin/products
router.get("/products", isAuth, adminController.getProducts);

// /admin/edit-product
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// /admin/delete-product
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
