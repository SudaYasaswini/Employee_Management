import React, { useState } from "react";
import { apiPost, apiPut } from "../lib/api";

export default function AddTemplateModal({ type, field, onClose, onSave }) {
  const [form, setForm] = useState({
    taskName: field?.taskName || "",
    taskDescription: field?.taskDescription || "",
    priority: field?.priority || "MEDIUM",
    type: field?.type || type || "",
    deptName: field?.deptName || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      taskName: form.taskName,
      taskDescription: form.taskDescription,
      priority: form.priority,
      type: form.type,
      deptName: form.deptName,
    };

    try {
      const res = field
        ? await apiPut(`/field-table/${field.id}`, payload)
        : await apiPost("/field-table", payload);

      if (res.ok) {
        onSave(await res.json());
      } else {
        alert("❌ Failed to save field. Check server logs.");
      }
    } catch (error) {
      console.error("Error saving field:", error);
      alert("❌ Failed to save field. Check console for details.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900">
          {field ? "Edit Field" : "Add New Field"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-zinc-700">Task Name</label>
            <input
              name="taskName"
              value={form.taskName}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Task Description</label>
            <textarea
              name="taskDescription"
              value={form.taskDescription}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded-md px-3 py-2"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Department Name</label>
            <input
              name="deptName"
              value={form.deptName}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Type</label>
             <select
              className="w-full border rounded-md px-3 py-2"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="" disabled>Select project type</option>
              <option value="Website Development">Website Development</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="E-commerce Development">E-commerce Development</option>
              <option value="SEO Services">SEO Services</option>
              <option value="Content Creation">Content Creation</option>
              <option value="Digital Marketing">Digital Marketing</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded-md px-3 py-2"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-sm px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
