import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Squad from "./pages/Squad";
import JoinSquad from "./pages/JoinSquad";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Google OAuth Callback */}
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Squad Details */}
          <Route
            path="/squad/:squadId"
            element={
              <ProtectedRoute>
                <Squad />
              </ProtectedRoute>
            }
          />

          {/* Join Squad */}
          <Route
            path="/join/:token"
            element={
              <ProtectedRoute>
                <JoinSquad />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="*" element={<Login />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;