const Squad = require("../models/Squad");
const User = require("../models/User");
const Habit = require("../models/Habit");
const HabitLog = require("../models/HabitLog");
const { generateInviteToken, getExpiryDate } = require("../utils/generateInviteToken");

// Only letters and single spaces between words. No numbers/special chars.
const SQUAD_NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

function normalizeSquadName(name) {
  return name.trim().replace(/\s+/g, " ");
}

function isValidSquadName(name) {
  return SQUAD_NAME_REGEX.test(normalizeSquadName(name));
}

exports.createSquad = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Squad name is required" });
    }

    if (!isValidSquadName(name)) {
      return res.status(400).json({
        message: "Squad name can only contain letters and spaces (no numbers or special characters)",
      });
    }

    const squad = await Squad.create({
      name: normalizeSquadName(name),
      admin: req.user.id,
      members: [req.user.id],
      inviteToken: generateInviteToken(),
      expiresAt: getExpiryDate(24),
    });

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { squads: squad._id } });

    res.status(201).json({ squad });
  } catch (err) {
    res.status(500).json({ message: "Failed to create squad", error: err.message });
  }
};

exports.getMySquads = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "squads",
      populate: { path: "members admin", select: "name email avatar" },
    });

    res.json({ squads: user ? user.squads : [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch squads", error: err.message });
  }
};

exports.getSquadDetails = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id)
      .populate("members", "name email avatar")
      .populate("admin", "name email avatar");

    if (!squad) return res.status(404).json({ message: "Squad not found" });

    const isMember = squad.members.some((m) => m._id.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this squad" });
    }

    const inviteValid = squad.expiresAt && squad.expiresAt.getTime() > Date.now();

    res.json({
      squad: {
        _id: squad._id,
        name: squad.name,
        admin: squad.admin,
        members: squad.members,
        memberCount: squad.members.length,
        inviteToken: inviteValid ? squad.inviteToken : null,
        inviteExpiresAt: squad.expiresAt,
        createdAt: squad.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch squad", error: err.message });
  }
};

exports.updateSquad = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Squad name is required" });
    }

    if (!isValidSquadName(name)) {
      return res.status(400).json({
        message: "Squad name can only contain letters and spaces (no numbers or special characters)",
      });
    }

    const squad = await Squad.findById(req.params.id);
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    if (squad.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the squad admin can edit this squad" });
    }

    squad.name = normalizeSquadName(name);
    await squad.save();

    res.json({ squad });
  } catch (err) {
    res.status(500).json({ message: "Failed to update squad", error: err.message });
  }
};

exports.deleteSquad = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    if (squad.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the squad admin can delete this squad" });
    }

    const habits = await Habit.find({ squadId: squad._id });
    const habitIds = habits.map((h) => h._id);

    await HabitLog.deleteMany({ habitId: { $in: habitIds } });
    await Habit.deleteMany({ squadId: squad._id });
    await User.updateMany({ squads: squad._id }, { $pull: { squads: squad._id } });
    await Squad.findByIdAndDelete(squad._id);

    res.json({ message: "Squad deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete squad", error: err.message });
  }
};

exports.joinSquad = async (req, res) => {
  try {
    const squad = await Squad.findOne({ inviteToken: req.params.token });

    if (!squad) {
      return res.status(404).json({ message: "Invalid invite link" });
    }

    if (!squad.expiresAt || squad.expiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: "This invite link has expired" });
    }

    const alreadyMember = squad.members.some((m) => m.toString() === req.user.id);

    if (!alreadyMember) {
      squad.members.push(req.user.id);
      await squad.save();
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { squads: squad._id } });
    }

    res.json({ message: "Joined squad successfully", squadId: squad._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to join squad", error: err.message });
  }
};

exports.regenerateInvite = async (req, res) => {
  try {
    const squad = await Squad.findById(req.params.id);
    if (!squad) return res.status(404).json({ message: "Squad not found" });

    if (squad.admin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the squad admin can regenerate the invite link" });
    }

    squad.inviteToken = generateInviteToken();
    squad.expiresAt = getExpiryDate(24);
    await squad.save();

    res.json({ inviteToken: squad.inviteToken, inviteExpiresAt: squad.expiresAt });
  } catch (err) {
    res.status(500).json({ message: "Failed to regenerate invite", error: err.message });
  }
};