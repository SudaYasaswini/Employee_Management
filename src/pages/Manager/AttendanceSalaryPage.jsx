import React, { useState } from 'react';
import { mockAttendance, mockSalary, mockEmployees } from '../../mock';
import { Calendar, DollarSign, Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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

const AttendanceSalaryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');

  const employees = mockEmployees.filter((emp) => emp.role === 'Employee');

  const filteredAttendance = mockAttendance.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesEmployee =
      selectedEmployee === 'all' || record.employeeId === selectedEmployee;
    return matchesSearch && matchesEmployee;
  });

  const filteredSalary = mockSalary.filter((record) => {
    const matchesSearch = record.employeeName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesEmployee =
      selectedEmployee === 'all' || record.employeeId === selectedEmployee;
    return matchesSearch && matchesEmployee;
  });

  const getAttendanceColor = (status) => {
    const colors = {
      Present: 'bg-green-100 text-green-800 border-green-200',
      Leave: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Absent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSalaryStatusColor = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <div className="p-6 space-y-6 bg-[#91aec6ff] ">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance & Salary</h1>
        <p className="text-gray-600 mt-1">
          View and manage employee attendance records and salary information
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 bg-[#f0f8ff] rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg ">
            <div className="flex-1 relative border-black text-black">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
              <Input
                className="pl-10 text-black"
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                
              />
            </div>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.employeeId}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#f0f8ff]">
          <TabsTrigger value="attendance" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="salary" className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Salary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <Card className="border-0 bg-[#f0f8ff] shadow-2xl">
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                View employee attendance history and work hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Work Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.employeeName}
                        </TableCell>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getAttendanceColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>{record.workHours}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="bg-[#f0f8ff] rounded-2xl shadow-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>
                View employee salary details and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Month</TableHead>
                      <TableHead>Basic Salary</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSalary.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.employeeName}
                        </TableCell>
                        <TableCell>{record.month}</TableCell>
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
                        <TableCell>
                          <Badge variant="outline" className={getSalaryStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceSalaryPage;
