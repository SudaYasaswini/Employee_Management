// Onboarding.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, CheckCircle, Pencil } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';
import axios from 'axios';

// =====================
// Axios & API helpers
// =====================
const api = axios.create({
  baseURL: '/', // proxy via Vite or backend
  headers: { 'Content-Type': 'application/json' },
});

const EmployeeApi = {
  create: (payload) => api.post('/api/employees', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/employees/${id}`, payload).then((r) => r.data),
  getByEmpId: (empId) => api.get(`/api/employees/by-empid/${empId}`).then((r) => r.data),
  list: (page = 0, size = 20) => api.get(`/api/employees?page=${page}&size=${size}`).then((r) => r.data),
  delete: (id) => api.delete(`/api/employees/${id}`).then((r) => r.data),
};

const StatsApi = {
  onboarded: (fromISO, toISO) =>
    api
      .get(`/api/employees/stats/onboarded?from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}`)
      .then((r) => r.data),
};

// =====================
// Helpers
// =====================
const parseNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
const optionalEmpty = (v) => (v === '' ? undefined : v);

// Generate Emp ID: first 4 of first + first letter of last + random 3 digits
const generateEmpId = (firstName, lastName) => {
  if (!firstName) return '';
  const f = firstName.trim().toUpperCase().slice(0, 4);
  const l = lastName?.trim()?.toUpperCase()?.charAt(0) || '';
  const num = Math.floor(100 + Math.random() * 900); // 100-999
  return `EMP-${f}${l}${num}`;
};

// Empty form model
const emptyCreate = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  empRole: '',
  empId: '',
  bloodGroup: '',
  salary: '',
  address: { address1: '', address2: '', country: '', city: '', pincode: '' },
  bankDetails: { bankAccount: '', ifscCode: '', bankName: '', branchName: '' },
  emergencyContact: { name: '', contactNumber: '', relation: '' },
};

export default function OnboardingPage() {
  // =====================
  // States
  // =====================
  const [listLoading, setListLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Other states
  const [empIdQuery, setEmpIdQuery] = useState('');
  const [onboardedThisMonth, setOnboardedThisMonth] = useState(0);
  const [offbFilter, setOffbFilter] = useState('');
  const [offbConfirmOpen, setOffbConfirmOpen] = useState(false);
  const [offbTarget, setOffbTarget] = useState(null);
  const [offbInfo, setOffbInfo] = useState({ lastDay: '', reason: '' });
  const [offbSubmitting, setOffbSubmitting] = useState(false);

  // =====================
  // Dynamic Emp ID generator
  // =====================
  useEffect(() => {
    // Regenerate Emp ID whenever first or last name changes
    if (createForm.firstName || createForm.lastName) {
      const empId = generateEmpId(createForm.firstName, createForm.lastName);
      setCreateForm((prev) => ({ ...prev, empId }));
    }
  }, [createForm.firstName, createForm.lastName]);

  // =====================
  // Stats & List loaders
  // =====================
  const monthRange = () => {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    return { from: from.toISOString(), to: to.toISOString() };
  };

  const loadOnboardedThisMonth = async () => {
    try {
      const { from, to } = monthRange();
      const res = await StatsApi.onboarded(from, to);
      setOnboardedThisMonth(Number(res?.count || 0));
    } catch {
      setOnboardedThisMonth(0);
    }
  };

  const loadList = async (p = page) => {
    setListLoading(true);
    try {
      const data = await EmployeeApi.list(p, size);
      setEmployees(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setPage(p);
    } catch {
      toast({ title: 'Failed to load employees', description: 'Please try again.' });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadList(0);
    loadOnboardedThisMonth();
  }, []);
  // ===================================================
  // CREATE EMPLOYEE DIALOG + SUBMIT
  // ===================================================

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      // Validate IFSC pattern
      const ifscOk = /^[A-Z]{4}[A-Z0-9]{7}$/.test(createForm.bankDetails.ifscCode || '');
      if (!ifscOk) {
        toast({ title: 'Invalid IFSC', description: 'Use 4 letters followed by 7 alphanumeric characters.' });
        setCreateSubmitting(false);
        return;
      }

      const payload = {
        firstName: optionalEmpty(createForm.firstName),
        lastName: optionalEmpty(createForm.lastName),
        email: createForm.email,
        password: createForm.password,
        phoneNumber: parseNum(createForm.phoneNumber),
        empRole: createForm.empRole,
        empId: createForm.empId, // already uppercase
        bloodGroup: optionalEmpty(createForm.bloodGroup?.toUpperCase?.() || createForm.bloodGroup),
        salary: parseNum(createForm.salary),
        address: {
          address1: createForm.address.address1,
          address2: optionalEmpty(createForm.address.address2),
          country: createForm.address.country,
          city: createForm.address.city,
          pincode: parseNum(createForm.address.pincode),
        },
        bankDetails: {
          bankAccount: parseNum(createForm.bankDetails.bankAccount),
          ifscCode: createForm.bankDetails.ifscCode.toUpperCase(),
          bankName: createForm.bankDetails.bankName,
          branchName: createForm.bankDetails.branchName,
        },
        emergencyContact: {
          name: createForm.emergencyContact.name,
          contactNumber: parseNum(createForm.emergencyContact.contactNumber),
          relation: createForm.emergencyContact.relation,
        },
      };

      const created = await EmployeeApi.create(payload);
      toast({ title: 'Employee created', description: `${created.empId} added successfully.` });
      setCreateForm(emptyCreate);
      setCreateOpen(false);
      await loadList(0);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Could not create employee.';
      toast({ title: 'Error', description: msg });
    } finally {
      setCreateSubmitting(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding & Offboarding</h1>
          <p className="text-gray-600 mt-1">Manage new hires and employee exits</p>
        </div>

        {/* CREATE EMPLOYEE DIALOG */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCreateOpen(true)} className="flex items-center text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Employee
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-white rounded-lg p-6">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter details for the new employee to start the onboarding process
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={submitCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    required
                    value={createForm.firstName}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, firstName: e.target.value }))
                    }
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    required
                    value={createForm.lastName}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, lastName: e.target.value }))
                    }
                    placeholder="Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="jane@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    required
                    value={createForm.password || ''}
                    onChange={(e) => setCreateForm((s) => ({ ...s, password: e.target.value }))}
                    placeholder="Enter a password"
                  />
                </div>


                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    required
                    inputMode="numeric"
                    value={createForm.phoneNumber}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, phoneNumber: e.target.value }))
                    }
                    placeholder="9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    required
                    value={createForm.empRole}
                    onChange={(e) => setCreateForm((s) => ({ ...s, empRole: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    <option value="HR">HR</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>


                {/* 🔒 EMPLOYEE ID – Auto-generated and read-only */}
                <div className="space-y-2">
                  <Label>Employee ID (Auto-Generated)</Label>
                  <Input
                    readOnly
                    value={createForm.empId}
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="EMP-AUTO"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Input
                    value={createForm.bloodGroup}
                    onChange={(e) =>
                      setCreateForm((s) => ({
                        ...s,
                        bloodGroup: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="O+"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input
                    required
                    inputMode="numeric"
                    value={createForm.salary}
                    onChange={(e) =>
                      setCreateForm((s) => ({ ...s, salary: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Address Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Address</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address 1</Label>
                    <Input
                      required
                      value={createForm.address.address1}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          address: { ...s.address, address1: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address 2</Label>
                    <Input
                      value={createForm.address.address2}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          address: { ...s.address, address2: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      required
                      value={createForm.address.country}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          address: { ...s.address, country: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      required
                      value={createForm.address.city}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          address: { ...s.address, city: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      required
                      inputMode="numeric"
                      value={createForm.address.pincode}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          address: { ...s.address, pincode: e.target.value },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      required
                      inputMode="numeric"
                      value={createForm.bankDetails.bankAccount}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          bankDetails: {
                            ...s.bankDetails,
                            bankAccount: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input
                      required
                      value={createForm.bankDetails.ifscCode}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          bankDetails: {
                            ...s.bankDetails,
                            ifscCode: e.target.value.toUpperCase(),
                          },
                        }))
                      }
                      placeholder="ABCD0123456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      required
                      value={createForm.bankDetails.bankName}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          bankDetails: {
                            ...s.bankDetails,
                            bankName: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      required
                      value={createForm.bankDetails.branchName}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          bankDetails: {
                            ...s.bankDetails,
                            branchName: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      required
                      value={createForm.emergencyContact.name}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          emergencyContact: {
                            ...s.emergencyContact,
                            name: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input
                      required
                      inputMode="numeric"
                      value={createForm.emergencyContact.contactNumber}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          emergencyContact: {
                            ...s.emergencyContact,
                            contactNumber: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relation</Label>
                    <Input
                      required
                      value={createForm.emergencyContact.relation}
                      onChange={(e) =>
                        setCreateForm((s) => ({
                          ...s,
                          emergencyContact: {
                            ...s.emergencyContact,
                            relation: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full bg-black text-white"
                disabled={createSubmitting}
              >
                {createSubmitting ? 'Creating…' : 'Start Onboarding'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {/* ===================== */}
      {/* DASHBOARD STATS */}
      {/* ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold text-blue-600">
                  {employees.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Onboarded This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {onboardedThisMonth}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===================== */}
      {/* MAIN TABS */}
      {/* ===================== */}
      <Tabs defaultValue="onboarding" className="space-y-4 mt-6">
        <TabsList>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="offboarding">Offboarding</TabsTrigger>
        </TabsList>

        {/* ===================== */}
        {/* ONBOARDING TAB */}
        {/* ===================== */}
        <TabsContent value="onboarding">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <CardTitle>Employees</CardTitle>
                <CardDescription>
                  Track new employee onboarding progress
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by Emp ID"
                  value={empIdQuery}
                  onChange={(e) => setEmpIdQuery(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" onClick={async () => {
                  if (!empIdQuery.trim()) return loadList(0);
                  try {
                    const res = await EmployeeApi.getByEmpId(empIdQuery.trim());
                    setEmployees([res]);
                    setTotalPages(1);
                    setPage(0);
                  } catch {
                    toast({ title: 'Not found', description: 'Employee not found.' });
                  }
                }}>Find</Button>
                <Button variant="outline" onClick={() => loadList(0)} disabled={listLoading}>
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-3 pr-3">Name</th>
                      <th className="py-3 pr-3">Emp ID</th>
                      <th className="py-3 pr-3">Email</th>
                      <th className="py-3 pr-3">Role</th>
                      <th className="py-3 pr-3">Phone</th>
                      <th className="py-3 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((e) => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="py-3 pr-3">
                          {[e.firstName, e.lastName].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td className="py-3 pr-3">
                          <Badge variant="outline">{e.empId}</Badge>
                        </td>
                        <td className="py-3 pr-3">{e.email}</td>
                        <td className="py-3 pr-3">{e.empRole}</td>
                        <td className="py-3 pr-3">{e.phoneNumber}</td>
                        <td className="py-3 pr-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(e)}>
                              <Pencil className="w-4 h-4 mr-1" /> Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-500">
                          {listLoading ? 'Loading...' : 'No employees found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {Math.max(1, totalPages)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => loadList(Math.max(0, page - 1))}
                    disabled={page <= 0 || listLoading}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => loadList(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1 || listLoading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== */}
        {/* OFFBOARDING TAB */}
        {/* ===================== */}
        <TabsContent value="offboarding">
          <Card>
            <CardHeader>
              <CardTitle>Offboarding Process</CardTitle>
              <CardDescription>
                Manage employee exits and transitions
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search name, Emp ID, or email..."
                    value={offbFilter}
                    onChange={(e) => setOffbFilter(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button variant="outline" onClick={() => setOffbFilter('')}>Clear</Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-3 pr-3">Name</th>
                        <th className="py-3 pr-3">Emp ID</th>
                        <th className="py-3 pr-3">Email</th>
                        <th className="py-3 pr-3">Role</th>
                        <th className="py-3 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees
                        .filter((e) => {
                          const q = offbFilter.toLowerCase();
                          return (
                            [e.firstName, e.lastName].join(' ').toLowerCase().includes(q) ||
                            e.email.toLowerCase().includes(q) ||
                            e.empId.toLowerCase().includes(q)
                          );
                        })
                        .map((e) => (
                          <tr key={e.id} className="border-b last:border-0">
                            <td className="py-3 pr-3">
                              {[e.firstName, e.lastName].filter(Boolean).join(' ') || '—'}
                            </td>
                            <td className="py-3 pr-3">
                              <Badge variant="outline">{e.empId}</Badge>
                            </td>
                            <td className="py-3 pr-3">{e.email}</td>
                            <td className="py-3 pr-3">{e.empRole}</td>
                            <td className="py-3 pr-3">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setOffbTarget(e);
                                  setOffbInfo({ lastDay: '', reason: '' });
                                  setOffbConfirmOpen(true);
                                }}
                              >
                                Offboard
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Offboard confirmation dialog */}
                <Dialog open={offbConfirmOpen} onOpenChange={setOffbConfirmOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Confirm Offboarding</DialogTitle>
                      <DialogDescription>
                        Provide the last working day and reason.
                      </DialogDescription>
                    </DialogHeader>
                    {offbTarget && (
                      <div className="space-y-4">
                        <div className="text-sm text-gray-700">
                          {[offbTarget.firstName, offbTarget.lastName].join(' ')} —{' '}
                          <span className="font-mono">{offbTarget.empId}</span>
                        </div>
                        <div className="space-y-2">
                          <Label>Last Working Day</Label>
                          <Input
                            type="date"
                            value={offbInfo.lastDay}
                            onChange={(e) =>
                              setOffbInfo((s) => ({ ...s, lastDay: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reason</Label>
                          <Input
                            placeholder="Resignation, termination, etc."
                            value={offbInfo.reason}
                            onChange={(e) =>
                              setOffbInfo((s) => ({ ...s, reason: e.target.value }))
                            }
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" onClick={() => setOffbConfirmOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={async () => {
                              if (!offbTarget) return;
                              try {
                                await EmployeeApi.delete(offbTarget.id);
                                toast({
                                  title: 'Employee offboarded',
                                  description: `${offbTarget.empId} removed.`,
                                });
                                setOffbConfirmOpen(false);
                                await loadList(page);
                              } catch (err) {
                                toast({
                                  title: 'Error',
                                  description: 'Failed to offboard employee.',
                                });
                              }
                            }}
                            disabled={offbSubmitting}
                          >
                            {offbSubmitting ? 'Removing…' : 'Confirm Offboard'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
