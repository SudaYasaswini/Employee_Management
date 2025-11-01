import React from 'react';
import { mockTasks } from '../../mock';
import { BarChart, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';

const TaskAnalyticsPage = () => {
  const tasksByStatus = {
    open: mockTasks.filter((t) => t.status === 'Open').length,
    inProgress: mockTasks.filter((t) => t.status === 'In Progress').length,
    completed: mockTasks.filter((t) => t.status === 'Completed').length
  };

  const tasksByPriority = {
    high: mockTasks.filter((t) => t.priority === 'High').length,
    medium: mockTasks.filter((t) => t.priority === 'Medium').length,
    low: mockTasks.filter((t) => t.priority === 'Low').length
  };

  const departmentTaskStats = [
    { department: 'Engineering', total: 24, completed: 18, inProgress: 4, open: 2, efficiency: 92 },
    { department: 'Sales', total: 15, completed: 10, inProgress: 3, open: 2, efficiency: 85 },
    { department: 'Marketing', total: 12, completed: 8, inProgress: 3, open: 1, efficiency: 88 },
    { department: 'Design', total: 10, completed: 7, inProgress: 2, open: 1, efficiency: 90 },
    { department: 'HR', total: 6, completed: 5, inProgress: 1, open: 0, efficiency: 95 }
  ];

  const completionRate = Math.round(
    (tasksByStatus.completed / mockTasks.length) * 100
  );

  const avgTaskDuration = '4.2 days';
  const onTimeCompletion = 87;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Task Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive task performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{mockTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Across all departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-purple-600">{avgTaskDuration}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Per task average</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On-Time %</p>
                <p className="text-2xl font-bold text-orange-600">{onTimeCompletion}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-2">Meeting deadlines</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Current status of all tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Open</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{tasksByStatus.open}</span>
                </div>
                <Progress value={(tasksByStatus.open / mockTasks.length) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">In Progress</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{tasksByStatus.inProgress}</span>
                </div>
                <Progress
                  value={(tasksByStatus.inProgress / mockTasks.length) * 100}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{tasksByStatus.completed}</span>
                </div>
                <Progress
                  value={(tasksByStatus.completed / mockTasks.length) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Priority Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">High Priority</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{tasksByPriority.high}</span>
                </div>
                <Progress value={(tasksByPriority.high / mockTasks.length) * 100} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Medium Priority</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{tasksByPriority.medium}</span>
                </div>
                <Progress
                  value={(tasksByPriority.medium / mockTasks.length) * 100}
                  className="h-2"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                    <span className="text-sm font-medium text-gray-700">Low Priority</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{tasksByPriority.low}</span>
                </div>
                <Progress value={(tasksByPriority.low / mockTasks.length) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Task Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Task Performance</CardTitle>
          <CardDescription>Task completion and efficiency by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {departmentTaskStats.map((dept) => (
              <div key={dept.department} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{dept.department}</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Completed: <strong className="text-green-600">{dept.completed}</strong>
                    </span>
                    <span className="text-gray-600">
                      In Progress: <strong className="text-yellow-600">{dept.inProgress}</strong>
                    </span>
                    <span className="text-gray-600">
                      Open: <strong className="text-blue-600">{dept.open}</strong>
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Task Efficiency</span>
                    <span className="text-sm font-medium text-gray-900">{dept.efficiency}%</span>
                  </div>
                  <Progress value={dept.efficiency} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskAnalyticsPage;