import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { applyLeave } from '../../lib/leaveService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

const LeaveRequestModal = ({ open, onClose, onSubmitSuccess }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    typeOfLeave: 'Sick Leave',
    fromDate: '',
    toDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.fromDate || !form.toDate) return false;
    if (!form.reason.trim()) return false;
    if (new Date(form.fromDate) > new Date(form.toDate)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill all fields and ensure From date is not after To date.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        empId: user?.empId || user?.employeeId, // match backend
        empName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        typeOfLeave: form.typeOfLeave,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason
      };

      await applyLeave(payload);
      toast.success('Leave request submitted successfully.');
      // Call prop callback to notify parent
      onSubmitSuccess?.();
      onClose();
      setForm({ typeOfLeave: 'Sick Leave', fromDate: '', toDate: '', reason: '' });

    } catch (err) {
      console.error('applyLeave error', err);
      toast.error('Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Type of Leave</Label>
            <select
              name="typeOfLeave"
              value={form.typeOfLeave}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Paid Leave">Paid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>From</Label>
              <Input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} required />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" name="toDate" value={form.toDate} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <Label>Reason</Label>
            <Textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Reason for leave..."
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveRequestModal;
