const User = require("../models/User");
const Product = require("../models/Product");
const { createError } = require("../middleware/error");

// Get Cart
exports.getCart = async (req, res, next) => {
  try {
    const products = await req.user.populate("cart.items.productId");
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// Add Product to Cart
exports.postAddToCart = async (req, res, next) => {
  const { prodId, qty } = req.body;
  try {
    const product = await Product.findById(prodId);

    if (!product) {
      return next(createError(404, "Product Not Found."));
    }

    const currentCart = await req.user.cart.items;

    // If currently having selected item
    if (currentCart.length > 0) {
      const curentItem = currentCart.filter((item) => {
        return item.productId.toString() === prodId.toString();
      })[0];

      if (curentItem) {
        const newQty = curentItem.quantity + qty;

        // Check if total qty over stockQty or not
        if (product.stockQty < newQty) {
          return res.status(200).json({
            status: 406,
            message: `Over stock limit.`,
            availableQty: product.stockQty - curentItem.quantity,
          });
        }
      }
    }

    const response = await req.user.addToCart(product, qty);
    return response && res.status(200).json("Add to Cart Successfully!");
  } catch (err) {
    next(err);
  }
};

// Update Cart
exports.updateCart = async (req, res, next) => {
  const userId = req.params.userId;
  const prodId = req.body.prodId;
  const qty = parseInt(req.body.qty) || 0;
  try {
    const cartProduct = await Product.findById(prodId);
    const inStock = cartProduct.stockQty >= qty;

    if (!inStock) {
      return res.status(200).json({
        status: 406,
        message: `Insufficient stock quantity`,
        availableQty: cartProduct.stockQty,
      });
    }

    const updatedCart = await User.findOneAndUpdate(
      {
        _id: userId,
        "cart.items.productId": prodId,
      },
      {
        $set: {
          "cart.items.$.quantity": qty,
        },
      }
    );
    return res.status(200).json(updatedCart);
  } catch (err) {
    next(err);
  }
};

// Remove Product from Cart
exports.deleteCartProduct = async (req, res, next) => {
  const { prodId } = req.query;

  try {
    await req.user.removeFromCart(prodId);
    return res.status(200).json("Deleted!");
  } catch (err) {
    next(err);
  }
};
