import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSquads } from "../context/SquadContext";

function NavItem({ to, icon, label, disabled, onClick, end }) {
  const baseClasses =
    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition";

  if (disabled) {
    return (
      <span
        title="Select or create a squad first"
        className={`${baseClasses} text-slate-400 dark:text-slate-600 cursor-not-allowed`}
      >
        <span className="text-lg">{icon}</span>
        {label}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${baseClasses} ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  );
}

function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const { activeSquadId } = useSquads();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const squadPath = (suffix = "") =>
    activeSquadId ? `/squad/${activeSquadId}${suffix}` : "#";

  return (
    <aside className="flex flex-col h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <NavLink to="/dashboard" className="text-lg font-bold text-slate-900 dark:text-white">
          🏆 Squad Habits
        </NavLink>
      </div>

      {user && (
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}`
            }
            alt="avatar"
            className="w-9 h-9 rounded-full"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem to="/dashboard" icon="🏠" label="Dashboard" onClick={onNavigate} end />
        <NavItem
          to={squadPath("/leaderboard")}
          icon="📊"
          label="Leaderboard"
          disabled={!activeSquadId}
          onClick={onNavigate}
        />
        <NavItem
          to={squadPath("/members")}
          icon="👥"
          label="Members"
          disabled={!activeSquadId}
          onClick={onNavigate}
        />
        <NavItem
          to={squadPath("/add-habit")}
          icon="➕"
          label="Add Habit"
          disabled={!activeSquadId}
          onClick={onNavigate}
        />
        <NavItem to="/my-habits" icon="📋" label="My Habits" onClick={onNavigate} />
        <NavItem to="/profile" icon="👤" label="Profile" onClick={onNavigate} />
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <span className="text-lg">{dark ? "☀️" : "🌙"}</span>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;