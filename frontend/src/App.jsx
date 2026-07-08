import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { SquadProvider } from "./context/SquadContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Squad from "./pages/Squad";
import SquadLeaderboard from "./pages/SquadLeaderboard";
import SquadMembers from "./pages/SquadMembers";
import AddHabit from "./pages/AddHabit";
import MyHabits from "./pages/MyHabits";
import JoinSquad from "./pages/JoinSquad";
import Profile from "./pages/Profile";

function WithSquads({ children }) {
  return <SquadProvider>{children}</SquadProvider>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <Dashboard />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route
              path="/squad/:squadId"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <Squad />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route
              path="/squad/:squadId/leaderboard"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <SquadLeaderboard />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route
              path="/squad/:squadId/members"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <SquadMembers />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route
              path="/squad/:squadId/add-habit"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <AddHabit />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-habits"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <MyHabits />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route
              path="/join/:token"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <JoinSquad />
                  </WithSquads>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invite/:token"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <JoinSquad />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <WithSquads>
                    <Profile />
                  </WithSquads>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Login />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;