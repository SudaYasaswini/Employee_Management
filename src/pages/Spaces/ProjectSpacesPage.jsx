import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { apiGet, apiPut } from "../../lib/api";

// Prevent flicker / jerking in React 18 StrictMode
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = React.useState(false);
  React.useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
};

export default function ProjectSpacesPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [stories, setStories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("backlog");
  const [loading, setLoading] = useState(true);

  // ─────────── LOADERS ───────────
  const loadProject = async () => {
    try {
      const res = await apiGet(`/client-onboard/${projectId}`);
      if (!res.ok) throw new Error("Failed to load project");
      setProject(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await apiGet("/employees");
      if (!res.ok) throw new Error("Failed to load employees");
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.content)
        ? data.content
        : [];
      setEmployees(list);
    } catch (e) {
      console.error(e);
    }
  };

  const loadStories = async (projectName) => {
    if (!projectName) return;
    try {
      setLoading(true);
      const res = await apiGet(`/story-table/project/${projectName}`);
      if (!res.ok) throw new Error("Failed to load stories");
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ─────────── EFFECTS ───────────
  useEffect(() => {
    if (!projectId) return;
    loadProject();
    loadEmployees();
  }, [projectId]);

  useEffect(() => {
    const name = project?.clientInfo?.projectName;
    if (name) loadStories(name);
  }, [project?.clientInfo?.projectName]);

  // ─────────── FILTERS ───────────
  const backlog = stories.filter(
    (s) => s.status === "BACKLOG" || s.status === "ASSIGNED" || s.status === "IN_PROGRESS" || s.status === "COMPLETED" || s.status === "CANCELLED"
  );
  const sprint = stories.filter((s) =>
    ["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(s.status)
  );

  // ─────────── DnD ───────────
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) return;
    try {
      await apiPut(`/story-table/${draggableId}`, { status: destination.droppableId });
      loadStories(project?.clientInfo?.projectName);
    } catch (e) {
      console.error(e);
    }
  };

  // ─────────── UI VARIANTS ───────────
  const columnStyles = {
    ASSIGNED: "bg-blue-50 border-blue-200",
    IN_PROGRESS: "bg-amber-50 border-amber-200",
    COMPLETED: "bg-green-50 border-green-200",
    CANCELLED: "bg-gray-100 border-gray-200 opacity-90",
  };

  const headerColors = {
    ASSIGNED: "text-blue-700",
    IN_PROGRESS: "text-amber-700",
    COMPLETED: "text-green-700",
    CANCELLED: "text-gray-600",
  };

  // ─────────── RENDER ───────────
  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {project?.clientInfo?.projectName || "Project"}
        </h1>
        <p className="text-gray-500 text-sm">
          {project?.clientInfo?.businessName || ""}
        </p>
      </div>

      {/* TABS */}
      <div className="flex items-center border-b mt-4">
        {["backlog", "sprint"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "backlog" ? "Backlog" : "Current Sprint"}
          </button>
        ))}
        <div className="ml-auto pr-4 text-xs text-gray-500">
          Total stories: {stories.length}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <p className="text-sm text-gray-500 mt-4">Loading stories...</p>
      ) : activeTab === "backlog" ? (
        // ─────────── BACKLOG ───────────
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {backlog.length ? (
            backlog.map((s) => (
              <div
                key={s.id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900">{s.taskName}</h3>
                <p className="text-sm text-gray-700 mt-1">
                  {s.taskDescription || "No description"}
                </p>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>Type: {s.type || "N/A"}</p>
                  <p>Priority: {s.priority || "N/A"}</p>
                  <p>Status: {s.status}</p>
                </div>

                {/* ASSIGN */}
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Assign
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={s.assignedTo !== "unassigned" ? s.assignedTo : ""}
                    onChange={async (e) => {
                      const emp = e.target.value;
                      if (!emp) return;
                      await apiPut(`/story-table/${s.id}`, {
                        assignedTo: emp,
                        status: "ASSIGNED",
                      });
                      loadStories(project?.clientInfo?.projectName);
                    }}
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option
                        key={emp.id}
                        value={`${emp.firstName} ${emp.lastName}`}
                      >
                        {emp.firstName} {emp.lastName} ({emp.empRole})
                      </option>
                    ))}
                  </select>

                  {s.assignedTo !== "unassigned" && (
                    <p className="text-xs text-green-600 mt-1">
                      Assigned to {s.assignedTo}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 mt-4">
              No backlog stories found.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* 🧩 CURRENT SPRINT */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              {["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((status) => (
                <StrictModeDroppable droppableId={status} key={status}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col rounded-xl border p-3 shadow-sm transition ${columnStyles[status]}`}
                    >
                      {/* Header */}
                      <h3
                        className={`text-sm font-semibold mb-3 uppercase ${headerColors[status]}`}
                      >
                        {status.replace("_", " ")}
                      </h3>

                      {/* Cards (no scroll, auto-expand) */}
                      <div className="space-y-3 min-h-[300px]">
                        {sprint
                          .filter((t) => t.status === status)
                          .map((story, index) => (
                            <Draggable
                              key={story.id}
                              draggableId={story.id}
                              index={index}
                            >
                              {(drag) => (
                                <div
                                  ref={drag.innerRef}
                                  {...drag.draggableProps}
                                  {...drag.dragHandleProps}
                                  className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md"
                                >
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {story.taskName}
                                  </h4>
                                  <p className="text-xs text-gray-600">
                                    {story.taskDescription || "No description"}
                                  </p>
                                  <p className="text-[11px] text-gray-500 mt-1">
                                    @{story.assignedTo}
                                  </p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </StrictModeDroppable>
              ))}
            </div>
          </DragDropContext>
        </>
      )}    
    </div>
  );
}
