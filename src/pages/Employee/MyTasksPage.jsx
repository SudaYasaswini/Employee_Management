import React, { useState } from 'react';
import { mockTasks } from '../../mock';
import { useAuth } from '../../contexts/AuthContext';
import { ClipboardList, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const MyTasksPage = () => {
  const { user } = useAuth();
  const myTasks = mockTasks.filter((task) => task.assignedTo === user?.employeeId);

  const openTasks = myTasks.filter((t) => t.status === 'Open');
  const inProgressTasks = myTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed');

  const getStatusColor = (status) => {
    const colors = {
      Open: 'bg-blue-100 text-blue-800 border-blue-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Completed: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-gray-100 text-gray-800 border-gray-200',
      Medium: 'bg-blue-100 text-blue-800 border-blue-200',
      High: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const TaskCard = ({ task }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-4">{task.description}</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-900">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">Assigned by: {task.assignedByName}</span>
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600 mt-1">View and manage your assigned tasks</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{openTasks.length}</p>
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
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">{inProgressTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="open">Open ({openTasks.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {openTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {openTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No open tasks</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {inProgressTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No tasks in progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No completed tasks yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTasksPage;
