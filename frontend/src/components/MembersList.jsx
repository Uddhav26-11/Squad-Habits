function statusBadgeClasses(status) {
  if (status === "Completed") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  if (status === "In Progress") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  if (status === "No Habits") return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
}

function MembersList({ members = [] }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
      {members.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No members yet.</p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    member.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || "U")}`
                  }
                  alt={member.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-medium text-slate-700 dark:text-slate-200 block">
                    👤 {member.name}{" "}
                    {member.role === "Admin" && (
                      <span className="text-indigo-500 text-xs font-semibold">(Admin)</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <span className="text-orange-500 font-semibold" title="Current streak">
                  🔥 {member.streak}d
                </span>
                <span className="text-blue-500 font-semibold" title="Completion rate">
                  {member.completionRate}%
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadgeClasses(
                    member.todayStatus
                  )}`}
                >
                  {member.todayStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MembersList;