import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import mockProjects from "../../mock/projects.json"; // ✅ mock fallback

// Simple modal for project details
function Modal({ open, onClose, children }) {
  if (!open) return null;
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
  const [useMockData, setUseMockData] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Try to load projects from backend, fallback to mock if not available
  const load = async () => {
  console.log("🔍 Loading projects...");

    try {
      const res = await fetch(`/api/projects?page=0&size=50`);

      // Force an error if backend not running or not returning 200
      if (!res.ok) throw new Error("Backend not reachable");

      const page = await res.json();
      const content = Array.isArray(page?.content) ? page.content : [];
      console.log("✅ Loaded backend projects:", content);
      if (content.length === 0) throw new Error("Empty backend response");

      setProjects(content);
      setUseMockData(false); // ✅ Backend working
    } catch (err) {
      console.warn("⚠ Falling back to mock projects:", err.message);
      const storedMock = JSON.parse(localStorage.getItem("mockProjects") || "[]");

      if (storedMock.length > 0) {
        console.log("✅ Loaded mock projects:", storedMock);
        setProjects(storedMock);
        setUseMockData(true); // ✅ Mark mock mode
      } else {
        console.log("❌ No mock projects found");
        setProjects([]); // avoid infinite loading
        setUseMockData(true);
      }
    } finally {
      setLoading(false); // ✅ Always stop loading
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (id) => {
    if (useMockData) {
      const p = projects.find((x) => x.id === id);
      setSelected(p);
      setDetailOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) return;
      const p = await res.json();
      setSelected(p);
      setDetailOpen(true);
    } catch (err) {
      console.error("Failed to load project details");
    }
  };

  const openCreateIntake = () => {
    window.open("/client-intake", "_blank", "noopener");
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-zinc-600">Loading projects...</div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">
            Browse and manage projects
          </p>
          {useMockData && (
            <p className="text-xs text-amber-600 mt-1 font-medium">
              ⚠ Backend not detected — displaying mock projects
            </p>
          )}
        </div>

        {/* Button group */}
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

      {/* Projects grid */}
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
              {p.createdAt
                ? new Date(p.createdAt).toLocaleString()
                : "—"}
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="text-sm text-zinc-500">
            No projects yet. Click Create Project to add one.
          </div>
        )}
      </div>

      {/* Project details modal */}
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
