const Product = require("../models/Product");
const User = require("../models/User");
const { createError } = require("../middleware/error");
const fileHelper = require("../util/file");

// Get All Products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ updatedAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

// Get Product
exports.getProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
};

// Get Products by Pagination
exports.getProductsByPagination = async (req, res, next) => {
  const { category, count, page, search } = req.query;
  const findOption = {
    category: category === "all" ? { $ne: null } : category,
    name: { $regex: search, $options: "i" },
  };
  try {
    const totalItems = await Product.find(findOption).countDocuments();
    const result = await Product.find(findOption)
      .skip((page - 1) * count)
      .limit(count);

    res.status(200).json({ items: result, totalItems: totalItems });
  } catch (err) {
    next(err);
  }
};

// Create New Product
exports.postNewProduct = async (req, res, next) => {
  const images = req.files;

  if (images.length < 1) return next(createError(422, "No image attached!"));

  try {
    // Save image to cloudinary
    const multiplePicturePromise = images.map((img) => {
      return fileHelper.uploadImage(img);
    });
    const uploadImages = await Promise.all(multiplePicturePromise);

    // Get image url
    const imgArr = uploadImages.reduce((acc, curr, i) => {
      let key = `img${i + 1}`;
      return { ...acc, [key]: curr.secure_url };
    }, {});

    // Create new product
    const product = new Product({ ...req.body, ...imgArr });

    // Save new product
    await product.save();

    res.status(200).json({ message: "Successfully Created!" });
  } catch (err) {
    next(err);
  }
};

// Update Product
exports.updateProduct = async (req, res, next) => {
  const productId = req.params.id;
  const { name, category, price, short_desc, long_desc } = req.body;
  const images = req.files;
  try {
    const product = await Product.findById(productId);
    if (!product) return next(createError(404, "No product found!"));
    product.name = name;
    product.category = category;
    product.price = price;
    product.short_desc = short_desc;
    product.long_desc = long_desc;

    if (images.length > 0) {
      // Delete all previous image in Cloudiary
      const prevImgList = Object.keys(product._doc)
        .filter((key) => {
          return key.startsWith("img");
        })
        .map((img) => {
          return product._doc[img];
        });

      const multipleDeletePicturePromise = prevImgList.map((img) => {
        return fileHelper.deleteFile(img);
      });

      await Promise.all(multipleDeletePicturePromise);

      // Delete all previous image in Database
      Object.keys(product._doc).forEach((key) => {
        if (key.startsWith("img")) {
          product[key] = undefined;
        }
      });

      // Save new image to cloudinary
      const multipleUploadPicturePromise = images.map((img) => {
        return fileHelper.uploadImage(img);
      });
      const uploadImages = await Promise.all(multipleUploadPicturePromise);
      uploadImages.forEach((img, i) => {
        let key = `img${i + 1}`;
        product[key] = img.secure_url;
      });
    }

    // Save updated product
    await product.save();
    res.status(200).json({ message: "Successfully Updated!" });
  } catch (err) {
    next(err);
  }
};

// Delete Product
exports.deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    if (!product) return next(createError(404, "No product found!"));

    // Delete all previous image in Cloudiary
    const imgList = Object.keys(product._doc)
      .filter((key) => {
        return key.startsWith("img");
      })
      .map((img) => {
        return product._doc[img];
      });

    const multipleDeletePicturePromise = imgList.map((img) => {
      return fileHelper.deleteFile(img);
    });

    await Promise.all(multipleDeletePicturePromise);

    // Delete Product in Database
    await Product.deleteOne({ _id: productId });

    // Delete Product in related Cart
    await User.updateMany(
      { "cart.items.productId": productId },
      { $pull: { "cart.items": { productId: productId } } }
    );

    //Send response
    res.status(200).json({ message: "Deleted!" });
  } catch (err) {
    next(err);
  }
};
