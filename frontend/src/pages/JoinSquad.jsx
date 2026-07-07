import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function JoinSquad() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // status: "loading" (fetching preview) | "confirm" (ask user to confirm)
  // | "joining" | "success" | "error"
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await api.get(`/squad/invite/${token}/preview`);
        setPreview(res.data);
        setStatus("confirm");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "This invite link is invalid or has expired.");
      }
    };
    loadPreview();
  }, [token]);

  const handleConfirmJoin = async () => {
    setStatus("joining");
    try {
      const res = await api.post(`/squad/join/${token}`);
      setStatus("success");
      setTimeout(() => navigate(`/squad/${res.data.squadId}`, { replace: true }), 800);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to join squad.");
    }
  };

  const handleSwitchAccount = () => {
    // Log the current account out and send them back to Login. ProtectedRoute
    // will remember this invite URL and return here once they sign back in
    // with the correct account.
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        {status === "loading" && (
          <p className="text-slate-600 dark:text-slate-300">Loading invite...</p>
        )}

        {status === "confirm" && preview && (
          <>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Join "{preview.squadName}"?
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Admin: {preview.adminName} • {preview.memberCount} member
              {preview.memberCount === 1 ? "" : "s"}
            </p>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 mb-4 flex items-center gap-3">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}`
                }
                alt="avatar"
                className="w-9 h-9 rounded-full"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            {preview.alreadyMember ? (
              <>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  You're already a member of this squad.
                </p>
                <button
                  onClick={() => navigate(`/squad/${preview.squadId}`, { replace: true })}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition mb-2"
                >
                  Go to Squad
                </button>
              </>
            ) : (
              <button
                onClick={handleConfirmJoin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition mb-2"
              >
                Join as {user?.name?.split(" ")[0] || "this account"}
              </button>
            )}

            <button
              onClick={handleSwitchAccount}
              className="text-xs text-slate-400 hover:text-slate-500 underline"
            >
              Not you? Switch account
            </button>
          </>
        )}

        {status === "joining" && (
          <p className="text-slate-600 dark:text-slate-300">Joining squad...</p>
        )}

        {status === "success" && (
          <p className="text-green-600 font-semibold">Joined! Redirecting...</p>
        )}

        {status === "error" && (
          <>
            <p className="text-red-600 font-semibold mb-4">{message}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default JoinSquad;