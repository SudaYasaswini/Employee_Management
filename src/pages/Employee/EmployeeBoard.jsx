import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiGet, apiPut } from "../../lib/api";

// Employee-facing columns
const STATUSES_UI = ["Todo", "In Progress", "Review", "Done"];

// Map backend <-> UI
const uiFromBackend = (s) => {
  switch (s) {
    case "ASSIGNED": return "Todo";
    case "PENDING": return "In Progress";
    case "COMPLETED": return "Done";
    case "CANCELLED": return "Review";
    default: return "Todo";
  }
};
const backendFromUi = (s) => {
  switch (s) {
    case "Todo": return "ASSIGNED";
    case "In Progress": return "PENDING";
    case "Done": return "COMPLETED";
    case "Review": return "PENDING"; // adjust if server adds REVIEW
    default: return "ASSIGNED";
  }
};

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
          {STATUSES_UI.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function EmployeeBoard() {
  const { user } = useAuth(); // expects { empId, name, email }
  const empId = user?.empId || "";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize backend task into UI task
  const normalize = (rows) => {
    return (rows || []).map(t => ({
      id: t.id,
      title: t.taskName,
      description: t.taskDescription,
      status: uiFromBackend(t.status),
      dueDate: t.dueDate,
      priority: "Normal", // UI-only for now
      flagged: false,     // UI-only toggle
      _raw: t,
    }));
  };

  const load = async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await apiGet(`/task-history/by-emp/${encodeURIComponent(empId)}`);
      const data = await res.json();
      setTasks(normalize(data));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [empId]);

  const byStatus = useMemo(() => {
    const m = Object.fromEntries(STATUSES_UI.map((s) => [s, []]));
    tasks.forEach((t) => m[t.status]?.push(t));
    return m;
  }, [tasks]);

  const moveTask = async (task, nextUiStatus) => {
    if (task.status === nextUiStatus) return;
    const prev = tasks;
    // Optimistic UI
    setTasks(prev.map(x => x.id === task.id ? { ...x, status: nextUiStatus } : x));
    try {
      const backendStatus = backendFromUi(nextUiStatus);
      const payload = { status: backendStatus };
      if (backendStatus === "COMPLETED") payload.completedAtDateTime = new Date().toISOString();
      else payload.updatedAtDateTime = new Date().toISOString();

      const res = await apiPut(`/task-history/${task.id}`, payload);
      if (!res.ok) throw new Error('update failed');
    } catch {
      setTasks(prev); // revert on error
    }
  };

  const flagToggle = async (task) => {
    // UI-only toggle; keep behavior consistent with your current card
    setTasks(prev => prev.map(x => x.id === task.id ? { ...x, flagged: !x.flagged } : x));
  };

  if (!empId) {
    return (
      <div className="mx-auto max-w-7xl p-4">
        <h1 className="text-xl font-semibold text-zinc-900">My Tasks</h1>
        <p className="text-sm text-zinc-600 mt-2">No employee ID found on the current session. Please sign in as an employee.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">My Tasks</h1>
          <p className="text-xs text-zinc-500 mt-1">Signed in as {user?.name || empId} ({empId})</p>
        </div>
        <button className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {STATUSES_UI.map((s) => (
          <div key={s} className="rounded-lg border border-zinc-200 bg-zinc-50">
            <div className="flex items-center justify-between border-b border-zinc-200 p-2">
              <h2 className="text-sm font-semibold text-zinc-800">{s}</h2>
              <span className="text-xs text-zinc-500">{byStatus[s]?.length || 0}</span>
            </div>
            <div className="space-y-2 p-2">
              {byStatus[s]?.map((t) => (
                <TaskCard key={t.id} task={t} onMove={moveTask} onFlagToggle={flagToggle} />
              ))}
              {(!byStatus[s] || byStatus[s].length === 0) && (
                <div className="text-xs text-zinc-500 p-2">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
