const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyUser,
  verifyConsultant,
  verifyAdmin,
} = require("../middleware/authorization");
const ordersController = require("../controllers/order");

// Get All Orders
router.get("/", verifyAdmin, ordersController.getAllOrders);

// Get number of New Order
router.get("/newOrders", verifyAdmin, ordersController.getNumerNewOrders);

// Get Earnings of Month
router.get("/earnings", verifyAdmin, ordersController.getEarningOfMonth);
// Create Oder
router.post("/:userId", verifyUser, ordersController.postOrder);

// Get Oders By User
router.get("/:userId", verifyUser, ordersController.getOrders);

// Get Order By Id
router.get("/findById/:orderId", verifyAdmin, ordersController.getOrder);

module.exports = router;
