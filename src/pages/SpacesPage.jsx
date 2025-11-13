import React, { useEffect, useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../lib/api";

export default function SpacesPage() {
  const [open, setOpen] = useState({
    main: true,
    active: true,
    closed: false,
  });

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch from backend and refresh on custom "projectUpdated" events
  useEffect(() => {
    let abort = false;

    const load = async () => {
      try {
        setLoading(true);
        console.log('🔍 Loading projects from /client-onboard endpoint...');
        const res = await apiGet(`/client-onboard?page=0&size=100`);
        
        if (!res.ok) {
          console.error('❌ Response not OK:', res.status, res.statusText);
          throw new Error(`Failed to load projects: ${res.status} ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('✅ Projects loaded successfully:', data);
        
        // Handle both array response and paginated response
        const content = Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []);
        if (!abort) setProjects(content);
      } catch (e) {
        console.error("❌ Failed to load projects:", e.message);
        if (!abort) setProjects([]);
      } finally {
        if (!abort) setLoading(false);
      }
    };

    load(); // [web:54]

    // Optional: listen for app-level events to refetch (replace with your emitter if any)
    const handleProjectUpdated = () => load(); // [web:45][web:51]
    window.addEventListener("projectUpdated", handleProjectUpdated); // [web:53]

    return () => {
      abort = true; // [web:49]
      window.removeEventListener("projectUpdated", handleProjectUpdated); // [web:53]
    };
  }, []);

  // Filtering
  const activeProjects = projects.filter(
    (p) => !p.status || p.status.toLowerCase() === "active"
  ); // [web:43]
  const closedProjects = projects.filter(
    (p) => p.status && p.status.toLowerCase() === "closed"
  ); // [web:43]

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] })); // [web:52]

  if (loading) {
    return (
      <div className="text-sm text-gray-500 p-2">Loading spaces...</div>
    ); // [web:46]
  }

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
