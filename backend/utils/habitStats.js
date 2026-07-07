function toDateKey(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

function buildCompletionMap(logs) {
  const map = {}; // dateKey -> Set(habitId)
  logs.forEach((log) => {
    if (!log.completed) return;
    const key = toDateKey(new Date(log.date));
    if (!map[key]) map[key] = new Set();
    map[key].add(log.habitId.toString());
  });
  return map;
}

function isDayComplete(map, habitIds, date) {
  if (habitIds.length === 0) return false;
  const set = map[toDateKey(date)];
  if (!set) return false;
  return habitIds.every((id) => set.has(id));
}

function calculateStreak(logs, habitIds) {
  if (habitIds.length === 0) return 0;
  const map = buildCompletionMap(logs);

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!isDayComplete(map, habitIds, cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (isDayComplete(map, habitIds, cursor)) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function calculateWeeklyCompletionRate(logs, habitIds, days = 7) {
  if (habitIds.length === 0) return 0;

  const map = buildCompletionMap(logs);
  let completedCount = 0;
  const totalPossible = habitIds.length * days;

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const set = map[toDateKey(cursor)];
    if (set) {
      habitIds.forEach((id) => {
        if (set.has(id)) completedCount++;
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  if (totalPossible === 0) return 0;
  return Math.round((completedCount / totalPossible) * 100);
}

function countMissedThisWeek(logs, habitIds, days = 7) {
  const map = buildCompletionMap(logs);
  let missed = 0;

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (let i = 0; i < days; i++) {
    const set = map[toDateKey(cursor)] || new Set();
    habitIds.forEach((id) => {
      if (!set.has(id)) missed++;
    });
    cursor.setDate(cursor.getDate() - 1);
  }

  return missed;
}

function getLastActiveDate(logs) {
  const completedLogs = logs.filter((log) => log.completed);
  if (completedLogs.length === 0) return null;

  const latest = completedLogs.reduce((latestLog, log) => {
    return new Date(log.date) > new Date(latestLog.date) ? log : latestLog;
  });

  return toDateKey(new Date(latest.date));
}

module.exports = {
  toDateKey,
  calculateStreak,
  calculateWeeklyCompletionRate,
  countMissedThisWeek,
  getLastActiveDate,
};