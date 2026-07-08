import { useState } from "react";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="w-64 shrink-0">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-700 dark:text-slate-200 text-xl"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="font-bold text-slate-900 dark:text-white">🏆 Squad Habits</span>
          <span className="w-6" />
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

export default Layout;