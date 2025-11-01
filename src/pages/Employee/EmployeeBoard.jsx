import { useEffect, useMemo, useState } from "react";

const STATUSES = ["Todo", "In Progress", "Review", "Done"]; // hide Backlog for employees

function TaskCard({ task, onMove, onFlagToggle }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-zinc-900">{task.title}</h4>
        <button
          className={`text-xs ${task.flagged ? "text-red-600" : "text-zinc-500"}`}
          onClick={() => onFlagToggle(task)}
          title={task.flagged ? "Unflag" : "Flag"}
        >
          {task.flagged ? "⚑" : "⚐"}
        </button>
      </div>
      <p className="mt-1 text-sm text-zinc-600 line-clamp-3">{task.description}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
        <span>Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</span>
        <span className="rounded bg-zinc-100 px-2 py-0.5">{task.priority || "Normal"}</span>
      </div>
      <div className="mt-3">
        <select
          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
          value={task.status}
          onChange={(e) => onMove(task, e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function EmployeeBoard({ currentUserId }) {
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    const res = await fetch(`/api/tasks?assigneeId=${currentUserId}`);
    const data = await res.json();
    setTasks(data);
  };
  useEffect(() => { load(); }, [currentUserId]);

  const byStatus = useMemo(() => {
    const m = Object.fromEntries(STATUSES.map((s) => [s, []]));
    tasks.forEach((t) => m[t.status]?.push(t));
    return m;
  }, [tasks]);

  const moveTask = async (task, nextStatus) => {
    // Optional: enforce allowed transitions
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) setTasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, status: nextStatus } : x)));
  };

  const flagToggle = async (task) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagged: !task.flagged }),
    });
    if (res.ok) setTasks((prev) => prev.map((x) => (x.id === task.id ? { ...x, flagged: !x.flagged } : x)));
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">My Tasks</h1>
        <button className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm" onClick={load}>Refresh</button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-lg border border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between border-b border-zinc-200 p-2">
              <h2 className="text-sm font-semibold text-zinc-800">{s}</h2>
              <span className="text-xs text-zinc-500">{byStatus[s]?.length || 0}</span>
            </div>
            <div className="space-y-2 p-2">
              {byStatus[s]?.map((t) => (
                <TaskCard key={t.id} task={t} onMove={moveTask} onFlagToggle={flagToggle} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

