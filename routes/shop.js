const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");
const { route } = require("./admin");

///
router.get("/", shopController.getIndex);

///products
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);

///cart
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

///orders
router.get("/orders", isAuth, shopController.getOrders);
router.post("/create-order", isAuth, shopController.postOrder);
router.get("/orders/:orderId", isAuth, shopController.getInvoice);

///checkout
// router.get("/checkout", shopController.getCheckout);

module.exports = router;
