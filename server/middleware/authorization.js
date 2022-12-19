const jwt = require("jsonwebtoken");
const { createError } = require("./error");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
  // Checking existance of cookie
  const token = req.header("authorization").split(" ")[1];

  if (!token) {
    return next(createError(401, "Not Authenticated!"));
  }
  // Verify the token
  try {
    const user = jwt.verify(token, process.env.JWT);

    const selectedUser = await User.findById(user.id);
    if (!selectedUser) {
      return next(createError(401, "Not Authenticated!"));
    }

    req.user = selectedUser;
    return next();
  } catch {
    return next(createError(403, "Unvalid Token!"));
  }
};

const verifyUser = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (
      req.user._id.toString() === req.params.userId ||
      req.user.role === "consultant" ||
      req.user.role === "admin"
    ) {
      return next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

const verifyConsultant = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.role === "consultant" || req.user.role === "admin") {
      return next();
    } else return next(createError(403, "You are not authorized!"));
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.role === "admin") {
      return next();
    } else return next(createError(403, "You are not authorized!"));
  });
};

module.exports = {
  verifyToken,
  verifyUser,
  verifyConsultant,
  verifyAdmin,
};
