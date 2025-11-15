import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "../../components/ui/table";

// Helper: Get Monday of a week
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Adjust for Sunday
  d.setDate(d.getDate() + diff);
  return d;
};

export default function TimesheetModal({ open, onClose, records = [] }) {

  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));

  // Move 1 week back
  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  // Reset to current week
  const handleResetWeek = () => {
    setWeekStart(getStartOfWeek(new Date()));
  };

  // Create week label: Example "Jan 6 – Jan 10"
  const weekLabel = useMemo(() => {
    const monday = new Date(weekStart);
    const friday = new Date(weekStart);
    friday.setDate(friday.getDate() + 4);

    return (
      monday.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " – " +
      friday.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
  }, [weekStart]);

  // Build week data table
  const weekData = useMemo(() => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);

      const formatted = d.toISOString().split("T")[0];

      const rec = records.find((r) => {
      const recordDate = new Date(r.date).toISOString().split("T")[0];
      return recordDate === formatted;
     });


      days.push({
        date: formatted,
        status: rec?.status || "Absent",
        checkIn: rec?.checkIn || null,
        checkOut: rec?.checkOut || null,
        workMode: rec?.workMode || "—",
        hours: rec?.workHours || 0
      });
    }
    return days;
  }, [records, weekStart]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Weekly Timesheet</h2>
              <p className="text-gray-500 text-sm">{weekLabel}</p>
            </div>

            <div className="flex gap-2">
  <Button
    onClick={handlePrevWeek}
    className="bg-blue-600 hover:bg-blue-700 text-white"
  >
    ⬅ Previous Week
  </Button>

  <Button
    onClick={handleResetWeek}
    className="bg-blue-600 hover:bg-blue-700 text-white"
  >
    📅 This Week
  </Button>
</div>

          </DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {weekData.map((d, idx) => (
              <TableRow key={idx}>
                <TableCell>{d.date}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell>{d.checkIn ? new Date(d.checkIn).toLocaleTimeString() : "—"}</TableCell>
                <TableCell>{d.checkOut ? new Date(d.checkOut).toLocaleTimeString() : "—"}</TableCell>
                <TableCell>{d.hours.toFixed(2)}</TableCell>
                <TableCell>{d.workMode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
