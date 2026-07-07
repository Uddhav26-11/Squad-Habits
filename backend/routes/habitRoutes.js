const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const habitController = require("../controllers/habitController");

// Create a habit (squad admin only)
router.post("/create", auth, habitController.createHabit);

// Get all habits for a squad, with today's completion status for current user
router.get("/squad/:squadId", auth, habitController.getHabitsForSquad);

// Toggle today's completion status for a habit
router.post("/complete", auth, habitController.toggleComplete);

// Leaderboard for a squad
router.get("/leaderboard/:squadId", auth, habitController.getLeaderboard);

// Squad analytics (squad average score, who broke the chain)
router.get("/analytics/:squadId", auth, habitController.getSquadAnalytics);

// Logged-in user's dashboard stats
router.get("/dashboard", auth, habitController.getDashboardStats);

module.exports = router;