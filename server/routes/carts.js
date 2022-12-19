const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyUser,
  verifyConsultant,
  verifyAdmin,
} = require("../middleware/authorization");
const cartsController = require("../controllers/cart");

// Add to Cart
router.post("/:userId", verifyUser, cartsController.postAddToCart);

// Update Cart
router.patch("/:userId", verifyUser, cartsController.updateCart);

// Delete
router.delete("/:userId", verifyUser, cartsController.deleteCartProduct);

// Get Cart
router.get("/:userId", verifyUser, cartsController.getCart);

module.exports = router;
