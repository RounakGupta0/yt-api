const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    imageId: {
      type: String,
      default: "",
    },

    // 🔥 Subscribers: yaha userId store hoga
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔥 Optional (better design): subscriptions bhi rakh lo
    // yani ye user kin kin ko subscribe kiya hai
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);