import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const SQUAD_NAME_REGEX = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;

function validateSquadName(rawName) {
  const trimmed = rawName.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Squad name is required.";
  if (!SQUAD_NAME_REGEX.test(trimmed)) {
    return "Squad name can only contain letters and spaces (no numbers or special characters).";
  }
  return "";
}

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
  const [formError, setFormError] = useState("");

  // Edit modal state
  const [editingSquad, setEditingSquad] = useState(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation state
  const [deletingSquad, setDeletingSquad] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    setFormError("");

    const validationMessage = validateSquadName(newSquadName);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/squad/create", {
        name: newSquadName.trim().replace(/\s+/g, " "),
      });
      setNewSquadName("");
      // Update squad list + count instantly without needing a full page refresh
      setSquads((prev) => [...prev, res.data.squad]);
      setStats((prev) =>
        prev ? { ...prev, totalSquads: (prev.totalSquads || 0) + 1 } : prev
      );
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create squad.");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (squad) => {
    setEditingSquad(squad);
    setEditName(squad.name);
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingSquad(null);
    setEditName("");
    setEditError("");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingSquad) return;

    const validationMessage = validateSquadName(editName);
    if (validationMessage) {
      setEditError(validationMessage);
      return;
    }

    setSavingEdit(true);
    setEditError("");
    try {
      const res = await api.put(`/squad/${editingSquad._id}`, {
        name: editName.trim().replace(/\s+/g, " "),
      });
      setSquads((prev) =>
        prev.map((s) => (s._id === editingSquad._id ? { ...s, name: res.data.squad.name } : s))
      );
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update squad.");
    } finally {
      setSavingEdit(false);
    }
  };

  const openDeleteConfirm = (squad) => {
    setDeletingSquad(squad);
  };

  const closeDeleteConfirm = () => {
    setDeletingSquad(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSquad) return;
    setDeleting(true);
    try {
      await api.delete(`/squad/${deletingSquad._id}`);
      setSquads((prev) => prev.filter((s) => s._id !== deletingSquad._id));
      setStats((prev) =>
        prev ? { ...prev, totalSquads: Math.max((prev.totalSquads || 1) - 1, 0) } : prev
      );
      closeDeleteConfirm();
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete squad.");
      closeDeleteConfirm();
    } finally {
      setDeleting(false);
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
          <StatCard label="Squads" value={squads.length} icon="👥" />
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
                  <div
                    key={squad._id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:shadow-md transition"
                  >
                    <Link to={`/squad/${squad._id}`} className="block">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{squad.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {squad.members?.length || 0} members
                      </p>
                    </Link>

                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => openEditModal(squad)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(squad)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
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
                onChange={(e) => {
                  setNewSquadName(e.target.value);
                  setFormError("");
                }}
                placeholder="Squad name e.g. Morning Runners"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              />
              {formError && (
                <p className="text-xs text-red-500 mb-2">{formError}</p>
              )}
              <p className="text-xs text-slate-400 mb-3">Letters and spaces only.</p>
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

      {/* Edit Squad Modal */}
      {editingSquad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Edit Squad Name
            </h3>
            <form onSubmit={handleSaveEdit}>
              <input
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  setEditError("");
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              />
              {editError && <p className="text-xs text-red-500 mb-2">{editError}</p>}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold"
                >
                  {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSquad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Delete "{deletingSquad.name}"?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              This will permanently delete the squad, its habits, and all progress. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded-lg font-semibold"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;