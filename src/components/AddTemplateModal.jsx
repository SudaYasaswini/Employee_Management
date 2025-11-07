import React, { useState } from "react";

export default function AddTemplateModal({ type, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    defaultRole: "",
    defaultEstimateHours: "",
    priority: "MEDIUM",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      type,
      defaultEstimateHours: parseInt(form.defaultEstimateHours || 0, 10),
      tags: [],
    };

    const res = await fetch("/api/task-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSave(await res.json()); // updates parent UI
    } else {
      alert("Failed to add template");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-zinc-900">
          Add New Feature Template
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-zinc-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded-md px-3 py-2"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-zinc-700">Default Role</label>
              <input
                name="defaultRole"
                value={form.defaultRole}
                onChange={handleChange}
                className="w-full border border-zinc-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">Est. Hours</label>
              <input
                type="number"
                name="defaultEstimateHours"
                value={form.defaultEstimateHours}
                onChange={handleChange}
                className="w-full border border-zinc-300 rounded-md px-3 py-2"
              />
            </div>
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
