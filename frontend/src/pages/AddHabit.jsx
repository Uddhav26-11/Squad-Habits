import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { SquadTabs } from "./Squad";
import { useAuth } from "../context/AuthContext";

function AddHabit() {
  const { squadId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadSquad = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/squad/${squadId}`);
      setSquad(res.data.squad);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load squad.");
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  useEffect(() => {
    loadSquad();
  }, [loadSquad]);

  const isAdmin = squad?.admin?._id === user?._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Habit title is required.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/habit/create", { squadId, title: title.trim() });
      navigate(`/squad/${squadId}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create habit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <SquadTabs squadId={squadId} squadName={squad?.name} isAdmin={isAdmin} />
          <p className="text-red-500 text-sm">Only the squad admin can add habits.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <SquadTabs squadId={squadId} squadName={squad?.name} isAdmin={isAdmin} />

        <div className="max-w-md">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            Add a New Habit
          </h2>

          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5"
          >
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Habit title
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="e.g. Drink 2L of water"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200"
            />

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-semibold transition"
            >
              {submitting ? "Adding..." : "Add Habit"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default AddHabit;