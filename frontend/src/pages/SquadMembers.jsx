import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import MembersList from "../components/MembersList";
import { SquadTabs } from "./Squad";
import { useAuth } from "../context/AuthContext";

function SquadMembers() {
  const { squadId } = useParams();
  const { user } = useAuth();

  const [squad, setSquad] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [squadRes, membersRes] = await Promise.all([
        api.get(`/squad/${squadId}`),
        api.get(`/habit/members/${squadId}`),
      ]);
      setSquad(squadRes.data.squad);
      setMembers(
        (membersRes.data.members || []).map((m) => ({
          ...m,
          todayStatus:
            m.completionRate >= 70 ? "Completed" : m.completionRate > 0 ? "In Progress" : "No Habits",
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load members.");
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isAdmin = squad?.admin?._id === user?._id;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading members...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <SquadTabs squadId={squadId} squadName={squad?.name} isAdmin={isAdmin} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">
            {error}
          </div>
        )}

        <MembersList members={members} />
      </div>
    </Layout>
  );
}

export default SquadMembers;