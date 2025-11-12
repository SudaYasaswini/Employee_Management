import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  Building2,
  Home,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

const AttendanceAPI = {
  getByEmpId: (empId) => api.get(`/api/attendance/employee/${empId}`).then((r) => r.data),
  checkIn: (payload) => api.post("/api/attendance/checkin", payload).then((r) => r.data),
  checkOut: (id) => api.patch(`/api/attendance/checkout/${id}`).then((r) => r.data),
};

export default function EmployeeAttendancePage() {
  const { user } = useAuth(); // { empId, name, role }
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [workMode, setWorkMode] = useState("Office");
  const [loading, setLoading] = useState(false);

  // Fetch employee attendance
  const load = async () => {
    setLoading(true);
    try {
      const data = await AttendanceAPI.getByEmpId(user?.empId);
      setRecords(data || []);

      const today = new Date().toISOString().split("T")[0];
      const found = data.find((r) => r.date === today);
      setTodayRecord(found || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.empId) load();
  }, [user]);

  const handleCheckIn = async () => {
    try {
      const payload = {
        empId: user.empId,
        empName: user.name,
        empRole: user.role,
        workMode,
      };
      await AttendanceAPI.checkIn(payload);
      toast.success("Checked in successfully!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Already checked in today!");
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!todayRecord) return toast.error("No check-in found for today.");
      await AttendanceAPI.checkOut(todayRecord.id);
      toast.success("Checked out successfully!");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Check-out failed.");
    }
  };

  const canCheckIn = !todayRecord || (todayRecord && !todayRecord.checkIn && !todayRecord.checkOut);
  const canCheckOut = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;

  // --- Analytics ---
  const presentDays = useMemo(() => records.filter((r) => r.status === "Present").length, [records]);
  const avgWorkHours = useMemo(() => {
    const valid = records.filter((r) => r.workHours);
    if (!valid.length) return 0;
    return valid.reduce((a, b) => a + b.workHours, 0) / valid.length;
  }, [records]);

  const lastCheckIn = useMemo(() => {
    if (!records.length) return null;
    const latest = [...records].sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))[0];
    return latest?.checkIn;
  }, [records]);

  const trendData = useMemo(() => {
    return records
      .slice(-10)
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString(),
        hours: r.workHours || 0,
      }));
  }, [records]);

  const getStatusColor = (status) => {
    const map = {
      Present: "bg-green-100 text-green-800 border-green-200",
      Leave: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Absent: "bg-red-100 text-red-800 border-red-200",
    };
    return map[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="p-6 bg-[#e9f3fa] min-h-screen space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600">Track your check-ins, check-outs, and work stats</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={workMode} onValueChange={setWorkMode}>
            <SelectTrigger className="w-[130px] bg-white border-gray-300 text-gray-800">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Office">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Office</span>
                </div>
              </SelectItem>
              <SelectItem value="WFH">
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>WFH</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            disabled={!canCheckIn}
            onClick={handleCheckIn}
            className={`flex items-center text-white ${canCheckIn ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Check In
          </Button>

          <Button
            disabled={!canCheckOut}
            onClick={handleCheckOut}
            className={`flex items-center text-white ${canCheckOut ? "bg-red-600 hover:bg-red-700" : "bg-gray-400"}`}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Check Out
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Days Present</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-700">{presentDays}</CardContent>
        </Card>
        <Card className="bg-white shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Avg Work Hours</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-700">{avgWorkHours.toFixed(1)} h</CardContent>
        </Card>
        <Card className="bg-white shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Last Check-In</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-semibold text-gray-800">
            {lastCheckIn ? new Date(lastCheckIn).toLocaleTimeString() : "—"}
          </CardContent>
        </Card>
      </div>

      {/* Work Hours Trend Chart */}
      <Card className="bg-white shadow-md border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <span>Recent Work Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-60">
          {trendData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">No recent data</p>
          )}
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="bg-white shadow-md border-0">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Mode</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(r.status)}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.workMode}</TableCell>
                    <TableCell>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—"}</TableCell>
                    <TableCell>{r.workHours ? `${r.workHours.toFixed(2)} h` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!records.length && !loading && (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p>No attendance records found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
