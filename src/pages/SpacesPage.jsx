import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SpacesPage() {
  const [open, setOpen] = useState({
    main: true,
    active: true,
    closed: false,
  });

  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("mockProjects") || "[]");
    console.log("📦 Loaded mock projects:", stored);
    setProjects(stored);

    const refresh = () => {
      const updated = JSON.parse(localStorage.getItem("mockProjects") || "[]");
      console.log("🔄 Refreshed mock projects:", updated);
      setProjects(updated);
    };

    window.addEventListener("mockProjectCreated", refresh);
    return () => window.removeEventListener("mockProjectCreated", refresh);
  }, []);

  // ✅ Robust filtering
  const activeProjects = projects.filter(
    (p) => !p.status || p.status.toLowerCase() === "active"
  );
  const closedProjects = projects.filter(
    (p) => p.status && p.status.toLowerCase() === "closed"
  );

  const toggle = (key) => setOpen((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="text-sm text-gray-800">
      {/* Main Spaces Toggle */}
      <div
        onClick={() => toggle("main")}
        className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100"
      >
        <span className="font-medium">Spaces</span>
        {open.main ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>

      {open.main && (
        <div className="ml-3 mt-1 space-y-2">
          {/* Active Projects */}
          <div
            onClick={() => toggle("active")}
            className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-50"
          >
            <span className="font-medium">Active</span>
            {open.active ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {open.active && (
            <div className="ml-4 border-l border-gray-200 pl-2">
              {activeProjects.length ? (
                activeProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/spaces/${p.id}`)}
                    className="p-1 rounded text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    • {p.name}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 ml-2">No active projects</p>
              )}
            </div>
          )}

          {/* Closed Projects */}
          <div
            onClick={() => toggle("closed")}
            className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-50"
          >
            <span className="font-medium">Closed</span>
            {open.closed ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {open.closed && (
            <div className="ml-4 border-l border-gray-200 pl-2">
              {closedProjects.length ? (
                closedProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/spaces/${p.id}`)}
                    className="p-1 rounded text-gray-700 cursor-pointer hover:bg-gray-100"
                  >
                    • {p.name}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 ml-2">No closed projects</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
