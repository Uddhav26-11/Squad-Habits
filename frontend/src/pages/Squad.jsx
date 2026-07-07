import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import HabitCard from "../components/HabitCard";
import InviteLink from "../components/InviteLink";
import Leaderboard from "../components/Leaderboard";
import { useAuth } from "../context/AuthContext";

function Squad() {
  const { squadId } = useParams();
  const { user } = useAuth();

  const [squad, setSquad] = useState(null);
  const [habits, setHabits] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [squadRes, habitsRes, leaderboardRes, analyticsRes] = await Promise.all([
        api.get(`/squad/${squadId}`),
        api.get(`/habit/squad/${squadId}`),
        api.get(`/habit/leaderboard/${squadId}`),
        api.get(`/habit/analytics/${squadId}`),
      ]);
      setSquad(squadRes.data.squad);
      setHabits(habitsRes.data.habits);
      setLeaderboard(leaderboardRes.data.leaderboard);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError("Failed to load squad data.");
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleToggleHabit = async (habitId) => {
    setHabits((prev) =>
      prev.map((h) => (h._id === habitId ? { ...h, completedToday: !h.completedToday } : h))
    );
    try {
      await api.post("/habit/complete", { habitId });
      loadAll();
    } catch (err) {
      loadAll();
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    try {
      await api.post("/habit/create", { squadId, title: newHabitTitle.trim() });
      setNewHabitTitle("");
      loadAll();
    } catch (err) {
      setError("Failed to create habit. Are you the squad admin?");
    }
  };

  const handleRegenerateInvite = async () => {
    try {
      const res = await api.post(`/squad/${squadId}/invite/regenerate`);
      setSquad((prev) => ({
        ...prev,
        inviteToken: res.data.inviteToken,
        inviteExpiresAt: res.data.inviteExpiresAt,
      }));
    } catch (err) {
      setError("Failed to regenerate invite link.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading squad...</p>
      </div>
    );
  }

  if (!squad) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-red-500">{error || "Squad not found."}</p>
        </div>
      </div>
    );
  }

  const isAdmin = squad.admin?._id === user?._id;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{squad.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {squad.memberCount} members • Admin: {squad.admin?.name}
            </p>
          </div>
          {analytics && (
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">Squad Health</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.squadAverage}/100</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Today's Habits
              </h2>

              {habits.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No habits yet.</p>
              ) : (
                <div className="space-y-3">
                  {habits.map((habit) => (
                    <HabitCard key={habit._id} habit={habit} onToggle={handleToggleHabit} />
                  ))}
                </div>
              )}

              {isAdmin && (
                <form onSubmit={handleCreateHabit} className="mt-4 flex gap-2">
                  <input
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="New habit e.g. Drink Water"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            <Leaderboard data={leaderboard} />
          </div>

          <div className="space-y-6">
            <InviteLink
              inviteToken={squad.inviteToken}
              inviteExpiresAt={squad.inviteExpiresAt}
              onRegenerate={handleRegenerateInvite}
            />

            {analytics?.whoBrokeTheChain && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  ⚠️ Who Broke the Chain
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {analytics.whoBrokeTheChain.name} missed {analytics.whoBrokeTheChain.missed} habit
                  {analytics.whoBrokeTheChain.missed === 1 ? "" : "s"} this week.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Squad;