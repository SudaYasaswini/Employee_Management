import React from 'react';
import { mockAttendance } from '../../mock';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, CheckCircle, X, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const MyAttendancePage = () => {
  const { user } = useAuth();
  const myAttendance = mockAttendance.filter((a) => a.employeeId === user?.employeeId);

  const stats = {
    present: myAttendance.filter((a) => a.status === 'Present').length,
    leave: myAttendance.filter((a) => a.status === 'Leave').length,
    absent: myAttendance.filter((a) => a.status === 'Absent').length,
    totalWorkHours: myAttendance.reduce((sum, a) => sum + a.workHours, 0)
  };

  const attendanceRate = Math.round(
    (stats.present / myAttendance.length) * 100
  );

  const getAttendanceColor = (status) => {
    const colors = {
      Present: 'bg-green-100 text-green-800 border-green-200',
      Leave: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Absent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Attendance History</h1>
        <p className="text-gray-600 mt-1">View your attendance records and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Present Days</p>
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
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
                <p className="text-sm text-gray-600">Leave Days</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.leave}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">{attendanceRate}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalWorkHours}h</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>Your complete attendance history</CardDescription>
        </CardHeader>
        <CardContent>
          {myAttendance.length > 0 ? (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Work Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myAttendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getAttendanceColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell className="font-semibold">{record.workHours}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAttendancePage;