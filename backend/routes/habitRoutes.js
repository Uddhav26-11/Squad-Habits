const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const habitController = require("../controllers/habitController");

// Create a habit (squad admin only)
router.post("/create", auth, habitController.createHabit);

// Update a habit (squad admin only)
router.put("/:id", auth, habitController.updateHabit);

// Delete a habit (squad admin only)
router.delete("/:id", auth, habitController.deleteHabit);

// Get all habits for a squad, with today's completion status for current user
router.get("/squad/:squadId", auth, habitController.getHabitsForSquad);

// Toggle today's completion status for a habit
router.post("/complete", auth, habitController.toggleComplete);

// Leaderboard for a squad
router.get("/leaderboard/:squadId", auth, habitController.getLeaderboard);

// Detailed per-member tracking (streak, completion, missed days, last active, at-risk)
router.get("/members/:squadId", auth, habitController.getMemberStats);

// Squad analytics (squad average score, who broke the chain, top performer, at-risk members)
router.get("/analytics/:squadId", auth, habitController.getSquadAnalytics);

// Logged-in user's dashboard stats
router.get("/dashboard", auth, habitController.getDashboardStats);

module.exports = router;