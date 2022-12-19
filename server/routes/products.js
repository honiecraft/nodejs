const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyUser,
  verifyConsultant,
  verifyAdmin,
} = require("../middleware/authorization");
const productsController = require("../controllers/product");

// Get All Products
router.get("/", productsController.getAllProducts);

// Products by Pagination
router.get("/pagination", productsController.getProductsByPagination);

// Create New Product
router.post(
  "/",
  verifyAdmin,
  productsController.postNewProduct
);

// Update
router.put("/:id", verifyAdmin, productsController.updateProduct);

// Delete
router.delete("/:id", verifyAdmin, productsController.deleteProduct);

// Get Product
router.get("/:id", productsController.getProduct);

module.exports = router;
