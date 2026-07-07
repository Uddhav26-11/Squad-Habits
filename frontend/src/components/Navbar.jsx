import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">

      <Link
        to="/dashboard"
        className="text-xl font-bold text-slate-900 dark:text-white"
      >
        🏆 Squad Habits
      </Link>


      <div className="flex items-center gap-4">

        <button
          onClick={() => setDark(!dark)}
          className="text-lg cursor-pointer"
        >
          {dark ? "☀️" : "🌙"}
        </button>


        {user && (
          <div className="flex items-center gap-2">

            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name || "U"
                )}`
              }
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />

            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">
              {user.name}
            </span>

          </div>
        )}


        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;