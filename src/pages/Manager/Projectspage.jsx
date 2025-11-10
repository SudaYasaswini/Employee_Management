import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Modal({ open, onClose, children }) {
  if (!open) return null; // [web:10]
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <div className="flex justify-end">
          <button
            className="text-sm px-3 py-1 rounded-md border"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await fetch(`/api/projects?page=0&size=50`); // [web:12][web:6]
      if (!res.ok) throw new Error("Failed to load projects"); // [web:12][web:6]
      const page = await res.json(); // [web:12]
      const content = Array.isArray(page?.content) ? page.content : []; // [web:18]
      setProjects(content);
    } catch (err) {
      console.error("Failed to load projects:", err); // [web:12]
      setProjects([]); // [web:6]
    } finally {
      setLoading(false); // [web:6]
    }
  };

  useEffect(() => {
    load(); // [web:18]
  }, []);

  const openDetail = async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`); // [web:12]
      if (!res.ok) return; // [web:12]
      const p = await res.json(); // [web:12]
      setSelected(p);
      setDetailOpen(true);
    } catch (err) {
      console.error("Failed to load project details", err); // [web:12]
    }
  };

  const openCreateIntake = () => {
    window.open("/client-intake", "_blank", "noopener"); // [web:10]
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-600">Loading projects...</div> // [web:6]
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Browse and manage projects</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/projects/fields")}
            className="rounded-md bg-black text-white px-4 py-2"
          >
            Fields
          </button>

          <button
            className="px-4 py-2 rounded-md bg-black text-white"
            onClick={openCreateIntake}
          >
            Create Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:shadow cursor-pointer"
            onClick={() => openDetail(p.id)}
          >
            <div className="text-lg font-semibold">{p.name}</div>
            <div className="text-sm text-zinc-700 mt-1 line-clamp-2">
              {p.description || "No description"}
            </div>
            <div className="mt-2 text-xs text-zinc-500 flex items-center justify-between">
              <span>Status: {p.status || "—"}</span>
              <span>Owner: {p.owner || "—"}</span>
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              Created:{" "}
              {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-sm text-zinc-500">
            No projects yet. Click Create Project to add one.
          </div>
        )}
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)}>
        {!selected ? (
          <div className="text-sm text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-xl font-semibold">{selected.name}</div>
            <div className="text-sm text-zinc-700 whitespace-pre-wrap">
              {selected.description || "No description"}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-zinc-500">Status:</span>{" "}
                {selected.status || "—"}
              </div>
              <div>
                <span className="text-zinc-500">Owner:</span>{" "}
                {selected.owner || "—"}
              </div>
              <div>
                <span className="text-zinc-500">Domains:</span>{" "}
                {(selected.domains || []).join(", ") || "—"}
              </div>
              <div>
                <span className="text-zinc-500">Technologies:</span>{" "}
                {(selected.technologies || []).join(", ") || "—"}
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              Created:{" "}
              {selected.createdAt
                ? new Date(selected.createdAt).toLocaleString()
                : "—"}
            </div>
            <div className="text-xs text-zinc-500">
              Updated:{" "}
              {selected.updatedAt
                ? new Date(selected.updatedAt).toLocaleString()
                : "—"}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
