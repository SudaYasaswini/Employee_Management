import React, { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Search, Filter, Eye } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import axios from 'axios';

// API
const api = axios.create({
  baseURL: '/', // Use Vite proxy to 8083 or set to 'http://localhost:8083'
  headers: { 'Content-Type': 'application/json' },
});

const TaskHistoryApi = {
  list: (page = 0, size = 200) => api.get(`/api/task-history?page=${page}&size=${size}`).then(r => r.data),
};

// Client-only priority/department (until backend supports them)
const PRIORITY_KEY = 'task_priorities_v1';
const DEPT_KEY = 'task_departments_v1';
const getPriorityMap = () => {
  try { return JSON.parse(localStorage.getItem(PRIORITY_KEY) || '{}'); } catch { return {}; }
};
const getDeptMap = () => {
  try { return JSON.parse(localStorage.getItem(DEPT_KEY) || '{}'); } catch { return {}; }
};

// Map backend statuses to UI labels/colors used in your page
const uiStatusFromBackend = (status) => {
  switch (status) {
    case 'ASSIGNED': return 'Open';
    case 'PENDING': return 'In Progress';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return status || 'Open';
  }
};

const backendStatusBuckets = ['ASSIGNED', 'PENDING', 'COMPLETED', 'CANCELLED'];

const getStatusColor = (uiStatus) => {
  const colors = {
    Open: 'bg-blue-100 text-blue-800 border-blue-200',
    'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Completed: 'bg-green-100 text-green-800 border-green-200',
    Cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[uiStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getPriorityColor = (priority) => {
  const colors = {
    Low: 'bg-gray-100 text-gray-800 border-gray-200',
    Medium: 'bg-blue-100 text-blue-800 border-blue-200',
    High: 'bg-red-100 text-red-800 border-red-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function AllTasksPage() {
  const [tasks, setTasks] = useState([]);      // normalized UI tasks
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');     // Open | In Progress | Completed | Cancelled
  const [priorityFilter, setPriorityFilter] = useState('all'); // Low | Medium | High | Critical

  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const normalize = (rows) => {
    const pMap = getPriorityMap();
    const dMap = getDeptMap();
    return (rows || []).map(t => {
      const uiStatus = uiStatusFromBackend(t.status);
      const uiPriority = pMap[t.id] || 'Medium';
      const uiDepartment = dMap[t.id] || 'General';
      // Compose a title/description for UI from backend fields
      return {
        id: t.id,
        title: t.taskName,
        description: t.taskDescription,
        uiStatus,
        uiPriority,
        assignedToName: t.empName,
        assignedByName: t.taskAssignedBy,
        department: uiDepartment,
        dueDate: t.dueDate,
        createdAt: t.createdAt || t.createdAtDateTime || t.updatedAt || t.updatedAtDateTime,
        progress: uiStatus === 'Completed' ? 100 : uiStatus === 'In Progress' ? 50 : 0,
        // keep original for details
        _raw: t,
      };
    });
  };

  const load = async (p = 0) => {
    setLoading(true);
    try {
      const page = await TaskHistoryApi.list(p, 500);
      setTasks(normalize(page?.content || []));
    } catch (e) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0);
  }, []);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        !q ||
        (task.title || '').toLowerCase().includes(q) ||
        (task.assignedToName || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || task.uiStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.uiPriority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const open = tasks.filter(t => t.uiStatus === 'Open').length;
    const inProgress = tasks.filter(t => t.uiStatus === 'In Progress').length;
    const completed = tasks.filter(t => t.uiStatus === 'Completed').length;
    return { total, open, inProgress, completed };
  }, [tasks]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
        <p className="text-gray-600 mt-1">View and manage all assigned tasks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.open}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tasks or employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedTask(task) || setDialogOpen(true)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Badge variant="outline" className={getPriorityColor(task.uiPriority)}>
                    {task.uiPriority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(task.uiStatus)}>
                    {task.uiStatus}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Assigned to: <strong>{task.assignedToName}</strong></span>
                  <span>Department: <strong>{task.department}</strong></span>
                  <span>Due: <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</strong></span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Progress value={task.progress} className="w-24" />
                    <span className="text-sm font-medium text-gray-700">{task.progress}%</span>
                  </div>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>Complete information about the task</DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h3>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getStatusColor(selectedTask.uiStatus)}>
                  {selectedTask.uiStatus}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(selectedTask.uiPriority)}>
                  {selectedTask.uiPriority} Priority
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned To</label>
                  <p className="mt-1 text-gray-900">{selectedTask.assignedToName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned By</label>
                  <p className="mt-1 text-gray-900">{selectedTask.assignedByName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="mt-1 text-gray-900">{selectedTask.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="mt-1 text-gray-900">
                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-gray-900">
                    {selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Progress</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Progress value={selectedTask.progress} className="flex-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {selectedTask.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
