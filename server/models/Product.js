const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    category: {
      type: String,
      require: true,
    },
    img1: {
      type: String,
      require: true,
    },
    img2: String,
    img3: String,
    img4: String,
    img5: String,
    long_desc: {
      type: String,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    short_desc: {
      type: String,
      require: true,
    },
    stockQty: { type: Number, default: 10 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
