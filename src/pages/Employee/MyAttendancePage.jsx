// src/pages/Employee/MyAttendancePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import LeaveRequestModal from "./LeaveRequestModal";

import {
  Calendar,
  LogIn,
  LogOut,
  Home,
  Building2,
  Clock,
  Plus,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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

// ===============================
// API CONFIG
// ===============================
const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

const AttendanceAPI = {
  getByEmpId: (empId) => api.get(`/api/attendance/employee/${empId}`).then((r) => r.data),
  checkIn: (payload) => api.post("/api/attendance/checkin", payload).then((r) => r.data),
  checkOut: (id) =>
  api.patch(`/api/attendance/checkout/${id}`, {
    checkOut: new Date().toISOString(),
    status: "Present"
  }).then((r) => r.data),

};

// ===============================
// MAIN COMPONENT
// ===============================
export default function MyAttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [workMode, setWorkMode] = useState("Office");
  const [todayRecord, setTodayRecord] = useState(null);

  // ⭐ Leave Request Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // ===============================
  // LOAD DATA
  // ===============================
  const load = async () => {
    if (!user?.empId) return;

    setLoading(true);
    try {
      const data = await AttendanceAPI.getByEmpId(user.empId);
      setRecords(data || []);

      const today = new Date().toISOString().split("T")[0];
      const todayRec = data.find((r) => r.date === today);
      setTodayRecord(todayRec || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  // ===============================
  // ACTIONS
  // ===============================
  const handleCheckIn = async () => {
  try {
    const now = new Date();

    const payload = {
      empId: user.empId,
      empName: user.name,
      date: now.toISOString().split("T")[0],   // yyyy-MM-dd
      checkIn: now.toISOString(),              // LocalDateTime
      workMode,
      status: "Present",
      empRole: user.role,                      // Add employee role
    };

    await AttendanceAPI.checkIn(payload);
    alert("Checked in successfully!");
    load();
  } catch (err) {
    alert(err.response?.data?.message || "Check-in failed");
  }
};


  const handleCheckOut = async () => {
  if (!todayRecord) {
    return alert("No check-in found for today.");
  }

  try {
    await AttendanceAPI.checkOut(todayRecord.id);
    alert("Checked out successfully!");
    load();
  } catch (err) {
    alert(err.response?.data?.message || "Check-out failed");
  }
};


  // ===============================
  // CONDITIONS
  // ===============================
  const canCheckIn =
    !todayRecord || (!todayRecord.checkIn && !todayRecord.checkOut);
  const canCheckOut =
    todayRecord && todayRecord.checkIn && !todayRecord.checkOut;

  // ===============================
  // SUMMARY CARDS CALCULATIONS
  // ===============================
  const totalLeaves = useMemo(() => {
    return records.filter((r) => r.status === "Leave").length;
  }, [records]);

  const totalHoursWorked = useMemo(() => {
    return records
      .filter((r) => r.workHours)
      .reduce((sum, r) => sum + r.workHours, 0);
  }, [records]);

  const lastCheckIn = useMemo(() => {
    const last = [...records]
      .filter((r) => r.checkIn)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return last ? new Date(last.checkIn).toLocaleTimeString() : "—";
  }, [records]);

  const getStatusColor = (status) => {
    const colors = {
      Present: "bg-green-100 text-green-800 border-green-200",
      Leave: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Absent: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [records]
  );

  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* ⭐ HEADER WITH LEAVE REQUEST BUTTON */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Attendance History
          </h1>
          <p className="text-gray-600 mt-1">
            View your attendance records and statistics
          </p>
        </div>

        <div>
          <Button
            onClick={() => setIsLeaveModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4" /> Request Leave
          </Button>
        </div>
      </div>

      {/* ⭐ SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Leaves Taken</p>
            <p className="text-3xl font-bold text-yellow-600">{totalLeaves}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Hours Worked</p>
            <p className="text-3xl font-bold text-blue-600">
              {totalHoursWorked.toFixed(2)}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Last Check-In Time</p>
            <p className="text-3xl font-bold text-green-600">{lastCheckIn}</p>
          </CardContent>
        </Card>
      </div>

      {/* ⭐ BUTTONS: CHECK-IN / CHECK-OUT + WORK MODE */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={workMode} onValueChange={setWorkMode}>
          <SelectTrigger className="w-[130px] bg-white border-gray-300">
            <SelectValue placeholder="Work Mode" />
          </SelectTrigger>
          <SelectContent className="z-50" position="popper">
            <SelectItem value="Office">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Office
              </div>
            </SelectItem>
            <SelectItem value="WFH">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4" /> WFH
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

      {/* ⭐ ATTENDANCE TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>Your personal attendance timeline</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Mode</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
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
                      {r.workHours ? `${r.workHours.toFixed(2)}h` : "—"}
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

            {sortedRecords.length === 0 && (
              <div className="text-center p-8 text-gray-500">
                <Clock className="mx-auto w-10 h-10 mb-2 text-gray-400" />
                No attendance records found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ⭐ LEAVE REQUEST MODAL */}
      <LeaveRequestModal
        open={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        user={user} // ✅ <-- Added this line
      />
    </div>
  );
}

