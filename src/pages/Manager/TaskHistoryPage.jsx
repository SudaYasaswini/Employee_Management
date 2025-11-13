import React, { useEffect, useMemo, useState } from 'react';
import { History, Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import apiClient from '../../lib/apiClient';

// API
const api = apiClient;

const TaskHistoryApi = {
  byStatus: (status) => api.get(`/task-history/by-status/${status}`).then(r => r.data),
};

// Optional client-only caches (priority/department) until backend supports them
const PRIORITY_KEY = 'task_priorities_v1';
const DEPT_KEY = 'task_departments_v1';
const getPriorityMap = () => {
  try { return JSON.parse(localStorage.getItem(PRIORITY_KEY) || '{}'); } catch { return {}; }
};
const getDeptMap = () => {
  try { return JSON.parse(localStorage.getItem(DEPT_KEY) || '{}'); } catch { return {}; }
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

export default function TaskHistoryPage() {
  const [rows, setRows] = useState([]); // normalized completed tasks
  const [loading, setLoading] = useState(false);

  const normalize = (list) => {
    const pMap = getPriorityMap();
    const dMap = getDeptMap();
    return (list || []).map(t => ({
      id: t.id,
      title: t.taskName,
      assignedToName: t.empName,
      department: dMap[t.id] || 'General',
      priority: pMap[t.id] || 'Medium',
      createdAt: t.createdAt || t.createdAtDateTime || t.updatedAt || t.updatedAtDateTime,
      dueDate: t.dueDate,
      status: 'Completed',
    }));
  };

  const load = async () => {
    setLoading(true);
    try {
      const completed = await TaskHistoryApi.byStatus('COMPLETED');
      setRows(normalize(completed || []));
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const completedTasks = rows;

  const stats = useMemo(() => {
    const total = completedTasks.length;
    const thisMonth = completedTasks.filter((t) => {
      if (!t.createdAt) return false;
      const d = new Date(t.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const high = completedTasks.filter((t) => t.priority === 'High' || t.priority === 'Critical').length;
    return { total, thisMonth, high };
  }, [completedTasks]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Task History</h1>
        <p className="text-gray-600 mt-1">View history of completed tasks</p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-blue-600">{stats.thisMonth}</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-red-600">{stats.high}</p>
              </div>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <History className="w-7 h-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Tasks</CardTitle>
          <CardDescription>
            Historical record of all completed tasks with details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.assignedToName}</TableCell>
                    <TableCell>{task.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {(!loading && completedTasks.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No completed tasks yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
