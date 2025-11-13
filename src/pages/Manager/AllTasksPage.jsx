import React, { useEffect, useState } from "react";
import apiClient from "../../lib/apiClient";
import {
  ClipboardList,
  Search,
  Edit,
  X,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { toast } from "../../hooks/use-toast";
import { motion } from "framer-motion";

// Use centralized API client
const api = apiClient;

export default function AllTasksPage() {
  const [stories, setStories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    priority: "all",
  });

  const statuses = [
    "BACKLOG",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];

  const priorities = ["LOW", "MEDIUM", "HIGH"];

  // Badge color styles for priority only
  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "LOW":
        return "bg-green-100 text-green-700 border-green-300";
      case "CANCELLED":
        return "bg-gray-200 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const badgeColors = {
    BACKLOG: "bg-gray-100 text-gray-700 border-gray-200",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
    COMPLETED: "bg-green-100 text-green-700 border-green-200",
    CANCELLED: "bg-gray-200 text-gray-700 border-gray-300",
  };

  // Fetch stories
  const loadStories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/story-table");
      setStories(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast({
        title: "Error loading stories",
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(Array.isArray(res.data) ? res.data : res.data?.content || []);
    } catch (e) {
      console.error("Failed to load employees", e);
    }
  };

  useEffect(() => {
    loadStories();
    loadEmployees();
  }, []);

  const handleUpdate = async (id, field, value) => {
    try {
      const story = stories.find((s) => s.id === id);
      if (!story) return;
      const updated = { ...story, [field]: value };

      await api.put(`/story-table/${id}`, updated);
      toast({
        title: "Story Updated",
        description: `${field} updated successfully.`,
      });

      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
      );
    } catch (err) {
      toast({
        title: "Update failed",
        description:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message,
      });
    }
  };

  // Filters
  const filteredStories = stories.filter((s) => {
    const matchSearch =
      !filters.search ||
      s.taskName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.assignedTo?.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.project?.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus =
      filters.status === "all" ||
      s.status?.toUpperCase() === filters.status.toUpperCase();
    const matchPriority =
      filters.priority === "all" ||
      s.priority?.toUpperCase() === filters.priority.toUpperCase();
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-blue-600" /> All Stories
        </h1>
        <p className="text-gray-600 mt-1">
          View, filter, and edit all stories across projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search stories, employees or projects..."
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value }))
            }
            className="pl-9 w-72"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        >
          <SelectTrigger className="w-40 bg-white border border-gray-200 shadow-sm">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border border-gray-200 rounded-md">
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={(v) => setFilters((f) => ({ ...f, priority: v }))}
        >
          <SelectTrigger className="w-40 bg-white border border-gray-200 shadow-sm">
            <SelectValue placeholder="Filter by Priority" />
          </SelectTrigger>
          <SelectContent className="bg-white shadow-lg border border-gray-200 rounded-md">
            <SelectItem value="all">All Priority</SelectItem>
            {priorities.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() =>
            setFilters({ search: "", status: "all", priority: "all" })
          }
        >
          Reset Filters
        </Button>
      </div>

      {/* Stories Grid */}
      {loading ? (
        <p className="text-gray-500">Loading stories...</p>
      ) : filteredStories.length === 0 ? (
        <p className="text-gray-500 mt-4">No stories found.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {story.taskName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {story.taskDescription || "No description"}
                      </p>
                    </div>
                    <Edit
                      className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-pointer"
                      onClick={() =>
                        setEditingId(editingId === story.id ? null : story.id)
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <Badge
                      variant="outline"
                      className={`${badgeColors[story.status] || ""}`}
                    >
                      {story.status}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(story.priority)}
                    >
                      {story.priority || "N/A"}
                    </Badge>
                  </div>

                  {/* Editable Mode */}
                  {editingId === story.id ? (
                    <div className="space-y-3 border-t pt-3">
                      {/* Assigned To */}
                      <div>
                        <label className="text-xs text-gray-500">
                          Assigned To
                        </label>
                        <Select
                          value={story.assignedTo}
                          onValueChange={(v) =>
                            handleUpdate(story.id, "assignedTo", v)
                          }
                        >
                          <SelectTrigger className="bg-white border border-gray-200 shadow-sm">
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-md border border-gray-200 rounded-md">
                            {employees.map((emp) => (
                              <SelectItem
                                key={emp.id}
                                value={`${emp.firstName} ${emp.lastName}`}
                              >
                                {emp.firstName} {emp.lastName} ({emp.empRole})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-xs text-gray-500">Status</label>
                        <Select
                          value={story.status}
                          onValueChange={(v) =>
                            handleUpdate(story.id, "status", v)
                          }
                        >
                          <SelectTrigger className="bg-white border border-gray-200 shadow-sm">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-md border border-gray-200 rounded-md">
                            {statuses.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="text-xs text-gray-500">Priority</label>
                        <Select
                          value={story.priority}
                          onValueChange={(v) =>
                            handleUpdate(story.id, "priority", v)
                          }
                        >
                          <SelectTrigger className="bg-white border border-gray-200 shadow-sm">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-white shadow-md border border-gray-200 rounded-md">
                            {priorities.map((p) => (
                              <SelectItem key={p} value={p}>
                                {p}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="mt-1"
                        >
                          <X className="w-4 h-4 mr-1" /> Close
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm text-gray-700">
                      <p>
                        <strong>Assigned To:</strong>{" "}
                        {story.assignedTo || "Unassigned"}
                      </p>
                      <p>
                        <strong>Project:</strong> {story.project || "—"}
                      </p>
                      <p>
                        <strong>Department:</strong> {story.department || "—"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
