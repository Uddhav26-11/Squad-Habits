const router = require("express").Router();

const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");


// Add Habit
router.post("/add", async (req, res) => {
  try {
    const habit = await Habit.create({
      title: req.body.title,
      squadId: req.body.squadId,
      createdBy: req.body.userId
    });

    res.json(habit);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Complete Habit
router.post("/complete", async (req, res) => {
  try {

    const log = await HabitLog.create({
      habitId: req.body.habitId,
      userId: req.body.userId,
      date: new Date(),
      completed: true
    });

    res.json(log);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});


// Dashboard Stats
router.get("/dashboard", async (req, res) => {
  try {

    const totalHabits = await Habit.countDocuments();

    const completedHabits = await HabitLog.countDocuments({
      completed: true
    });


    const completionPercentage =
      totalHabits > 0
        ? Math.round((completedHabits / totalHabits) * 100)
        : 0;


    res.json({
      totalSquads: 0,
      activeHabits: totalHabits,
      currentStreak: 0,
      completionPercentage,
      squadRanking: null,
      todayProgress: completionPercentage
    });


  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});


module.exports = router;