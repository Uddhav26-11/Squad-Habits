import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [squads, setSquads] = useState([]);
  const [newSquadName, setNewSquadName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, squadsRes] = await Promise.all([
        api.get("/habit/dashboard"),
        api.get("/squad/my"),
      ]);
      setStats(statsRes.data);
      setSquads(squadsRes.data.squads || []);
    } catch (err) {
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    if (!newSquadName.trim()) return;
    setCreating(true);
    try {
      await api.post("/squad/create", { name: newSquadName.trim() });
      setNewSquadName("");
      await loadData();
    } catch (err) {
      setError("Failed to create squad.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
          Welcome back, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Here's your progress overview.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Squads" value={stats?.totalSquads ?? 0} icon="👥" />
          <StatCard label="Active Habits" value={stats?.activeHabits ?? 0} icon="📋" />
          <StatCard label="Current Streak" value={`${stats?.currentStreak ?? 0}d`} icon="🔥" />
          <StatCard label="Completion" value={`${stats?.completionPercentage ?? 0}%`} icon="📈" />
          <StatCard
            label="Best Rank"
            value={stats?.squadRanking ? `#${stats.squadRanking}` : "-"}
            icon="🏆"
          />
          <StatCard label="Today" value={`${stats?.todayProgress ?? 0}%`} icon="✅" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Your Squads</h2>

            {squads.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                You haven't joined any squads yet. Create one to get started!
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {squads.map((squad) => (
                  <Link
                    key={squad._id}
                    to={`/squad/${squad._id}`}
                    className="block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{squad.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {squad.members?.length || 0} members
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Create a Squad</h2>
            <form
              onSubmit={handleCreateSquad}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5"
            >
              <input
                value={newSquadName}
                onChange={(e) => setNewSquadName(e.target.value)}
                placeholder="Squad name e.g. Morning Runners"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-3 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
              >
                {creating ? "Creating..." : "Create Squad"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;