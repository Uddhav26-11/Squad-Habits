import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import HabitCard from "../components/HabitCard";
import { useAuth } from "../context/AuthContext";

function MyHabits() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]); // [{ squad, habits, isAdmin }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const squadsRes = await api.get("/squad/my");
      const squads = squadsRes.data.squads || [];

      const habitLists = await Promise.all(
        squads.map((squad) =>
          api
            .get(`/habit/squad/${squad._id}`)
            .then((res) => res.data.habits || [])
            .catch(() => [])
        )
      );

      setGroups(
        squads.map((squad, idx) => ({
          squad,
          habits: habitLists[idx],
          isAdmin: squad.admin?._id === user?._id || squad.admin === user?._id,
        }))
      );
    } catch (err) {
      setError("Failed to load your habits.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleToggleHabit = async (habitId, squadId) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.squad._id !== squadId
          ? g
          : {
              ...g,
              habits: g.habits.map((h) =>
                h._id === habitId ? { ...h, completedToday: !h.completedToday } : h
              ),
            }
      )
    );
    try {
      await api.post("/habit/complete", { habitId });
      loadAll();
    } catch (err) {
      loadAll();
    }
  };

  const handleEditHabit = async (habitId, title) => {
    try {
      await api.put(`/habit/${habitId}`, { title });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update habit.");
    }
  };

  const handleDeleteHabit = async (habitId) => {
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading your habits...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">My Habits</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Every habit across all the squads you belong to.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        {groups.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            You aren't part of any squads yet.{" "}
            <Link to="/dashboard" className="text-blue-600 font-semibold">
              Go to your dashboard
            </Link>{" "}
            to create or join one.
          </p>
        ) : (
          <div className="space-y-8">
            {groups.map(({ squad, habits, isAdmin }) => (
              <div key={squad._id}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    <Link to={`/squad/${squad._id}`} className="hover:underline">
                      {squad.name}
                    </Link>
                  </h2>
                  {isAdmin && (
                    <Link
                      to={`/squad/${squad._id}/add-habit`}
                      className="text-sm text-blue-600 font-semibold"
                    >
                      + Add Habit
                    </Link>
                  )}
                </div>

                {habits.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No habits in this squad yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {habits.map((habit) => (
                      <HabitCard
                        key={habit._id}
                        habit={habit}
                        onToggle={(habitId) => handleToggleHabit(habitId, squad._id)}
                        isAdmin={isAdmin}
                        onEdit={handleEditHabit}
                        onDelete={handleDeleteHabit}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MyHabits;