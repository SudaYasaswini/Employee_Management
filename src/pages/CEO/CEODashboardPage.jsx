import React from 'react';
import { mockCompanyStats, mockEmployees, mockTasks } from '../../mock';
import {
  Users,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Calendar,
  Building,
  Award,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';

const CEODashboardPage = () => {
  const departmentData = [
    { name: 'Engineering', employees: 45, budget: 320000, performance: 92 },
    { name: 'Sales', employees: 28, budget: 180000, performance: 88 },
    { name: 'Marketing', employees: 22, budget: 150000, performance: 85 },
    { name: 'HR', employees: 12, budget: 95000, performance: 90 },
    { name: 'Design', employees: 18, budget: 140000, performance: 87 },
    { name: 'Finance', employees: 15, budget: 120000, performance: 94 }
  ];

  const recentActivities = [
    { id: 1, activity: 'Q2 Financial Report Approved', time: '2 hours ago', type: 'success' },
    { id: 2, activity: 'New Project Initiative Started', time: '5 hours ago', type: 'info' },
    { id: 3, activity: 'Department Budget Review Completed', time: '1 day ago', type: 'success' },
    { id: 4, activity: 'Performance Reviews In Progress', time: '2 days ago', type: 'warning' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600 mt-1">Company-wide metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Total Employees</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{mockCompanyStats.totalEmployees}</p>
            <p className="text-xs text-green-600 mt-2">+12% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Active Tasks</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{mockCompanyStats.activeTasks}</p>
            <p className="text-xs text-green-600 mt-2">234 completed this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Monthly Payroll</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${(mockCompanyStats.monthlyPayroll / 1000).toFixed(0)}K
            </p>
            <p className="text-xs text-gray-600 mt-2">Across {mockCompanyStats.departments} departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Attendance</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{mockCompanyStats.avgAttendance}%</p>
            <p className="text-xs text-green-600 mt-2">+2.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Department Overview
            </CardTitle>
            <CardDescription>Performance and headcount by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{dept.name}</p>
                      <p className="text-sm text-gray-600">{dept.employees} employees</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">${(dept.budget / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-gray-600">Budget</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={dept.performance} className="flex-1" />
                    <span className="text-sm font-medium text-gray-700">{dept.performance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest company-wide updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      activity.type === 'success'
                        ? 'bg-green-500'
                        : activity.type === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{mockCompanyStats.presentToday}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Leaves</p>
                <p className="text-2xl font-bold text-yellow-600">{mockCompanyStats.pendingLeaves}</p>
              </div>
              <ClipboardList className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{mockCompanyStats.completedTasks}</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{mockCompanyStats.departments}</p>
              </div>
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CEODashboardPage;