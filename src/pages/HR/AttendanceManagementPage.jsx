import React, { useEffect, useState, useMemo } from "react";
import apiClient from "../../lib/apiClient";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Search,
  LogIn,
  LogOut,
  Building2,
  Home,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

const api = apiClient;

const AttendanceAPI = {
  getAll: (date) =>
    api.get(`/attendance${date ? `?date=${date}` : ""}`).then((r) => r.data),
  getByEmpId: (empId, date) =>
    api.get(`/attendance/employee/${empId}${date ? `?date=${date}` : ""}`).then((r) => r.data),
  checkIn: (payload) => api.post("/attendance/checkin", payload).then((r) => r.data),
  checkOut: (id) => api.patch(`/attendance/checkout/${id}`).then((r) => r.data),
};

export default function AttendanceManagementPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [workMode, setWorkMode] = useState("Office");
  const [todayRecord, setTodayRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isManagerView = ["HR", "Manager", "Owner"].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      let data = [];
      if (isManagerView) {
        data = await AttendanceAPI.getAll(selectedDate);
      } else {
        data = await AttendanceAPI.getByEmpId(user.empId, selectedDate);
      }
      setRecords(data || []);

      if (user?.empId) {
        const today = new Date().toISOString().split("T")[0];
        const found = data.find(
          (rec) => rec.empId === user.empId && rec.date === today
        );
        setTodayRecord(found || null);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [selectedDate, user]);

  const handleCheckIn = async () => {
    try {
      const payload = {
        empId: user.empId,
        empName: user.name,
        workMode,
      };
      await AttendanceAPI.checkIn(payload);
      alert("✅ Checked in successfully!");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Already checked in today!");
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!todayRecord) return alert("No check-in found for today.");
      await AttendanceAPI.checkOut(todayRecord.id);
      alert("✅ Checked out successfully!");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed.");
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        !q ||
        r.empName.toLowerCase().includes(q) ||
        String(r.empId).toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  // Summary cards (for HR/Manager)
  const summary = useMemo(() => {
    const total = filtered.length;
    const present = filtered.filter((r) => r.status === "Present").length;
    const leave = filtered.filter((r) => r.status === "Leave").length;
    const absent = filtered.filter((r) => r.status === "Absent").length;
    const rate = total ? Math.round((present / total) * 100) : 0;
    return { total, present, leave, absent, rate };
  }, [filtered]);

  const getStatusColor = (status) => {
    const colors = {
      Present: "bg-green-100 text-green-800 border-green-200",
      Leave: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Absent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const canCheckIn =
    !todayRecord ||
    (todayRecord && !todayRecord.checkIn && !todayRecord.checkOut);
  const canCheckOut =
    todayRecord && todayRecord.checkIn && !todayRecord.checkOut;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Management
          </h1>
          <p className="text-gray-600">
            Track and manage employee attendance records
          </p>
        </div>

        {user?.role === "Employee" && (
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
              className={`flex items-center text-white ${
                canCheckIn ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
              }`}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Check In
            </Button>

            <Button
              disabled={!canCheckOut}
              onClick={handleCheckOut}
              className={`flex items-center text-white ${
                canCheckOut ? "bg-red-600 hover:bg-red-700" : "bg-gray-400"
              }`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Check Out
            </Button>
          </div>
        )}
      </div>

      {/* Summary cards */}
      {isManagerView && (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {summary.present}
                </p>
              </div>
              <CheckCircle className="text-green-500 w-8 h-8" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {summary.leave}
                </p>
              </div>
              <Calendar className="text-yellow-500 w-8 h-8" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {summary.absent}
                </p>
              </div>
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </CardContent>
          </Card>
          <Card className="xl:col-span-2">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-gray-600">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.rate}%
                </p>
              </div>
              <BarChart3 className="text-blue-500 w-8 h-8" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date Picker + Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <Button onClick={load} variant="outline">
            Refresh
          </Button>
        </div>

        <div className="flex items-center relative">
          <Search className="absolute left-3 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Daily Attendance Records</CardTitle>
          <CardDescription>
            View and edit attendance for {new Date(selectedDate).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  {isManagerView && <TableHead>Employee</TableHead>}
                  {isManagerView && <TableHead>Employee ID</TableHead>}
                  {isManagerView && <TableHead>Department</TableHead>}
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Mode</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    {isManagerView && <TableCell>{r.empName}</TableCell>}
                    {isManagerView && <TableCell>{r.empId}</TableCell>}
                    {isManagerView && <TableCell>{r.department || "—"}</TableCell>}
                    <TableCell>
                      {r.checkIn
                        ? new Date(r.checkIn).toLocaleTimeString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {r.checkOut
                        ? new Date(r.checkOut).toLocaleTimeString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {r.workHours ? `${r.workHours.toFixed(2)} h` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(r.status)}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.workMode || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p>No records found for selected date</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
