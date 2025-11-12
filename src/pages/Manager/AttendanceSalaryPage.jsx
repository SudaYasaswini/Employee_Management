import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import {
  Calendar,
  Search,
  Clock,
  LogIn,
  LogOut,
  Filter,
  Home,
  Building2,
} from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
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

const api = axios.create({
  baseURL: "/", // your backend proxy or direct URL if needed
  headers: { "Content-Type": "application/json" },
});

const AttendanceAPI = {
  getAll: () => api.get("/api/attendance").then((r) => r.data),
  getByEmpId: (empId) => api.get(`/api/attendance/employee/${empId}`).then((r) => r.data),
  checkIn: (payload) => api.post("/api/attendance/checkin", payload).then((r) => r.data),
  checkOut: (id) => api.patch(`/api/attendance/checkout/${id}`).then((r) => r.data),
};

export default function AttendancePage() {
  const { user } = useAuth(); // contains name, empId, role
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workMode, setWorkMode] = useState("Office");
  const [todayRecord, setTodayRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch attendance data based on role
  const load = async () => {
    setLoading(true);
    try {
      let data = [];
      if (["Manager", "HR", "Owner"].includes(user?.role)) {
        data = await AttendanceAPI.getAll();
      } else {
        data = await AttendanceAPI.getByEmpId(user?.empId);
      }
      setRecords(data || []);

      // Identify today's record for the current user
      if (user?.empId) {
        const today = new Date().toISOString().split("T")[0];
        const found = data.find(
          (rec) => rec.empId === user.empId && rec.date === today
        );
        setTodayRecord(found || null);
      }
    } catch (e) {
      console.error("Error loading attendance", e);
      setRecords([]);
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
        workMode,
      };
      const res = await AttendanceAPI.checkIn(payload);
      alert("✅ Checked in successfully!");
      setTodayRecord(res);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Already checked in today!");
    }
  };

  const handleCheckOut = async () => {
    try {
      if (!todayRecord) return alert("No check-in found for today.");
      await AttendanceAPI.checkOut(todayRecord.id);
      alert("✅ Checked out successfully!");
      await load();
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
    <div className="p-6 space-y-6 bg-[#91aec6ff] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">
            View and manage employee attendance records
          </p>
        </div>

        {/* Check-In / Check-Out controls for Employee */}
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4 bg-[#f0f8ff] rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg">
            <div className="flex-1 relative text-black">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                className="pl-10 text-black"
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={load}>
              <Clock className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card className="border-0 bg-[#f0f8ff] shadow-2xl">
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {["Manager", "HR", "Owner"].includes(user?.role)
              ? "Full employee attendance overview"
              : "Your personal attendance history"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Manager", "HR", "Owner"].includes(user?.role) && (
                    <TableHead>Employee</TableHead>
                  )}
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Mode</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    {["Manager", "HR", "Owner"].includes(user?.role) && (
                      <TableCell className="font-medium">
                        {r.empName}
                      </TableCell>
                    )}
                    <TableCell>
                      {new Date(r.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(r.status)}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.workMode}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filtered.length === 0 && !loading && (
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
