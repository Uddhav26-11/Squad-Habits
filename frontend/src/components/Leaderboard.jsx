function rankEmoji(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function Leaderboard({ data = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-4">Leaderboard</h2>

      {data.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No members yet.</p>
      ) : (
        <div className="space-y-2">
          {data.map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg w-8 text-center">{rankEmoji(entry.rank)}</span>
                <img
                  src={
                    entry.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name || "U")}`
                  }
                  alt={entry.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200 block">
                    {entry.name}
                  </span>
                  {entry.role && (
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wide ${
                        entry.role === "Admin"
                          ? "text-indigo-500"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {entry.role}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-orange-500 font-semibold">🔥 {entry.streak}d</span>
                <span className="text-blue-500 font-semibold">{entry.completionRate}%</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.status === "On Track"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : entry.status === "Falling Behind"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {entry.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;