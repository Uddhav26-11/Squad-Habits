import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleGoogleLogin = () => {
    // ProtectedRoute already stashed the intended destination (if any) in
    // sessionStorage before redirecting here — AuthCallback will read it
    // once Google sends the user back.
    window.location.href =
      "https://2gbrq124-5000.inc1.devtunnels.ms/auth/google";

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "register" ? "/auth/register" : "/auth/login";
      const payload =
        mode === "register"
          ? { name: name.trim(), email: email.trim(), password }
          : { email: email.trim(), password };

      const res = await api.post(endpoint, payload);
      await login(res.data.token);

      const redirectTo = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectTo || "/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (mode === "register" ? "Registration failed." : "Login failed.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-2">Squad Habits</h1>
        <p className="text-gray-500 mb-6">Track habits together 🚀</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition mb-4"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex mb-4 rounded-lg overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              mode === "login" ? "bg-slate-900 text-white" : "bg-white text-gray-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-2 text-sm font-semibold transition ${
              mode === "register" ? "bg-slate-900 text-white" : "bg-white text-gray-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-2 mb-4 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-left space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition"
          >
            {submitting
              ? mode === "register"
                ? "Creating account..."
                : "Logging in..."
              : mode === "register"
              ? "Create Account"
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;