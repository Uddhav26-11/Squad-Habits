const mongoose = require("mongoose");

const habitLogSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  date: Date,

  completed: {
    type: Boolean,
    default: false,
  },
});

habitLogSchema.index({ habitId: 1, userId: 1, date: 1 });

module.exports = mongoose.model("HabitLog", habitLogSchema);