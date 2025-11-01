import React, { useState } from 'react';
import { mockAttendance, mockEmployees } from '../../mock';
import { Calendar as CalendarIcon, Download, Upload, Plus, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
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
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';

const AttendanceManagementPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getAttendanceColor = (status) => {
    const colors = {
      Present: 'bg-green-100 text-green-800 border-green-200',
      Leave: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Absent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleBulkUpload = () => {
    toast({
      title: 'Upload Initiated',
      description: 'Attendance data upload functionality will be available soon.',
    });
  };

  const handleDownload = () => {
    toast({
      title: 'Download Started',
      description: 'Attendance report is being generated.',
    });
  };

  const handleMarkAll = (status) => {
    toast({
      title: 'Bulk Update',
      description: `All employees marked as ${status} for ${selectedDate}.`,
    });
  };

  const todayStats = {
    present: mockAttendance.filter((a) => a.status === 'Present').length,
    leave: mockAttendance.filter((a) => a.status === 'Leave').length,
    absent: mockAttendance.filter((a) => a.status === 'Absent').length,
    total: mockEmployees.length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee attendance records</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleBulkUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{todayStats.present}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">{todayStats.leave}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{todayStats.absent}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">⚠</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round((todayStats.present / todayStats.total) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Selection and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={() => handleMarkAll('Present')}>
                Mark All Present
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleMarkAll('Leave')}>
                Mark All Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Records</CardTitle>
          <CardDescription>
            View and edit attendance for {new Date(selectedDate).toLocaleDateString()}
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
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell className="font-mono text-sm">{record.employeeId}</TableCell>
                    <TableCell>
                      {mockEmployees.find((e) => e.employeeId === record.employeeId)?.department}
                    </TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut}</TableCell>
                    <TableCell>{record.workHours}h</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getAttendanceColor(record.status)}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Edit
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

export default AttendanceManagementPage;