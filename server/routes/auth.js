const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyUser,
  verifyConsultant,
  verifyAdmin,
} = require("../middleware/authorization");

const authController = require("../controllers/auth");

// Authenticate User
router.post("/login", authController.postLogin);
router.post("/signup", authController.postSignup);
router.get("/logout/:userId", authController.getLogout);

module.exports = router;
