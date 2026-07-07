import { useState } from "react";

function HabitCard({ habit, onToggle, isAdmin, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(habit.title);

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title.trim() === habit.title) {
      setEditing(false);
      setTitle(habit.title);
      return;
    }
    await onEdit(habit._id, title.trim());
    setEditing(false);
  };

  return (
    <div
      className={`border rounded-xl p-4 flex items-center justify-between gap-3 transition ${
        habit.completedToday
          ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700"
          : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700"
      }`}
    >
      {editing ? (
        <form onSubmit={handleSaveEdit} className="flex-1 flex items-center gap-2">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm"
          />
          <button
            type="submit"
            className="text-xs font-semibold text-green-600 hover:text-green-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setTitle(habit.title);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-600"
          >
            Cancel
          </button>
        </form>
      ) : (
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{habit.title}</h3>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {isAdmin && !editing && (
          <>
            <button
              onClick={() => setEditing(true)}
              title="Edit habit"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(habit._id)}
              title="Delete habit"
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              🗑️
            </button>
          </>
        )}

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
    </div>
  );
}

export default HabitCard;