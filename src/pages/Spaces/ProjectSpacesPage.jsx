import React, { useEffect, useState } from "react";
import StoryCard from "./StoryCard";
import AssignStoryModal from "./AssignStoryModal";
import { useParams } from "react-router-dom";

export default function ProjectSpacesPage() {
  const { projectId } = useParams();
  const [stories, setStories] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("backlog"); // ✅ track active tab
  const [project, setProject] = useState(null);

  // ✅ Load stories from mock or backend
  const load = async () => {
    try {
      const res = await fetch(`/api/stories/project/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      } else {
        throw new Error("Backend not reachable");
      }
    } catch {
      const allStories = JSON.parse(localStorage.getItem("mockStories") || "[]");
      const filtered = allStories.filter((s) => s.projectId === projectId);
      setStories(filtered);
    }
  };

  // ✅ Load project details
  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("mockProjects") || "[]");
    const proj = storedProjects.find((p) => p.id === projectId);
    setProject(proj || null);
    load();
  }, [projectId]);

  const backlog = stories.filter((s) => s.status === "BACKLOG");
  const sprint = stories.filter(
    (s) => s.status === "ASSIGNED" || s.status === "IN_PROGRESS"
  );

  return (
    <div className="p-6 space-y-6">
      {/* ---------- Header ---------- */}
      <header className="border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {project?.name || "Project"}
        </h1>
        <p className="text-gray-600 text-sm">
          {project?.description || "No description"}
        </p>
      </header>

      {/* ---------- Tabs ---------- */}
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

      {/* ---------- Tab Content ---------- */}
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

      {/* ---------- Assign Modal ---------- */}
      {assignTarget && (
        <AssignStoryModal
          story={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={load}
        />
      )}
    </div>
  );
}
