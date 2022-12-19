const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyUser,
  verifyConsultant,
  verifyAdmin,
} = require("../middleware/authorization");

const usersController = require("../controllers/user");

// Get Number of All Users
router.get(
  "/numberUsers",
  verifyAdmin,
  usersController.getNumAllUsers
);

// Get User status in chats
router.get("/statusChat", verifyConsultant, usersController.getStatus);

// Get User
router.get("/:userId", verifyUser, usersController.getUser);

// Update
router.put("/:userId", verifyUser, usersController.updateUser);

module.exports = router;
