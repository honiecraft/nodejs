const User = require("../models/User");
const Session = require("../models/Session");
const { ObjectId } = require("mongodb");

// Update User
exports.updateUser = async (req, res, next) => {
  const userId = req.params.userId;
  const update = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Get User
exports.getUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Get Number of All Users
exports.getNumAllUsers = async (req, res, next) => {
  try {
    const numberUsers = await User.find().countDocuments();
    res.status(200).json({ count: numberUsers });
  } catch (err) {
    next(err);
  }
};

// Get available user
exports.getStatus = async (req, res, next) => {
  try {
    // Get list of unavailable user
    const unavailableUsers = await Session.find({
      status: { $eq: "open" },
      members: { $nin: [req.user._id] },
    }).distinct("members");

    // Project user list with status busy/free
    const availableUsers = await User.aggregate([
      {
        $project: {
          _id: 1,
          fullname: 1,
          role: 1,
          status: {
            $cond: {
              if: { $in: ["$_id", unavailableUsers] },
              then: "busy",
              else: "free",
            },
          },
        },
      },
    ]);

    res.status(200).json(availableUsers);
  } catch (err) {
    next(err);
  }
};
