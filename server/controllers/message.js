const { ObjectID } = require("mongodb");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const io = require("../socket");
const { createError } = require("../middleware/error");
const Session = require("../models/Session");

// Get open chatrooms
exports.getActiveChatRooms = async (req, res, next) => {
  const isAdmin = req.user.role === "admin";

  try {
    const findOption = isAdmin
      ? // If admin return all active room
        {
          status: { $ne: "closed" },
        }
      : // else return only active room belong to current user
        {
          $or: [
            {
              status: { $eq: "new" },
            },
            {
              $and: [
                { status: { $eq: "open" } },
                { members: { $in: [req.user._id] } },
              ],
            },
          ],
        };

    const activeRoomChat = await Session.find(findOption).select(
      "_id members status"
    );

    res.status(200).json(activeRoomChat);
  } catch (err) {
    next(err);
  }
};

// Create new room chat
exports.postNewRoomChat = async (req, res, next) => {
  const { sender, receiver } = req.body;

  const members = receiver
    ? [ObjectId(sender), ObjectId(receiver)]
    : [ObjectId(sender)];
  const status = receiver ? "open" : "new";

  try {
    const newRoomChat = new Session({
      members,
      status,
    });

    const savedRoomChat = await newRoomChat.save();

    if (savedRoomChat) {
      if (!receiver) {
        io.getIO().sockets.emit("new_room_created", {
          _id: savedRoomChat._id,
          members: [sender],
          status: "new",
        });
      } else {
        io.getIO().sockets.emit("join_room", {
          roomId: savedRoomChat._id,
          receiver,
          status: "open",
        });
      }
    }

    res.status(200).json(savedRoomChat);
  } catch (err) {
    next(err);
  }
};

// Add message to room chat
exports.addMessage = async (req, res, next) => {
  const { roomId } = req.params;
  const { sender, text } = req.body;

  try {
    const roomChat = await Session.findOne({ _id: roomId });

    // Return error when can not find room/ post chat to closed room
    if (!roomChat) {
      return next(createError(404, "Room Chat Not Found!"));
    } else if (roomChat.status === "closed") {
      return next(createError(409, "Can not post to closed Room Chat!"));
    }

    // If sender is newly joined
    if (roomChat.members.indexOf(sender) === -1) {
      // and conversation is new too
      // change status of new conversation
      if (roomChat.status === "new") {
        roomChat.status = "open";
      }
      // then push sender to members list
      roomChat.members.push(ObjectId(sender));
    }

    // Close room on demand
    if (text.toLowerCase() === "/end") {
      roomChat.status = "closed";
    }

    roomChat.messages.push({ sender: sender, text: text });

    const savedRoomChat = await roomChat.save();
    // const lastestMessage = savedRoomChat.messages.slice(-1)[0];
    const lastestMessage = [...savedRoomChat.messages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )[0];

    // Send message to all users connected
    if (savedRoomChat) {
      if (savedRoomChat.status === "closed") {
        io.getIO().sockets.emit("close_room", roomId);
      } else {
        io.getIO().sockets.emit("receive_message", {
          _id: lastestMessage._id,
          roomId,
          sender: sender,
          text: text,
        });
      }
    }

    res.status(200).json(savedRoomChat);
  } catch (err) {
    next(err);
  }
};

// Get message by roomId
exports.getMessageByRoomId = async (req, res, next) => {
  const { roomId } = req.params;
  const isClient = req.user.role === "client";
  const findOption = isClient
    ? {
        $and: [
          { _id: roomId },
          { status: { $ne: "closed" } },
          { members: { $in: [req.user._id] } },
        ],
      }
    : {
        _id: roomId,
        status: { $ne: "closed" },
      };

  try {
    const roomChat = await Session.findOne(findOption);

    if (!roomChat) {
      return res.status(200).json({ error: "Room Chat Not Found!" });
    }
    res.status(200).json(roomChat);
  } catch (err) {
    next(err);
  }
};

// Get message of a user
exports.getMessageByUserId = async (req, res, next) => {
  try {
    const roomChat = await Session.findOne({
      members: { $in: [req.user._id] },
      status: { $ne: "closed" },
    });
    if (!roomChat) {
      return res.status(200).json({ error: "Room Chat Not Found!" });
    }
    res.status(200).json(roomChat);
  } catch (err) {
    next(err);
  }
};
