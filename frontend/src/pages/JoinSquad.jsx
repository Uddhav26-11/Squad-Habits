import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function JoinSquad() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("joining");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const join = async () => {
      try {
        const res = await api.post(`/squad/join/${token}`);
        setStatus("success");
        setTimeout(() => navigate(`/squad/${res.data.squadId}`), 1000);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to join squad.");
      }
    };
    join();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
        {status === "joining" && <p className="text-slate-600">Joining squad...</p>}
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