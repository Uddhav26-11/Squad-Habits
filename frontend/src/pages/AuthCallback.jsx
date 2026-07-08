import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 800;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState("Signing you in...");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const token = searchParams.get("token");
      if (!token) {
        console.error("[AuthCallback] No token in URL — Google auth likely failed upstream");
        navigate("/login?error=google_auth_failed", { replace: true });
        return;
      }

      // ROOT CAUSE FIX: previously this called login(token) and then
      // navigated to /dashboard unconditionally. If the follow-up
      // /auth/me call failed for any reason (cold start, dropped request,
      // network blip), AuthContext would silently clear the token and set
      // user to null, but AuthCallback had no idea and pushed the user to
      // /dashboard anyway — where ProtectedRoute immediately kicked them
      // back to /login with no explanation. That's the "successful login
      // that dumps you back on the login page" bug.
      //
      // Now we check the result, retry a couple of times on failure
      // (covers cold-start delays), and only navigate to /dashboard once
      // we've confirmed the user is really loaded.
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (cancelled) return;

        console.log(`[AuthCallback] Login attempt ${attempt}/${MAX_ATTEMPTS}`);
        const success = await login(token);

        if (success) {
          const redirectTo = sessionStorage.getItem("redirectAfterLogin");
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectTo || "/dashboard", { replace: true });
          return;
        }

        if (attempt < MAX_ATTEMPTS) {
          setStatus("Still signing you in...");
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }

      if (!cancelled) {
        console.error("[AuthCallback] Login failed after retries — sending back to /login");
        navigate("/login?error=session_load_failed", { replace: true });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-slate-300 animate-pulse">{status}</p>
    </div>
  );
}

export default AuthCallback;