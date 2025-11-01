import React, { useState } from 'react';
import { mockSalary, mockEmployees } from '../../mock';
import { DollarSign, Download, Filter, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';

const PayrollPage = () => {
  const [selectedMonth, setSelectedMonth] = useState('June 2025');

  const getSalaryStatusColor = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  const handleProcessPayroll = () => {
    toast({
      title: 'Payroll Processing',
      description: 'Salary payments are being processed for all employees.',
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: 'Download Started',
      description: 'Payroll report is being generated.',
    });
  };

  const totalPayroll = mockSalary.reduce((sum, s) => sum + s.netSalary, 0);
  const paidCount = mockSalary.filter((s) => s.status === 'Paid').length;
  const pendingCount = mockSalary.filter((s) => s.status === 'Pending').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Process and manage employee salaries</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={handleProcessPayroll}>
            <Send className="w-4 h-4 mr-2" />
            Process Payroll
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-2xl font-bold text-blue-600">${totalPayroll.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Employees</p>
                <p className="text-2xl font-bold text-gray-900">{mockSalary.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{paidCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Month Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="June 2025">June 2025</SelectItem>
                <SelectItem value="May 2025">May 2025</SelectItem>
                <SelectItem value="April 2025">April 2025</SelectItem>
                <SelectItem value="March 2025">March 2025</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">Showing payroll for {selectedMonth}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Details</CardTitle>
          <CardDescription>
            Detailed breakdown of employee salaries for {selectedMonth}
          </CardDescription>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell className="font-bold text-lg">
                      ${record.netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSalaryStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default PayrollPage;