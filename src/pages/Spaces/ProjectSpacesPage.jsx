import React, { useEffect, useState } from "react";
import StoryCard from "./StoryCard";
import AssignStoryModal from "./AssignStoryModal";
import { useParams } from "react-router-dom";

export default function ProjectSpacesPage() {
  const { projectId } = useParams(); // [web:80]
  const [stories, setStories] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("backlog");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stories from backend
  const loadStories = async () => {
    try {
      setLoading(true); // [web:52]
      const res = await fetch(`/api/stories/project/${projectId}`); // [web:54]
      if (!res.ok) throw new Error("Failed to load stories"); // [web:54]
      const data = await res.json(); // [web:54]
      setStories(Array.isArray(data) ? data : []); // [web:90]
    } catch (e) {
      console.error("Failed to load stories", e); // [web:54]
      setStories([]); // [web:81]
    } finally {
      setLoading(false); // [web:52]
    }
  };

  // Load project details from backend
  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`); // [web:54]
      if (!res.ok) throw new Error("Failed to load project"); // [web:54]
      const p = await res.json(); // [web:54]
      setProject(p); // [web:52]
    } catch (e) {
      console.error("Failed to load project", e); // [web:54]
      setProject(null); // [web:81]
    }
  };

  useEffect(() => {
    if (!projectId) return; // [web:80]
    loadProject(); // [web:54]
    loadStories(); // [web:54]
  }, [projectId]); // [web:89]

  const backlog = stories.filter((s) => s.status === "BACKLOG"); // [web:85][web:90]
  const sprint = stories.filter(
    (s) => s.status === "ASSIGNED" || s.status === "IN_PROGRESS"
  ); // [web:85][web:90]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {project?.name || "Project"} {/* [web:52] */}
        </h1>
        <p className="text-gray-600 text-sm">
          {project?.description || "No description"} {/* [web:52] */}
        </p>
      </header>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "backlog"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("backlog")}
        >
          Backlog
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "sprint"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
          }`}
          onClick={() => setActiveTab("sprint")}
        >
          Current Sprint
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-gray-500 mt-4">Loading stories...</p> // [web:52]
      ) : (
        <>
          {activeTab === "backlog" && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {backlog.length ? (
                backlog.map((s) => (
                  <StoryCard
                    key={s.id}
                    story={s}
                    onAssign={() => setAssignTarget(s)}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 mt-4">
                  No backlog stories found.
                </p>
              )}
            </div>
          )}

          {activeTab === "sprint" && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {sprint.length ? (
                sprint.map((s) => <StoryCard key={s.id} story={s} />)
              ) : (
                <p className="text-sm text-gray-500 mt-4">
                  No current sprint stories.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Assign Modal */}
      {assignTarget && (
        <AssignStoryModal
          story={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={loadStories}
        />
      )}
    </div>
  );
}
