const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const Squad = require("../models/Squad");
const User = require("../models/User");
const {
  calculateStreak,
  calculateWeeklyCompletionRate,
  countMissedThisWeek,
  getLastActiveDate,
  toDateKey,
} = require("../utils/habitStats");

exports.createHabit = async (req, res) => {
  try {
    const { squadId, title } = req.body;
    if (!squadId || !title || !title.trim()) {
      return res.status(400).json({ message: "squadId and title are required" });
    }

    const squad = await Squad.findById(squadId);
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    if (squad.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only squad admin can manage habits" });
    }

    const habit = await Habit.create({
      title: title.trim(),
      squadId,
      createdBy: req.user.id,
    });

    res.status(201).json({ habit });
  } catch (err) {
    res.status(500).json({ message: "Failed to create habit", error: err.message });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Habit title is required" });
    }

    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const squad = await Squad.findById(habit.squadId);
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    if (squad.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only squad admin can manage habits" });
    }

    habit.title = title.trim();
    await habit.save();

    res.json({ habit });
  } catch (err) {
    res.status(500).json({ message: "Failed to update habit", error: err.message });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const squad = await Squad.findById(habit.squadId);
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    if (squad.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only squad admin can manage habits" });
    }

    await HabitLog.deleteMany({ habitId: habit._id });
    await Habit.findByIdAndDelete(habit._id);

    res.json({ message: "Habit deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete habit", error: err.message });
  }
};

exports.getHabitsForSquad = async (req, res) => {
  try {
    const { squadId } = req.params;
    const habits = await Habit.find({ squadId }).sort({ createdAt: 1 });
    const habitIds = habits.map((h) => h._id);

    const logs = await HabitLog.find({
      habitId: { $in: habitIds },
      userId: req.user.id,
      completed: true,
    });

    const todayKey = toDateKey(new Date());
    const completedTodaySet = new Set(
      logs
        .filter((log) => toDateKey(new Date(log.date)) === todayKey)
        .map((log) => log.habitId.toString())
    );

    const habitsWithStatus = habits.map((h) => ({
      _id: h._id,
      title: h.title,
      squadId: h.squadId,
      createdBy: h.createdBy,
      createdAt: h.createdAt,
      completedToday: completedTodaySet.has(h._id.toString()),
    }));

    res.json({ habits: habitsWithStatus });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch habits", error: err.message });
  }
};

exports.toggleComplete = async (req, res) => {
  try {
    const { habitId } = req.body;
    if (!habitId) return res.status(400).json({ message: "habitId is required" });

    const habit = await Habit.findById(habitId);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let log = await HabitLog.findOne({
      habitId,
      userId: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (log) {
      log.completed = !log.completed;
      await log.save();
    } else {
      log = await HabitLog.create({
        habitId,
        userId: req.user.id,
        date: new Date(),
        completed: true,
      });
    }

    res.json({ log });
  } catch (err) {
    res.status(500).json({ message: "Failed to update habit completion", error: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { squadId } = req.params;
    const squad = await Squad.findById(squadId).populate("members", "name email avatar");
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    const habits = await Habit.find({ squadId });
    const habitIds = habits.map((h) => h._id.toString());
    const logs = await HabitLog.find({ habitId: { $in: habits.map((h) => h._id) } });

    const todayKey = toDateKey(new Date());

    const leaderboard = squad.members.map((member) => {
      const userLogs = logs.filter((log) => log.userId.toString() === member._id.toString());
      const streak = calculateStreak(userLogs, habitIds);
      const completionRate = calculateWeeklyCompletionRate(userLogs, habitIds);

      const completedTodayCount = userLogs.filter(
        (log) => log.completed && toDateKey(new Date(log.date)) === todayKey
      ).length;
      const todayStatus =
        habitIds.length === 0
          ? "No Habits"
          : completedTodayCount >= habitIds.length
          ? "Completed"
          : completedTodayCount > 0
          ? "In Progress"
          : "Not Started";

      return {
        userId: member._id,
        name: member.name,
        avatar: member.avatar,
        role: squad.admin.toString() === member._id.toString() ? "Admin" : "Member",
        streak,
        completionRate,
        todayStatus,
        status: completionRate >= 70 ? "On Track" : completionRate >= 40 ? "Falling Behind" : "At Risk",
      };
    });

    leaderboard.sort((a, b) => b.streak - a.streak || b.completionRate - a.completionRate);
    leaderboard.forEach((entry, idx) => (entry.rank = idx + 1));

    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leaderboard", error: err.message });
  }
};

exports.getMemberStats = async (req, res) => {
  try {
    const { squadId } = req.params;
    const squad = await Squad.findById(squadId).populate("members", "name email avatar");
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    const isMember = squad.members.some((m) => m._id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this squad" });
    }

    const habits = await Habit.find({ squadId });
    const habitIds = habits.map((h) => h._id.toString());
    const logs = await HabitLog.find({ habitId: { $in: habits.map((h) => h._id) } });

    const members = squad.members.map((member) => {
      const userLogs = logs.filter((log) => log.userId.toString() === member._id.toString());
      const streak = calculateStreak(userLogs, habitIds);
      const completionRate = calculateWeeklyCompletionRate(userLogs, habitIds);
      const missedDays = countMissedThisWeek(userLogs, habitIds);
      const lastActive = getLastActiveDate(userLogs);

      return {
        userId: member._id,
        name: member.name,
        avatar: member.avatar,
        role: squad.admin.toString() === member._id.toString() ? "Admin" : "Member",
        streak,
        completionRate,
        missedDays,
        lastActive,
        atRisk: completionRate < 40,
      };
    });

    members.sort((a, b) => b.streak - a.streak || b.completionRate - a.completionRate);

    res.json({ members });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch member stats", error: err.message });
  }
};

exports.getSquadAnalytics = async (req, res) => {
  try {
    const { squadId } = req.params;
    const squad = await Squad.findById(squadId).populate("members", "name email avatar");
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    const habits = await Habit.find({ squadId });
    const habitIds = habits.map((h) => h._id.toString());
    const logs = await HabitLog.find({ habitId: { $in: habits.map((h) => h._id) } });

    const todayKey = toDateKey(new Date());

    let worstMember = null;
    let worstMissed = -1;
    let bestMember = null;
    let bestScore = -1;
    let totalRate = 0;
    let activeMembersToday = 0;
    const atRiskMembers = [];

    squad.members.forEach((member) => {
      const userLogs = logs.filter((log) => log.userId.toString() === member._id.toString());
      const missed = countMissedThisWeek(userLogs, habitIds);
      const rate = calculateWeeklyCompletionRate(userLogs, habitIds);
      const streak = calculateStreak(userLogs, habitIds);
      totalRate += rate;

      const completedToday = userLogs.some(
        (log) => log.completed && toDateKey(new Date(log.date)) === todayKey
      );
      if (completedToday) activeMembersToday += 1;

      if (missed > worstMissed) {
        worstMissed = missed;
        worstMember = { userId: member._id, name: member.name, avatar: member.avatar, missed };
      }

      const score = streak * 100 + rate;
      if (score > bestScore) {
        bestScore = score;
        bestMember = {
          userId: member._id,
          name: member.name,
          avatar: member.avatar,
          streak,
          completionRate: rate,
        };
      }

      if (rate < 40 || !completedToday) {
        atRiskMembers.push({
          userId: member._id,
          name: member.name,
          avatar: member.avatar,
          completionRate: rate,
        });
      }
    });

    const squadAverage = squad.members.length > 0 ? Math.round(totalRate / squad.members.length) : 0;

    res.json({
      totalMembers: squad.members.length,
      activeMembersToday,
      squadAverage,
      whoBrokeTheChain: worstMissed > 0 ? worstMember : null,
      topPerformer: squad.members.length > 0 ? bestMember : null,
      atRiskMembers,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("squads");
    const squads = user && user.squads ? user.squads : [];

    const totalSquads = squads.length;
    let activeHabitsCount = 0;
    let bestStreak = 0;
    let totalCompletionRate = 0;
    let todayCompleted = 0;
    let todayTotal = 0;
    let bestRank = null;

    for (const squad of squads) {
      const habits = await Habit.find({ squadId: squad._id });
      const habitIds = habits.map((h) => h._id.toString());
      activeHabitsCount += habits.length;

      const myLogs = await HabitLog.find({
        habitId: { $in: habits.map((h) => h._id) },
        userId: req.user.id,
      });

      const streak = calculateStreak(myLogs, habitIds);
      const rate = calculateWeeklyCompletionRate(myLogs, habitIds);

      bestStreak = Math.max(bestStreak, streak);
      totalCompletionRate += rate;

      const todayKey = toDateKey(new Date());
      todayCompleted += myLogs.filter(
        (log) => log.completed && toDateKey(new Date(log.date)) === todayKey
      ).length;
      todayTotal += habits.length;

      const allLogs = await HabitLog.find({ habitId: { $in: habits.map((h) => h._id) } });
      const squadDoc = await Squad.findById(squad._id).select("members");
      const ranked = squadDoc.members
        .map((m) => {
          const mLogs = allLogs.filter((log) => log.userId.toString() === m.toString());
          return { userId: m.toString(), streak: calculateStreak(mLogs, habitIds) };
        })
        .sort((a, b) => b.streak - a.streak);

      const myRank = ranked.findIndex((r) => r.userId === req.user.id) + 1;
      if (myRank > 0 && (bestRank === null || myRank < bestRank)) {
        bestRank = myRank;
      }
    }

    const completionPercentage = totalSquads > 0 ? Math.round(totalCompletionRate / totalSquads) : 0;
    const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    res.json({
      totalSquads,
      activeHabits: activeHabitsCount,
      currentStreak: bestStreak,
      completionPercentage,
      squadRanking: bestRank,
      todayProgress,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats", error: err.message });
  }
};