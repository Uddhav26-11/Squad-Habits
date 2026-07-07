import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-300 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Remember where the user was trying to go (e.g. /invite/:token) so
    // Login/AuthCallback can send them back here after they sign in.
    const intendedPath = `${location.pathname}${location.search}`;
    if (intendedPath && intendedPath !== "/login") {
      sessionStorage.setItem("redirectAfterLogin", intendedPath);
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;