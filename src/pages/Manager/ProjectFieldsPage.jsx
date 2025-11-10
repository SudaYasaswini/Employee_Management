import React, { useEffect, useState } from "react";
import AddTemplateModal from "../../components/AddTemplateModal";

export default function ProjectFieldsPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [editTemplate, setEditTemplate] = useState(null);

  // 👤 Replace with real auth later
  const userRole = "Manager"; // or "CEO", "Employee"
  const isManager = ["Manager", "CEO"].includes(userRole); // [web:12]

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true); // [web:6]
        const res = await fetch("/api/task-templates"); // [web:12]
        if (!res.ok) throw new Error("Failed to load templates"); // [web:12][web:6]
        const data = await res.json(); // [web:12]
        setTemplates(Array.isArray(data) ? data : []); // [web:23]
      } catch (e) {
        console.error("Failed to load task templates", e); // [web:12]
        setTemplates([]); // [web:6]
      } finally {
        setLoading(false); // [web:6]
      }
    };

    fetchTemplates(); // [web:23]
  }, []);

  // Group by project type
  const grouped = templates.reduce((acc, t) => {
    const key = t.type || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {}); // [web:25][web:29]

  // Modal open/close handlers
  const openAddModal = (type) => {
    setSelectedType(type);
    setEditTemplate(null);
    setShowModal(true);
  };

  const openEditModal = (template) => {
    setSelectedType(template.type);
    setEditTemplate(template);
    setShowModal(true);
  };

  // Save new or edited template (local optimistic update)
  const handleSave = (savedTemplate) => {
    setTemplates((prev) => {
      const exists = prev.find((t) => t.id === savedTemplate.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTemplate.id ? savedTemplate : t));
      } else {
        return [...prev, savedTemplate];
      }
    }); // [web:23]
    setShowModal(false);
  };

  // Delete field (backend only)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this field?")) return;
    try {
      const res = await fetch(`/api/task-templates/${id}`, { method: "DELETE" }); // [web:12]
      if (!res.ok) throw new Error("Failed to delete"); // [web:12]
      setTemplates((prev) => prev.filter((t) => t.id !== id)); // [web:23]
    } catch (e) {
      alert("Failed to delete field"); // [web:12]
    }
  };

  // Access restriction
  if (!isManager) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">Access Restricted</h2>
        <p className="text-zinc-600">
          You do not have permission to view or modify project fields.
        </p>
      </div>
    ); // [web:12]
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-600">Loading project fields...</div>
    ); // [web:6]
  }

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Project Fields</h1>
      </header>

      {/* Project Type Sections */}
      <div className="space-y-8">
        {Object.keys(grouped).map((type) => (
          <div
            key={type}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">{type}</h2>
              {isManager && (
                <button
                  onClick={() => openAddModal(type)}
                  className="text-xs px-3 py-1 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                >
                  + Add Field
                </button>
              )}
            </div>

            {grouped[type].length === 0 ? (
              <p className="text-sm text-zinc-500">No fields yet for this type.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[type].map((t) => (
                  <div
                    key={t.id}
                    className="border rounded-lg p-4 bg-zinc-50 hover:shadow-sm transition"
                  >
                    <h3 className="font-medium text-zinc-800 mb-1">{t.title}</h3>
                    <p className="text-sm text-zinc-600 mb-2 line-clamp-3">
                      {t.description}
                    </p>
                    <div className="text-xs text-zinc-500 mb-3">
                      Role: {t.defaultRole || "—"} • Hours:{" "}
                      {t.defaultEstimateHours || "—"} • {t.priority || "MEDIUM"}
                    </div>

                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        onClick={() => openEditModal(t)}
                        className="px-2 py-1 border rounded-md text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="px-2 py-1 border rounded-md text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <AddTemplateModal
          type={selectedType}
          template={editTemplate}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
