import React, { useEffect, useState } from "react";

export default function AssignStoryModal({ story, onClose, onAssigned }) {
  const [employees, setEmployees] = useState([]);
  const [assignee, setAssignee] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/employees?page=0&size=100")
      .then((r) => r.json())
      .then((page) => setEmployees(page.content || []))
      .catch(() => setEmployees([]));
  }, []);

  const assign = async () => {
  if (!assignee) return;
  setSubmitting(true);

  try {
    const emp = employees.find((e) => e.id === assignee);
    const res = await fetch(`/api/stories/${story.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assigneeId: assignee,
        assigneeName: `${emp.firstName} ${emp.lastName}`,
      }),
    });

    if (!res.ok) throw new Error("Backend not reachable");
    } catch {
      console.warn("⚠ Assigning in mock mode (no backend)");

      const mockStories = JSON.parse(localStorage.getItem("mockStories") || "[]");
      const idx = mockStories.findIndex((s) => s.id === story.id);
      if (idx !== -1) {
        const emp = employees.find((e) => e.id === assignee);
        mockStories[idx].assigneeId = assignee;
        mockStories[idx].assigneeName = `${emp.firstName} ${emp.lastName}`;
        mockStories[idx].status = "ASSIGNED";
        localStorage.setItem("mockStories", JSON.stringify(mockStories));
        console.log("✅ Story assigned (mock mode):", mockStories[idx]);
      }
   }

    setSubmitting(false);
    onAssigned();
    onClose();
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
        >
          <option value="">Select employee</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.empId} — {e.firstName} {e.lastName}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded-md">
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
