import React from 'react';
import { Building, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const DepartmentReportsPage = () => {
  const departments = [
    {
      id: 1,
      name: 'Engineering',
      head: 'John Smith',
      employees: 45,
      budget: 320000,
      utilized: 285000,
      productivity: 92,
      tasksCompleted: 156,
      avgSalary: 72000
    },
    {
      id: 2,
      name: 'Sales',
      head: 'Robert Brown',
      employees: 28,
      budget: 180000,
      utilized: 168000,
      productivity: 88,
      tasksCompleted: 89,
      avgSalary: 58000
    },
    {
      id: 3,
      name: 'Marketing',
      head: 'Lisa Anderson',
      employees: 22,
      budget: 150000,
      utilized: 142000,
      productivity: 85,
      tasksCompleted: 67,
      avgSalary: 62000
    },
    {
      id: 4,
      name: 'Design',
      head: 'Maria Garcia',
      employees: 18,
      budget: 140000,
      utilized: 128000,
      productivity: 87,
      tasksCompleted: 54,
      avgSalary: 72000
    },
    {
      id: 5,
      name: 'HR',
      head: 'Sarah Johnson',
      employees: 12,
      budget: 95000,
      utilized: 89000,
      productivity: 90,
      tasksCompleted: 42,
      avgSalary: 65000
    },
    {
      id: 6,
      name: 'Finance',
      head: 'Michael Chen',
      employees: 15,
      budget: 120000,
      utilized: 115000,
      productivity: 94,
      tasksCompleted: 38,
      avgSalary: 75000
    }
  ];

  const totalEmployees = departments.reduce((sum, d) => sum + d.employees, 0);
  const totalBudget = departments.reduce((sum, d) => sum + d.budget, 0);
  const totalUtilized = departments.reduce((sum, d) => sum + d.utilized, 0);
  const avgProductivity = Math.round(
    departments.reduce((sum, d) => sum + d.productivity, 0) / departments.length
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Department Reports</h1>
        <p className="text-gray-600 mt-1">Comprehensive analysis of all departments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold text-blue-600">{departments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-green-600">{totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Utilization</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((totalUtilized / totalBudget) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Productivity</p>
                <p className="text-2xl font-bold text-orange-600">{avgProductivity}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{dept.name}</span>
                <Building className="w-5 h-5 text-blue-600" />
              </CardTitle>
              <CardDescription>Head: {dept.head}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Employees</p>
                    <p className="text-2xl font-bold text-gray-900">{dept.employees}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tasks Completed</p>
                    <p className="text-2xl font-bold text-green-600">{dept.tasksCompleted}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Budget Utilization</p>
                    <p className="text-sm font-medium text-gray-900">
                      ${dept.utilized.toLocaleString()} / ${dept.budget.toLocaleString()}
                    </p>
                  </div>
                  <Progress
                    value={(dept.utilized / dept.budget) * 100}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Productivity Score</p>
                    <p className="text-sm font-medium text-gray-900">{dept.productivity}%</p>
                  </div>
                  <Progress value={dept.productivity} className="h-2" />
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Average Salary</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${dept.avgSalary.toLocaleString()}/year
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Department Metrics</CardTitle>
          <CardDescription>Comprehensive comparison across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Utilized</TableHead>
                  <TableHead>Productivity</TableHead>
                  <TableHead>Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.head}</TableCell>
                    <TableCell>{dept.employees}</TableCell>
                    <TableCell>${dept.budget.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">
                      ${dept.utilized.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={dept.productivity} className="w-16" />
                        <span className="text-sm font-medium">{dept.productivity}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{dept.tasksCompleted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentReportsPage;