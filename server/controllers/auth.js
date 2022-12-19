const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const { createError } = require("../middleware/error");
const io = require("../socket");
const User = require("../models/User");
const Session = require("../models/Session");

// Post Sign Up
exports.postSignup = async (req, res, next) => {
  const { fullname, email, password, phone } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (user) return next(createError(422, "Email address already exists!"));

    const hash = await bcrypt.hash(password, 12);

    const newUser = new User({
      ...req.body,
      password: hash,
      cart: { items: [] },
    });
    await newUser.save();
    res.status(201).json({ message: "User successfully created!" });
  } catch (err) {
    next(err);
  }
};

// Post Login
exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const pw = req.body.password;

  try {
    const user = await User.findOne({ email: email });
    if (!user) return next(createError(401, "User not Found!"));

    const isPassCorrect = await bcrypt.compare(pw, user.password);
    if (!isPassCorrect)
      return next(createError(401, "Username or Passwords does not match!"));

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT);

    const { password, role, cart, ...otherInf } = user._doc;

    return (
      res
        // .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json({ details: { ...otherInf }, token, role, cart })
    );
  } catch (err) {
    next(err);
  }
};

// Get Logout
exports.getLogout = async (req, res, next) => {
  try {
    const userId = ObjectId(req.params.userId);

    const activeRoom = await Session.find({
      members: { $in: [userId] },
      status: { $ne: "closed" },
    });

    if (activeRoom[0]) {
      // Emmit close_room to all active room chat
      activeRoom.forEach((room) => {
        io.getIO().sockets.emit("close_room", room._id);
      });
    }
    // Delete all room chat
    await Session.deleteMany({ members: { $in: [userId] } });

    return res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    next(err);
  }
};
