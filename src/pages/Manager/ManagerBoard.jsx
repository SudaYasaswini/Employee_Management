import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Backend statuses (must match regex in DTO/Entity)
const STATUSES = ["ASSIGNED", "PENDING", "COMPLETED", "CANCELLED"];

// API calls aligned to your Spring controllers
async function fetchEmployees(page = 0, size = 500) {
  const res = await fetch(`/api/employees?page=${page}&size=${size}`);
  if (!res.ok) throw new Error(`employees fetch failed: ${res.status}`);
  return res.json(); // Page<EmployeeResponse>
}

async function fetchTasks(page = 0, size = 500) {
  const res = await fetch(`/api/task-history?page=${page}&size=${size}`);
  if (!res.ok) throw new Error(`tasks fetch failed: ${res.status}`);
  return res.json(); // Page<EmployeeTaskHistoryResponse>
}

async function createTask(payload) {
  // payload must conform to EmployeeTaskHistoryCreateRequest
  // Required: empId, empName, taskName, taskDescription, taskAssignedBy
  // Optional: status (ASSIGNED|PENDING|COMPLETED|CANCELLED), dueDate (ISO), createdAtDateTime
  const res = await fetch(`/api/task-history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`task create failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function updateTask(id, payload) {
  // payload must conform to EmployeeTaskHistoryUpdateRequest
  // Optional: taskName, taskDescription, status, dueDate, updatedAtDateTime, completedAtDateTime
  const res = await fetch(`/api/task-history/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`task update failed: ${res.status} ${err}`);
  }
  return res.json();
}

function TaskCard({ task, onEdit, onMove }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-zinc-900">{task.taskName}</h4>
      </div>
      <p className="mt-1 text-sm text-zinc-600 line-clamp-3">{task.taskDescription}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
        <span>@{task.empName || "Unassigned"}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <select
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
          value={task.status}
          onChange={(e) => onMove(task, e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rounded-md border border-zinc-200 px-2 py-1 text-sm"
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default function ManagerBoard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]); // EmployeeResponse[]
  const [filters, setFilters] = useState({ empId: "ALL" });
  const [modalState, setModalState] = useState(null); // { mode: 'new' } | { mode: 'edit', task }
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [taskPage, empPage] = await Promise.all([fetchTasks(0, 500), fetchEmployees(0, 500)]);
      setTasks(taskPage?.content || []);
      setEmployees(empPage?.content || []);
    } catch (e) {
      console.error(e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.empId !== "ALL" && t.empId !== filters.empId) return false;
      return true;
    });
  }, [tasks, filters]);

  const byStatus = useMemo(() => {
    const m = Object.fromEntries(STATUSES.map((s) => [s, []]));
    filtered.forEach((t) => m[t.status]?.push(t));
    return m;
  }, [filtered]);

  const applyMove = (tasks, id, nextStatus) =>
  tasks.map(t => (t.id === id ? { ...t, status: nextStatus } : t));

 const moveTask = async (task, nextStatus) => {
  if (task.status === nextStatus) return;
  const prev = tasks;
  const next = applyMove(prev, task.id, nextStatus);
  setTasks(next);
  try {
    const payload = { status: nextStatus };
    if (nextStatus === "COMPLETED") payload.completedAtDateTime = new Date().toISOString();
    else payload.updatedAtDateTime = new Date().toISOString();
    await updateTask(task.id, payload);
  } catch {
    setTasks(prev);
  }
};


  const onDragEnd = async (result) => {
  const { destination, source, draggableId } = result;
  if (!destination) return;
  const to = destination.droppableId;
  const id = String(draggableId);
  const task = tasks.find(t => String(t.id) === id);
  if (!task || task.status === to) return;

  // 1) Optimistic local update
  const prev = tasks;
  const next = applyMove(prev, task.id, to);
  setTasks(next);

  // 2) Fire API, revert on error
  try {
    const payload = { status: to };
    if (to === "COMPLETED") payload.completedAtDateTime = new Date().toISOString();
    else payload.updatedAtDateTime = new Date().toISOString();
    await updateTask(task.id, payload);
    // optional: no-op, we already updated
  } catch (e) {
    setTasks(prev); // revert on failure
  }
};

  const openNew = () => setModalState({ mode: "new" });
  const openEdit = (task) => setModalState({ mode: "edit", task });

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">Manager Board</h1>
        <div className="flex items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-600">Assignee</label>
            <select
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
              value={filters.empId}
              onChange={(e) => setFilters((f) => ({ ...f, empId: e.target.value }))}
            >
              <option value="ALL">All assignees</option>
              {employees.map((e) => (
                <option key={e.id} value={e.empId}>
                  {e.empId} — {[e.firstName, e.lastName].filter(Boolean).join(" ")}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white"
            onClick={openNew}
          >
            New Task
          </button>
          <button
            type="button"
            className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {STATUSES.map((s) => (
            <Droppable droppableId={s} key={s}>
              {(provided) => (
                <div
                  ref={provided.innerRef}   
                  {...provided.droppableProps}
                  className="rounded-lg border border-zinc-200 bg-zinc-50"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 p-2">
                    <h2 className="text-sm font-semibold text-zinc-800">{s}</h2>
                    <span className="text-xs text-zinc-500">{byStatus[s]?.length || 0}</span>
                  </div>
                  <div className="space-y-2 p-2">
                    {(byStatus[s] || []).map((t, idx) => (
                      <Draggable key={t.id} draggableId={String(t.id)} index={idx}>
                        {(drag) => (
                          <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                            <TaskCard task={t} onEdit={openEdit} onMove={moveTask} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {modalState && (
        <TaskModal
          initial={modalState.mode === "edit" ? modalState.task : null}
          employees={employees}
          onClose={() => setModalState(null)}
          onSaved={async () => {
            await load();
            setModalState(null);
          }}
        />
      )}
    </div>
  );
}

function TaskModal({ onClose, onSaved, initial, employees }) {
  // Conform UI to backend fields
  const [form, setForm] = useState(
    initial
      ? {
          empId: initial.empId || "",
          empName: initial.empName || "",
          taskName: initial.taskName || "",
          taskDescription: initial.taskDescription || "",
          status: initial.status || "ASSIGNED",
          dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "", // yyyy-mm-dd in input
          taskAssignedBy: initial.taskAssignedBy || "Manager",
        }
      : {
          empId: "",
          empName: "",
          taskName: "",
          taskDescription: "",
          status: "ASSIGNED",
          dueDate: "",
          taskAssignedBy: "Manager",
        }
  );
  const [submitting, setSubmitting] = useState(false);

  // Keep empName consistent with selected empId
  useEffect(() => {
    const emp = employees.find((e) => e.empId === form.empId);
    const nm = [emp?.firstName, emp?.lastName].filter(Boolean).join(" ");
    if (nm !== form.empName) {
      setForm((f) => ({ ...f, empName: nm }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.empId, employees]);

  const isValid =
    (initial ? true : !!form.empId) &&
    !!form.empName &&
    !!form.taskName &&
    !!form.taskDescription &&
    !!form.taskAssignedBy &&
    STATUSES.includes(form.status);

  const save = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      if (initial) {
        // PATCH (only send updatable fields)
        const payload = {
          taskName: form.taskName,
          taskDescription: form.taskDescription,
          status: form.status,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          updatedAtDateTime: new Date().toISOString(),
        };
        await updateTask(initial.id, payload);
        await onSaved();
      } else {
        // POST (must include required fields)
        const payload = {
          empId: form.empId, // REQUIRED
          empName: form.empName, // REQUIRED
          taskName: form.taskName, // REQUIRED
          taskDescription: form.taskDescription, // REQUIRED
          status: form.status || "ASSIGNED", // optional but must match allowed
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined, // optional
          taskAssignedBy: form.taskAssignedBy || "Manager", // REQUIRED
          createdAtDateTime: new Date().toISOString(), // optional
        };
        await createTask(payload);
        await onSaved();
      }
    } catch (e) {
      console.error(e);
      // Optional: show toast with error text
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-lg">
        <h3 className="mb-3 text-lg font-semibold">{initial ? "Edit Task" : "New Task"}</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-600 mb-1">Assignee (empId)</label>
              <select
                className="w-full rounded-md border border-zinc-200 px-2 py-2"
                required={!initial}
                value={form.empId}
                onChange={(e) => setForm((f) => ({ ...f, empId: e.target.value }))}
                disabled={!!initial} // immutable after create; remove if you want reassignment via PATCH
              >
                <option value="">Select</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.empId}>
                    {e.empId} — {[e.firstName, e.lastName].filter(Boolean).join(" ")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-600 mb-1">Due date</label>
              <input
                type="date"
                className="w-full rounded-md border border-zinc-200 px-2 py-2"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <input
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
            placeholder="Task name"
            value={form.taskName}
            onChange={(e) => setForm((f) => ({ ...f, taskName: e.target.value }))}
          />
          <textarea
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
            rows={3}
            placeholder="Task description"
            value={form.taskDescription}
            onChange={(e) => setForm((f) => ({ ...f, taskDescription: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-zinc-600 mb-1">Status</label>
              <select
                className="w-full rounded-md border border-zinc-200 px-2 py-2"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-600 mb-1">Assigned by</label>
              <input
                className="w-full rounded-md border border-zinc-200 px-2 py-2"
                placeholder="Manager"
                value={form.taskAssignedBy}
                onChange={(e) => setForm((f) => ({ ...f, taskAssignedBy: e.target.value }))}
              />
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="rounded-md border border-zinc-200 px-3 py-1.5" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-white disabled:opacity-50"
              onClick={save}
              disabled={!isValid || submitting}
            >
              {submitting ? "Saving..." : initial ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
