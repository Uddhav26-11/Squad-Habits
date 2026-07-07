function HabitCard({ habit, onToggle }) {
  return (
    <div
      className={`border rounded-xl p-4 flex items-center justify-between transition ${
        habit.completedToday
          ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"
          : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
      }`}
    >
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{habit.title}</h3>
      <button
        onClick={() => onToggle(habit._id)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
          habit.completedToday
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
        }`}
      >
        {habit.completedToday ? "✓ Done" : "Mark Done"}
      </button>
    </div>
  );
}

export default HabitCard;