const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    text: String,
  },
  { timestamps: true }
);

const sessionSchema = new Schema(
  {
    members: [],
    messages: [messageSchema],
    status: {
      type: String,
      emit: ["new", "open", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
