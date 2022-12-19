const nodemailer = require("nodemailer");
const io = require("../socket");
const { createError } = require("../middleware/error");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.PASS_GMAIL,
  },
});

// Post order
exports.postOrder = async (req, res, next) => {
  const { fullname, email, phone, address, total } = req.body;
  try {
    const user = await req.user.populate("cart.items.productId");
    const orderItems = user.cart.items;

    // Throw Error when Cart is Empty
    if (orderItems.length < 1) {
      return res.status(200).json({
        status: 406,
        message: `Cart is Empty!`,
      });
    }

    // Checking available stock
    let validInputQty = true;
    let products = [];
    let insufficientQtyList = [];

    await Promise.all(
      orderItems.map(async (item) => {
        const productId = item.productId;
        const quantity = parseInt(item.quantity) || 0;

        if (!quantity || quantity === 0) {
          validInputQty = false;
          return res.status(200).json({
            status: 406,
            message: `Order with 0 quantity!`,
          });
        }

        const updatedProduct = await Product.findById(productId);

        // Throw Error if not found Cart item in Product list
        if (!updatedProduct) {
          return next(createError(404, "Product Not Found."));
        }

        // If having item with not enough qty
        // push into insufficientQtyList array
        if (updatedProduct.stockQty < quantity) {
          insufficientQtyList.push({
            prodId: updatedProduct._id,
            name: updatedProduct.name,
            img: updatedProduct.img1,
            stockQty: updatedProduct.stockQty,
          });
        } else {
          // Update in stock quantity
          updatedProduct.stockQty -= quantity;
          await updatedProduct.save();

          // Else push to products array
          products = [
            ...products,
            {
              quantity: quantity,
              ...(({ stockQty, createdAt, updatedAt, __v, ...product }) => ({
                product,
              }))(productId._doc),
            },
          ];
        }
      })
    );

    // If having any item which not enough qty
    // return list of that items
    if (insufficientQtyList.length > 0) {
      return res.status(200).json({
        status: 406,
        message: `Insufficient stock quantity`,
        unavailableItems: insufficientQtyList,
      });
    }

    // If not create and save order
    const order = new Order({
      user: {
        email: email,
        userId: req.user._id,
      },
      products: products,
      total: total,
    });

    const savedOrder = await order.save();

    io.getIO().sockets.emit("post_order", {
      sender: req.user._id,
      productList: savedOrder.products,
    });

    // then clear cart
    validInputQty && (await req.user.clearCart());

    // and send email
    const formatCurrency = (number) => {
      return new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
      }).format(number);
    };

    const mailOptions = {
      to: email,
      subject: `Xác nhận đơn hàng #${order._id}`,
      html: `
      <h1>Xin chào ${fullname}</h1>
      <h3>Phone: ${phone}</h3>
      <h3>Address: ${address}</h3>
      <table>
        <thead>
          <tr>
            <th style='border:1px solid;'>Tên sản phẩm</th>
            <th style='border:1px solid;'>Hình Ảnh</th>
            <th style='border:1px solid;'>Giá</th>
            <th style='border:1px solid; padding: 0.5rem;'>Số Lượng</th>
            <th style='border:1px solid;'>Thành Tiền</th>
          </tr>
        </thead>
        <tbody style='text-align:center; font-size: 15px'>
        ${
          products &&
          products
            .map((p) => {
              return `<tr key=${p.product._id}>
                <td style='border:1px solid; padding: 0.5rem;'>${
                  p.product.name
                }</td>
                <td style='border:1px solid; padding: 0.5rem;'><img src=${
                  p.product.img1
                } style='height:100px;'/></td>
                <td style='border:1px solid; padding: 0.5rem;'>${formatCurrency(
                  p.product.price
                )} VND</td>
                <td style='border:1px solid; padding: 0.5rem;'>${
                  p.quantity
                }</td>
                <td style='border:1px solid; padding: 0.5rem;'>${formatCurrency(
                  parseInt(p.product.price) * parseInt(p.quantity)
                )} VND</td>
              </tr>`;
            })
            .join("")
        }
        </tbody>
      </table>
      <h1>Tổng thanh toán:</h1>
      <h1>${formatCurrency(total)} VND</h1>
      <br/>
      <h1>Cảm ơn bạn!</h1>
      `,
    };
    res.status(200).json({ message: "Successfully order!" });

    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      if (info.rejected.length < 0) {
        console.log("ok");
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get All Orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user.userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $sort: { createdAt: -1 } },
      { $unwind: "$userId" },
      {
        $project: {
          _id: 1,
          products: 1,
          total: 1,
          delivery: 1,
          status: 1,
          userId: "$userId._id",
          fullname: "$userId.fullname",
          phone: "$userId.phone",
          address: "$userId.address",
          userId: "$userId._id",
        },
      },
      // {
      //   $limit: 9,
      // },
    ]);
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// Get Orders of User
exports.getOrders = async (req, res, next) => {
  const { orderId } = req.query;
  const findOption =
    orderId === "all"
      ? { "user.userId": req.user._id }
      : { _id: orderId, "user.userId": req.user._id };
  try {
    const orders = await Order.find(findOption).populate({
      path: "user.userId",
      select: "_id fullname email phone address",
    });
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};

// Get Order by ID
exports.getOrder = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId).populate({
      path: "user.userId",
      select: "_id fullname email phone address",
    });
    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
};

// Get number of New Order
exports.getNumerNewOrders = async (req, res, next) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

// Get Earning of Month
exports.getEarningOfMonth = async (req, res, next) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
};
