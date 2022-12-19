const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const helmet = require("helmet");
const compression = require("compression");
const app = express();
require("dotenv").config();

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.vez9z8m.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else cb(null, false);
};

//middlewares
app.use(
  cors({
    origin: [process.env.CLIENT_URL_1, process.env.CLIENT_URL_2],
    credentials: true,
    methods: "OPTIONS, GET, POST, PUT, PATCH, DELETE",
    allowedHeaders: "Origin, Content-Type, Authorization",
  })
);
app.use(
  multer({ storage: memoryStorage, fileFilter: fileFilter }).array("images", 5)
);

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/carts");
const orderRoutes = require("./routes/orders");
const messageRoutes = require("./routes/messages");

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/", messageRoutes);

mongoose.set("strictQuery", true);

app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    const server = app.listen(process.env.PORT || 5000);
    const io = require("./socket").init(server);
    // Listen for when the client connects via socket.io-client
    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);
    });
  })
  .catch((err) => console.log(err));
