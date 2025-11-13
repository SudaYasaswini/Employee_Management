import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { apiGet, apiPost, apiPut } from "../../lib/api";

// Backend statuses (must match regex in DTO/Entity)
const CORE_STATUSES = ["ASSIGNED", "PENDING", "COMPLETED", "CANCELLED"];
// UI columns: add a derived BACKLOG column for unassigned
const UI_COLUMNS = ["BACKLOG", ...CORE_STATUSES];

// API calls aligned to your Spring controllers
async function fetchEmployees(page = 0, size = 500) {
  const res = await apiGet(`/employees?page=${page}&size=${size}`);
  if (!res.ok) throw new Error(`employees fetch failed: ${res.status}`);
  return res.json();
}
async function fetchTasks(page = 0, size = 500) {
  const res = await apiGet(`/task-history?page=${page}&size=${size}`);
  if (!res.ok) throw new Error(`tasks fetch failed: ${res.status}`);
  return res.json();
}
async function createTask(payload) {
  const res = await apiPost(`/task-history`, payload);
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`task create failed: ${res.status} ${err}`);
  }
  return res.json();
}

async function updateTask(id, payload) {
  // payload must conform to EmployeeTaskHistoryUpdateRequest
  // Optional: taskName, taskDescription, status, dueDate, updatedAtDateTime, completedAtDateTime
  // Extended: employeeId (String | null) for assignment/unassignment
  const res = await apiPut(`/task-history/${id}`, payload);
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`task update failed: ${res.status} ${err}`);
  }
  return res.json();
}

function TaskCard({ task, onEdit, onMove, onSeeMore }) {
  const showSeeMore =
    (task.taskDescription && task.taskDescription.length > 140) ||
    (task.taskName && task.taskName.length > 60);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm min-h-[156px] max-h-[156px] flex flex-col">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-zinc-900 line-clamp-1" title={task.taskName}>
          {task.taskName}
        </h4>
      </div>

      <p className="mt-1 text-sm text-zinc-600 line-clamp-3" title={task.taskDescription || ""}>
        {task.taskDescription}
      </p>

      <div className="mt-2 flex items-center justify-between text-xs text-zinc-600">
        <span className="line-clamp-1" title={task.empName || "Unassigned"}>
          @{task.empName || "Unassigned"}
        </span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}</span>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
            value={task.status}
            onChange={(e) => onMove(task, e.target.value)}
          >
            {CORE_STATUSES.map((s) => (
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

        {showSeeMore && (
          <button
            type="button"
            className="text-xs text-indigo-600 hover:underline"
            onClick={() => onSeeMore(task)}
          >
            See more
          </button>
        )}
      </div>
    </div>
  );
}

export default function ManagerBoard() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  // Filters now by employeeId (object id); "ALL" or "" (unassigned) are special
  const [filters, setFilters] = useState({ employeeId: "ALL" });
  const [modalState, setModalState] = useState(null); // { mode: 'new' } | { mode: 'edit', task }
  const [detailTask, setDetailTask] = useState(null); // For TaskDetailsModal
  const [loading, setLoading] = useState(false);

  // Build a quick lookup by employee.id for labels
  const employeeById = useMemo(() => {
    const map = new Map();
    for (const e of employees) {
      map.set(e.id, e);
    }
    return map;
  }, [employees]);

  const load = async () => {
    setLoading(true);
    try {
      const [taskPage, empPage] = await Promise.all([fetchTasks(0, 500), fetchEmployees(0, 500)]);
      const emps = empPage?.content || [];
      const empBusinessIds = new Set(emps.map((e) => e.empId));

      const originalTasks = taskPage?.content || [];
      // Normalize: if UI still receives tasks with legacy empId/empName, keep them for display
      // But primary linkage is employeeId (object id). If your backend already returns employeeId, use it.
      const normalized = originalTasks.map((t) => {
        // If task has employeeId (object id), prefer it; if not, try to resolve from empId
        let employeeId = t.employeeId || null;
        if (!employeeId && t.empId) {
          // best-effort resolve: find employee with matching business empId
          const found = emps.find((e) => e.empId === t.empId);
          employeeId = found?.id || null;
        }

        // Unassign if there is no valid linkage
        if (!employeeId) {
          return { ...t, employeeId: null, empId: "", empName: "Unassigned" };
        }

        // If employee business id unknown, still keep the linkage by object id and compute display name
        const emp = emps.find((e) => e.id === employeeId);
        const displayName = [emp?.firstName, emp?.lastName].filter(Boolean).join(" ") || t.empName || "";
        const displayEmpId = emp?.empId || (empBusinessIds.has(t.empId) ? t.empId : "");
        return { ...t, employeeId, empId: displayEmpId, empName: displayName || "Unassigned" };
      });

      setTasks(normalized);
      setEmployees(emps);
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

  // Filter by assignee selection (by employeeId)
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.employeeId === "ALL") return true;
      if (filters.employeeId === "" && (!t.employeeId || t.employeeId == null)) return true; // Unassigned
      return t.employeeId === filters.employeeId;
    });
  }, [tasks, filters]);

  // Group tasks into columns:
  // - BACKLOG: unassigned (employeeId null)
  // - ASSIGNED: must have an assignee AND status === ASSIGNED
  // - other core columns by status, regardless of assignment
  const byColumn = useMemo(() => {
    const map = Object.fromEntries(UI_COLUMNS.map((c) => [c, []]));
    filtered.forEach((t) => {
      const isUnassigned = !t.employeeId;
      if (isUnassigned) {
        map.BACKLOG.push(t);
      } else {
        if (t.status === "ASSIGNED") {
          map.ASSIGNED.push(t);
        } else if (CORE_STATUSES.includes(t.status)) {
          map[t.status].push(t);
        } else {
          (map[t.status] || map.ASSIGNED).push(t);
        }
      }
    });
    return map;
  }, [filtered]);

  const applyMoveStatus = (arr, id, nextStatus) =>
    arr.map((t) => (t.id === id ? { ...t, status: nextStatus } : t));

  const moveTask = async (task, nextStatus) => {
    if (task.status === nextStatus) return;
    const prev = tasks;
    const next = applyMoveStatus(prev, task.id, nextStatus);
    setTasks(next);
    try {
      const payload = {
        status: nextStatus,
        updatedAtDateTime: nextStatus !== "COMPLETED" ? new Date().toISOString() : undefined,
        completedAtDateTime: nextStatus === "COMPLETED" ? new Date().toISOString() : undefined,
      };
      await updateTask(task.id, payload);
    } catch {
      setTasks(prev);
    }
  };

  // Drag and drop between columns
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const from = source.droppableId;
    const to = destination.droppableId;
    const id = String(draggableId);
    const task = tasks.find((t) => String(t.id) === id);
    if (!task) return;

    // Moving into BACKLOG means unassign the task (keep status)
    if (to === "BACKLOG") {
      const prev = tasks;
      const next = prev.map((t) =>
        t.id === task.id ? { ...t, employeeId: null, empId: "", empName: "Unassigned" } : t
      );
      setTasks(next);
      try {
        await updateTask(task.id, {
          employeeId: null, // use object id field to unassign
          updatedAtDateTime: new Date().toISOString(),
        });
      } catch (e) {
        setTasks(prev);
      }
      return;
    }

    // Moving out of BACKLOG to a status column does not auto-assign; only changes status
    if (from === "BACKLOG" && CORE_STATUSES.includes(to)) {
      if (task.status === to) return;
      const prev = tasks;
      const next = applyMoveStatus(prev, task.id, to);
      setTasks(next);
      try {
        await updateTask(task.id, {
          status: to,
          updatedAtDateTime: to !== "COMPLETED" ? new Date().toISOString() : undefined,
          completedAtDateTime: to === "COMPLETED" ? new Date().toISOString() : undefined,
        });
      } catch (e) {
        setTasks(prev);
      }
      return;
    }

    // Between status columns (ASSIGNED/PENDING/COMPLETED/CANCELLED)
    if (CORE_STATUSES.includes(to) && task.status !== to) {
      const prev = tasks;
      const next = applyMoveStatus(prev, task.id, to);
      setTasks(next);
      try {
        await updateTask(task.id, {
          status: to,
          updatedAtDateTime: to !== "COMPLETED" ? new Date().toISOString() : undefined,
          completedAtDateTime: to === "COMPLETED" ? new Date().toISOString() : undefined,
        });
      } catch (e) {
        setTasks(prev);
      }
    }
  };

  const openNew = () => setModalState({ mode: "new" });
  const openEdit = (task) => setModalState({ mode: "edit", task });

  // Optimistic local updates after modal save
  const onLocalUpdate = (id, patch) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };
  const onLocalCreate = (newItem) => {
    setTasks((prev) => [newItem, ...prev]);
  };

  return (
    <div className="mx-auto max-w-7xl p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-zinc-900">Current Sprint</h1>
        <div className="flex items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-zinc-600">Assignee</label>
            <select
              className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm"
              value={filters.employeeId}
              onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))}
            >
              <option value="ALL">All assignees</option>
              <option value="">Unassigned</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {/* Show business id and name, store object id */}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {UI_COLUMNS.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="rounded-lg border border-zinc-200 bg-zinc-50"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200 p-2">
                    <h2 className="text-sm font-semibold text-zinc-800">{col}</h2>
                    <span className="text-xs text-zinc-500">{byColumn[col]?.length || 0}</span>
                  </div>
                  <div className="space-y-2 p-2">
                    {(byColumn[col] || []).map((t, idx) => (
                      <Draggable key={t.id} draggableId={String(t.id)} index={idx}>
                        {(drag) => (
                          <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                            <TaskCard
                              task={t}
                              onEdit={openEdit}
                              onMove={moveTask}
                              onSeeMore={setDetailTask}
                            />
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
          employeeById={employeeById}
          onClose={() => setModalState(null)}
          onLocalUpdate={onLocalUpdate}
          onLocalCreate={onLocalCreate}
          onSaved={async () => {
            await load();
            setModalState(null);
          }}
        />
      )}

      {detailTask && <TaskDetailsModal task={detailTask} onClose={() => setDetailTask(null)} />}
    </div>
  );
}

function TaskModal({ onClose, onSaved, onLocalUpdate, onLocalCreate, initial, employees, employeeById }) {
  const [form, setForm] = useState(
    initial
      ? {
          // Store selected object id for assignment
          employeeId: initial.employeeId || "",
          empName: initial.empName || "",
          taskName: initial.taskName || "",
          taskDescription: initial.taskDescription || "",
          status: CORE_STATUSES.includes(initial?.status) ? initial.status : "ASSIGNED",
          dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : "",
          taskAssignedBy: initial.taskAssignedBy || "Manager",
        }
      : {
          employeeId: "",
          empName: "",
          taskName: "",
          taskDescription: "",
          status: "ASSIGNED",
          dueDate: "",
          taskAssignedBy: "Manager",
        }
  );
  const [submitting, setSubmitting] = useState(false);

  // Keep empName display in sync with selected employeeId
  useEffect(() => {
    const emp = employeeById.get(form.employeeId);
    const nm = [emp?.firstName, emp?.lastName].filter(Boolean).join(" ");
    if (nm !== form.empName) {
      setForm((f) => ({ ...f, empName: nm }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.employeeId, employees]);

  const isValid =
    !!form.taskName && !!form.taskDescription && !!form.taskAssignedBy && CORE_STATUSES.includes(form.status);

  const save = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      if (initial) {
        const isCompleted = form.status === "COMPLETED";
        const payload = {
          taskName: form.taskName,
          taskDescription: form.taskDescription,
          status: form.status,
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          updatedAtDateTime: !isCompleted ? new Date().toISOString() : undefined,
          completedAtDateTime: isCompleted ? new Date().toISOString() : undefined,
        };

        // Always send employeeId for clarity. Use null to unassign.
        payload.employeeId = form.employeeId || null;

        // Optionally include display fields if backend stores denormalized copies
        if (payload.employeeId) {
          const selected = employeeById.get(form.employeeId);
          const displayName = [selected?.firstName, selected?.lastName].filter(Boolean).join(" ");
          // If your backend accepts these two on update, include them; else omit.
          payload.empName = displayName || null;
          payload.empId = selected?.empId || null; // business id for display only
        } else {
          payload.empName = null;
          payload.empId = null;
        }

        console.log("🧾 UPDATE PAYLOAD", payload);
        await updateTask(initial.id, payload);

        onLocalUpdate?.(initial.id, {
          taskName: form.taskName,
          taskDescription: form.taskDescription,
          status: form.status,
          dueDate: payload.dueDate ?? initial.dueDate,
          // Keep local display fields consistent
          employeeId: payload.employeeId,
          empId: payload.empId !== undefined ? payload.empId : initial.empId,
          empName: payload.empName !== undefined ? payload.empName : initial.empName,
        });

        await onSaved();
      } else {
        const payload = {
          // Create now uses employeeId as the authoritative linkage
          employeeId: form.employeeId || null,
          // Keep denormalized for display if your backend supports/returns them
          empName: form.employeeId
            ? (() => {
                const selected = employeeById.get(form.employeeId);
                return [selected?.firstName, selected?.lastName].filter(Boolean).join(" ");
              })()
            : null,
          empId: form.employeeId ? employeeById.get(form.employeeId)?.empId || null : null,
          taskName: form.taskName,
          taskDescription: form.taskDescription,
          status: form.status || "ASSIGNED",
          dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
          taskAssignedBy: form.taskAssignedBy || "Manager",
          createdAtDateTime: new Date().toISOString(),
        };
        const created = await createTask(payload);
        onLocalCreate?.(created);
        await onSaved();
      }
    } catch (e) {
      console.error(e);
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
              <label className="block text-xs text-zinc-600 mb-1">Assignee (employeeId)</label>
              <select
                className="w-full rounded-md border border-zinc-200 px-2 py-2"
                value={form.employeeId}
                onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
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

          <label className="block text-xs text-zinc-600 mb-1">Task name</label>
          <input
            className="w-full rounded-md border border-zinc-200 px-3 py-2"
            placeholder="Task name"
            value={form.taskName}
            onChange={(e) => setForm((f) => ({ ...f, taskName: e.target.value }))}
          />

          <label className="block text-xs text-zinc-600 mb-1">Task description</label>
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
                {CORE_STATUSES.map((s) => (
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

function TaskDetailsModal({ task, onClose }) {
  if (!task) return null;

  const rows = [
    { label: "Task ID", value: task.id },
    { label: "Name", value: task.taskName },
    { label: "Description", value: task.taskDescription },
    { label: "Status", value: task.status },
    { label: "Assignee", value: task.empName || "Unassigned" },
    { label: "Assignee ID (business)", value: task.empId || "—" },
    { label: "Assignee Object ID", value: task.employeeId || "—" },
    { label: "Assigned By", value: task.taskAssignedBy || "—" },
    { label: "Due Date", value: task.dueDate ? new Date(task.dueDate).toLocaleString() : "—" },
    { label: "Created At", value: task.createdAtDateTime ? new Date(task.createdAtDateTime).toLocaleString() : "—" },
    { label: "Updated At", value: task.updatedAtDateTime ? new Date(task.updatedAtDateTime).toLocaleString() : "—" },
    { label: "Completed At", value: task.completedAtDateTime ? new Date(task.completedAtDateTime).toLocaleString() : "—" },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Task details</h3>
          <button
            type="button"
            className="rounded-md border border-zinc-200 px-2 py-1 text-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-3">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-3 gap-2">
              <div className="text-xs text-zinc-500">{r.label}</div>
              <div className="col-span-2 text-sm text-zinc-900 whitespace-pre-wrap break-words">
                {r.value ?? "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
