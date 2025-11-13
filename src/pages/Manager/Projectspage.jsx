import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Image, Paperclip } from "lucide-react";
import { apiGet } from "../../lib/api";
function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-end p-3 border-b">
          <button
            className="text-sm px-3 py-1 rounded-md border hover:bg-gray-100"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 pb-8">{children}</div>
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
    const res = await apiGet(`/client-onboard`);
    if (!res.ok) throw new Error("Failed to load projects");

    const data = await res.json();
    console.log("🔍 Fetched projects data:", data); // 👈 Add this line

    const content = Array.isArray(data) ? data : data?.content || [];
    setProjects(content);
  } catch (err) {
    console.error("❌ Failed to load projects:", err);
    setProjects([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    load(); // [web:18]
  }, []);

  const openDetail = async (id) => {
    try {
      const res = await apiGet(`/client-onboard/${id}`); // [web:12]
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
            <div className="text-lg font-semibold">
              {p.clientInfo?.projectName || p.projectId || "Untitled Project"}
            </div>
            <div className="text-sm text-zinc-700 mt-1 line-clamp-2">
              {p.description || "No description available"}
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
          <div className="space-y-5">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selected.clientInfo?.projectName || selected.projectId || "Untitled Project"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Business: {selected.clientInfo?.businessName || "—"}
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {selected.description || "No description provided."}
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Contact Information</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Name:</strong> {selected.contactInfo?.contactName || "—"}</p>
                <p><strong>Email:</strong> {selected.contactInfo?.contactEmail || "—"}</p>
                <p><strong>Number:</strong> {selected.contactInfo?.contactNumber || "—"}</p>
                <p><strong>Address:</strong> {selected.contactInfo?.address || "—"}</p>
              </div>
            </div>

            {/* Technical Info */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Technical Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                <p><strong>Frontend:</strong> {selected.technical?.frontend || "—"}</p>
                <p><strong>Backend:</strong> {selected.technical?.backend || "—"}</p>
                <p><strong>Database:</strong> {selected.technical?.dbChoice || "—"}</p>
                <p><strong>Hosting:</strong> {selected.technical?.hosting || "—"}</p>
                <p><strong>Frameworks:</strong> {selected.technical?.frameworks || "—"}</p>
                <p><strong>Deploy Model:</strong> {selected.technical?.deployModel || "—"}</p>
                <p><strong>Release Strategy:</strong> {selected.technical?.releaseStrategy || "—"}</p>
                <p><strong>Support SLA:</strong> {selected.technical?.supportSla || "—"}</p>
              </div>
            </div>

            {/* UI/UX */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">UI / UX</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Brand Colors:</strong> {selected.uiux?.brandColors || "—"}</p>
                <p><strong>Wireframes:</strong> {selected.uiux?.hasWireframes ? "Yes" : "No"}</p>
                <p><strong>Responsive:</strong> {selected.uiux?.responsive ? "Yes" : "No"}</p>
              </div>
            </div>

            {/* File Uploads Section */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Uploaded Files</h3>
              {selected.fileUploads && selected.fileUploads.length > 0 ? (
                <ul className="divide-y border rounded-md bg-gray-50">
                  {selected.fileUploads.map((f, idx) => {
                    // Detect file type icon
                    const isPdf = f.fileType?.includes("pdf");
                    const isImage = f.fileType?.includes("image");
                    const icon = isPdf ? (
                      <FileText className="w-5 h-5 text-red-500" />
                    ) : isImage ? (
                      <Image className="w-5 h-5 text-green-500" />
                    ) : (
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    );

                    // Fallback URL if fileUrl is missing
                    const baseUrl = "http://localhost:8083/uploads";
                    const resolvedUrl =
                      f.fileUrl && f.fileUrl.trim() !== ""
                        ? f.fileUrl
                        : `${baseUrl}/${f.fileName}`;

                    return (
                      <li
                        key={idx}
                        onClick={() => window.open(resolvedUrl, "_blank", "noopener")}
                        className="p-3 text-sm text-gray-700 flex items-center justify-between rounded-md transition hover:bg-blue-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {icon}
                          <div>
                            <p className="font-medium">{f.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {f.fileType || "Unknown type"} •{" "}
                              {(f.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">Open ↗</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No files uploaded.</p>
              )}
            </div>


            {/* Dates */}
            <div className="text-xs text-gray-500 border-t pt-2">
              <p>Created: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "—"}</p>
              <p>Updated: {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString() : "—"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
