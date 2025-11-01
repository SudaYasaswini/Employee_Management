import React from 'react';
import { mockSalary, mockEmployees } from '../../mock';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';

const SalariesOverviewPage = () => {
  const departmentSalaries = [
    { department: 'Engineering', total: 3240000, avg: 72000, count: 45, change: 8 },
    { department: 'Sales', total: 1624000, avg: 58000, count: 28, change: -2 },
    { department: 'Marketing', total: 1364000, avg: 62000, count: 22, change: 5 },
    { department: 'Design', total: 1296000, avg: 72000, count: 18, change: 3 },
    { department: 'HR', total: 780000, avg: 65000, count: 12, change: 1 },
    { department: 'Finance', total: 1125000, avg: 75000, count: 15, change: 6 }
  ];

  const totalPayroll = departmentSalaries.reduce((sum, d) => sum + d.total, 0);
  const avgSalary = Math.round(totalPayroll / departmentSalaries.reduce((sum, d) => sum + d.count, 0));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salaries Overview</h1>
        <p className="text-gray-600 mt-1">Company-wide salary analytics and trends</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Annual Payroll</p>
                <p className="text-2xl font-bold text-blue-600">${(totalPayroll / 1000000).toFixed(2)}M</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5.2% from last year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Salary</p>
                <p className="text-2xl font-bold text-green-600">${(avgSalary / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">💵</span>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +3.8% from last year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-purple-600">${(totalPayroll / 12 / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Per month breakdown</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-orange-600">{departmentSalaries.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <PieChart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Salary Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Department Salary Breakdown</CardTitle>
          <CardDescription>Total and average salaries by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {departmentSalaries.map((dept) => (
              <div key={dept.department} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{dept.department}</p>
                    <p className="text-sm text-gray-600">{dept.count} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${(dept.total / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-sm text-gray-600">Avg: ${(dept.avg / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Progress value={(dept.total / totalPayroll) * 100} className="flex-1" />
                  <span className="text-sm font-medium text-gray-700">
                    {((dept.total / totalPayroll) * 100).toFixed(1)}%
                  </span>
                  <span
                    className={`text-xs flex items-center ${
                      dept.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {dept.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(dept.change)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Employee Salaries</CardTitle>
          <CardDescription>Recent salary records from payroll</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Basic Salary</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSalary.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell className="font-mono text-sm">{record.employeeId}</TableCell>
                    <TableCell>
                      {mockEmployees.find((e) => e.employeeId === record.employeeId)?.department}
                    </TableCell>
                    <TableCell>${record.basicSalary.toLocaleString()}</TableCell>
                    <TableCell className="text-green-600">
                      +${record.allowances.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -${record.deductions.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold">
                      ${record.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>{record.month}</TableCell>
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

export default SalariesOverviewPage;