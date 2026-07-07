const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true,
    sparse: true,
  },

  password: {
    type: String, // hashed with bcrypt, only set for email/password accounts
  },

  googleId: String,

  avatar: String,

  squads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Squad",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);