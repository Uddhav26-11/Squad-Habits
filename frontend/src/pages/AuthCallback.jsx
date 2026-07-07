import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const run = async () => {
      const token = searchParams.get("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      await login(token);

      const redirectTo = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");
      navigate(redirectTo || "/dashboard", { replace: true });
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-300 animate-pulse">Signing you in...</p>
    </div>
  );
}

export default AuthCallback;