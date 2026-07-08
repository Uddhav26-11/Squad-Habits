import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { useSquads } from "../context/SquadContext";

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}

function Profile() {
  const { user, logout } = useAuth();
  const { squads } = useSquads();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  const joinedOn = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Your account details and squad activity.
        </p>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&size=128`
              }
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {user.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">Account Details</h3>
          <InfoRow label="Name" value={user.name} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Squads Joined" value={squads?.length ?? 0} />
          <InfoRow label="Member Since" value={joinedOn} />
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </Layout>
  );
}

export default Profile;