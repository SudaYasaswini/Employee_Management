import React, { useEffect, useState } from "react";

export default function AssignStoryModal({ story, onClose, onAssigned }) {
  const [employees, setEmployees] = useState([]);
  const [assignee, setAssignee] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load employees from backend
  useEffect(() => {
    let abort = false;

    const load = async () => {
      try {
        setLoading(true); // [web:46]
        const res = await fetch("/api/employees?page=0&size=100"); // [web:59]
        if (!res.ok) throw new Error("Failed to load employees"); // [web:60]
        const page = await res.json(); // [web:59]
        const content = Array.isArray(page?.content) ? page.content : []; // [web:59]
        if (!abort) setEmployees(content); // [web:49]
      } catch (e) {
        console.error("Failed to load employees", e); // [web:20]
        if (!abort) setEmployees([]); // [web:58]
      } finally {
        if (!abort) setLoading(false); // [web:46]
      }
    };

    load(); // [web:59]
    return () => {
      abort = true; // [web:49]
    };
  }, []);

  const assign = async () => {
    if (!assignee) return;
    setSubmitting(true);

    try {
      const emp = employees.find((e) => e.id === assignee); // [web:59]
      const res = await fetch(`/api/stories/${story.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assigneeId: assignee,
          assigneeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
        }),
      }); // [web:57][web:59]

      if (!res.ok) throw new Error("Failed to assign"); // [web:60]
      onAssigned && onAssigned(); // [web:59]
      onClose && onClose(); // [web:59]
    } catch (e) {
      console.error("Failed to assign story", e); // [web:20]
      alert("Failed to assign story. Please try again."); // [web:63]
    } finally {
      setSubmitting(false); // [web:59]
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-xl w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-3">Assign Story</h3>
        <p className="text-sm text-gray-600 mb-4">{story.title}</p>

        <select
          className="w-full border rounded-md p-2 mb-4"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          disabled={loading || submitting}
        >
          <option value="">{loading ? "Loading employees..." : "Select employee"}</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.empId} — {e.firstName} {e.lastName}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded-md" disabled={submitting}>
            Cancel
          </button>
          <button
            onClick={assign}
            disabled={!assignee || submitting}
            className="px-3 py-1 rounded-md bg-blue-600 text-white"
          >
            {submitting ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
