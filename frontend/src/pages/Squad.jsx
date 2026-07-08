import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import HabitCard from "../components/HabitCard";
import InviteLink from "../components/InviteLink";
import { useAuth } from "../context/AuthContext";
import { useSquads } from "../context/SquadContext";

// Small sub-nav shown at the top of every squad-scoped page (Overview,
// Leaderboard, Members, Add Habit).
export function SquadTabs({ squadId, squadName, isAdmin }) {
  const tabClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="mb-6">
      {squadName && (
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">{squadName}</h1>
      )}
      <div className="flex flex-wrap gap-2">
        <NavLink to={`/squad/${squadId}`} end className={tabClass}>
          Overview
        </NavLink>
        <NavLink to={`/squad/${squadId}/leaderboard`} className={tabClass}>
          Leaderboard
        </NavLink>
        <NavLink to={`/squad/${squadId}/members`} className={tabClass}>
          Members
        </NavLink>
        {isAdmin && (
          <NavLink to={`/squad/${squadId}/add-habit`} className={tabClass}>
            Add Habit
          </NavLink>
        )}
      </div>
    </div>
  );
}

function Squad() {
  const { squadId } = useParams();
  const { user } = useAuth();
  const { refreshSquads } = useSquads();
  const navigate = useNavigate();

  const [squad, setSquad] = useState(null);
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setError("");
    try {
      const [squadRes, habitsRes, analyticsRes] = await Promise.all([
        api.get(`/squad/${squadId}`),
        api.get(`/habit/squad/${squadId}`),
        api.get(`/habit/analytics/${squadId}`),
      ]);
      setSquad(squadRes.data.squad);
      setHabits(habitsRes.data.habits);
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

  const isAdmin = squad?.admin?._id === user?._id;

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

  const handleEditHabit = async (habitId, title) => {
    if (!isAdmin) {
      setError("Only the squad admin can edit habits.");
      return;
    }
    try {
      await api.put(`/habit/${habitId}`, { title });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update habit.");
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (!isAdmin) {
      setError("Only the squad admin can delete habits.");
      return;
    }
    if (!window.confirm("Delete this habit? All progress logs for it will be removed too.")) {
      return;
    }
    try {
      await api.delete(`/habit/${habitId}`);
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete habit.");
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

  const handleLeaveSquad = async () => {
    if (!window.confirm("Leave this squad? You'll lose access to its habits and leaderboard.")) {
      return;
    }
    try {
      await api.post(`/squad/${squadId}/leave`);
      refreshSquads();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave squad.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading squad...</p>
        </div>
      </Layout>
    );
  }

  if (!squad) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-red-500">{error || "Squad not found."}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <SquadTabs squadId={squadId} squadName={squad.name} isAdmin={isAdmin} />

        <div className="flex items-center justify-between mb-6 -mt-2">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {squad.memberCount} members • Admin: {squad.admin?.name}
            {isAdmin && (
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-indigo-500 align-middle">
                You're the admin
              </span>
            )}
          </p>
          <div className="flex items-center gap-4">
            {analytics && (
              <div className="text-right">
                <p className="text-sm text-slate-500 dark:text-slate-400">Squad Health</p>
                <p className="text-2xl font-bold text-blue-600">{analytics.squadAverage}/100</p>
              </div>
            )}
            {!isAdmin && (
              <button
                onClick={handleLeaveSquad}
                className="text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-lg font-semibold transition"
              >
                Leave Squad
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {analytics.totalMembers}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Members</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {analytics.activeMembersToday}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Today</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {analytics.topPerformer ? analytics.topPerformer.name : "-"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Top Performer</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {analytics.atRiskMembers?.length ?? 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">At Risk</p>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Today's Habits
              </h2>

              {habits.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No habits yet.{" "}
                  {isAdmin && (
                    <NavLink to={`/squad/${squadId}/add-habit`} className="text-blue-600 font-semibold">
                      Add one
                    </NavLink>
                  )}
                </p>
              ) : (
                <div className="space-y-3">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit._id}
                      habit={habit}
                      onToggle={handleToggleHabit}
                      isAdmin={isAdmin}
                      onEdit={handleEditHabit}
                      onDelete={handleDeleteHabit}
                    />
                  ))}
                </div>
              )}
            </div>

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

            {analytics?.atRiskMembers?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  🚨 At Risk Members
                </h4>
                <ul className="space-y-1">
                  {analytics.atRiskMembers.map((m) => (
                    <li
                      key={m.userId}
                      className="text-sm text-slate-600 dark:text-slate-300 flex justify-between"
                    >
                      <span>{m.name}</span>
                      <span className="text-red-500 font-semibold">{m.completionRate}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <InviteLink
              inviteToken={squad.inviteToken}
              inviteExpiresAt={squad.inviteExpiresAt}
              onRegenerate={handleRegenerateInvite}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Squad;