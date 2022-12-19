const express = require("express");
const router = express.Router();
const {
  verifyToken,
  verifyUser,
  verifyConsultant,
  verifyAdmin,
} = require("../middleware/authorization");
const messagesController = require("../controllers/message");

// Get open chatrooms - done
router.get(
  "/chatrooms",
  verifyConsultant,
  messagesController.getActiveChatRooms
);

// Create new room chat - done
router.post(
  "/chatrooms/create",
  verifyToken,
  messagesController.postNewRoomChat
);

// Add message to room chat - done
router.put(
  "/chatrooms/addMessage/:roomId",
  verifyToken,
  messagesController.addMessage
);

// Get message by roomId - done
router.get(
  "/chatrooms/findByRoomId/:roomId",
  verifyToken,
  messagesController.getMessageByRoomId
);

// Get message of a user
router.get(
  "/chatrooms/findByUserId/:userId",
  verifyUser,
  messagesController.getMessageByUserId
);

module.exports = router;
