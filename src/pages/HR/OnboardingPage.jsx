// Onboarding.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { UserPlus, CheckCircle, Clock, FileText, Pencil, Trash2 } from 'lucide-react';
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

// Axios instance and API helpers
const api = axios.create({
  baseURL: '/', // same origin; change if API host differs
  headers: { 'Content-Type': 'application/json' },
});

const EmployeeApi = {
  create: (payload) => api.post('/api/employees', payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/employees/${id}`, payload).then((r) => r.data),
  get: (id) => api.get(`/api/employees/${id}`).then((r) => r.data),
  getByEmpId: (empId) => api.get(`/api/employees/by-empid/${empId}`).then((r) => r.data),
  list: (page = 0, size = 20) => api.get(`/api/employees?page=${page}&size=${size}`).then((r) => r.data),
  delete: (id) => api.delete(`/api/employees/${id}`).then((r) => r.data),
};

// Helpers to normalize types for backend min/max/regex constraints
const parseNum = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
const optionalEmpty = (v) => (v === '' ? undefined : v);

// Create dialog form model mapped to EmployeeCreateRequest
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

const OnboardingPage = () => {
  // List state
  const [listLoading, setListLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit dialog state mapped to EmployeeUpdateRequest
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Quick search by EmpID
  const [empIdQuery, setEmpIdQuery] = useState('');

  // Offboarding placeholders (UI demo only)
  const offboardingList = [];


  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      Completed: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Load paginated list from backend
  const loadList = async (p = page) => {
    setListLoading(true);
    try {
      const data = await EmployeeApi.list(p, size);
      setEmployees(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setPage(p);
    } catch (e) {
      toast({ title: 'Failed to load employees', description: 'Please try again.' });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadList(0);
  }, []);

  // Create employee submit (EmployeeCreateRequest)
  const submitCreate = async (e) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      // Client-side minimal validation aligned to DTO
      // empId pattern EMP-[A-Z0-9]{4,20}
      const empIdOk = /^EMP-[A-Z0-9]{4,20}$/.test(createForm.empId || '');
      if (!empIdOk) {
        toast({ title: 'Invalid Employee ID', description: 'Use pattern EMP-XXXX (uppercase letters/digits).' });
        setCreateSubmitting(false);
        return;
      }
      // IFSC pattern ^[A-Z]{4}[A-Z0-9]{7}$
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
        phoneNumber: parseNum(createForm.phoneNumber),
        empRole: createForm.empRole,
        empId: createForm.empId.toUpperCase(),
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

  // Open edit with selected employee
  const openEdit = (emp) => {
    setEditTarget(emp);
    setEditForm({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      phoneNumber: emp.phoneNumber || '',
      empRole: emp.empRole || '',
      bloodGroup: emp.bloodGroup || '',
      salary: emp.salary || '',
      address: emp.address || undefined,
      bankDetails: emp.bankDetails || undefined,
      emergencyContact: emp.emergencyContact || undefined,
    });
    setEditOpen(true);
  };

  // Clean empty fields for PATCH (partial update)
  const stripEmpty = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const out = Array.isArray(obj) ? [] : {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) return;
      if (typeof v === 'object') {
        const nested = stripEmpty(v);
        if (nested && Object.keys(nested).length) out[k] = nested;
      } else {
        out[k] = v;
      }
    });
    return out;
  };

  // Submit edit to PATCH /api/employees/{id} (EmployeeUpdateRequest)
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setEditSubmitting(true);
    try {
      const raw = { ...editForm };
      if (raw.salary !== undefined && raw.salary !== '') raw.salary = Number(raw.salary);
      if (raw.phoneNumber !== undefined && raw.phoneNumber !== '') raw.phoneNumber = Number(raw.phoneNumber);
      if (raw.address?.pincode !== undefined && raw.address.pincode !== '')
        raw.address.pincode = Number(raw.address.pincode);
      if (raw.bankDetails?.bankAccount !== undefined && raw.bankDetails.bankAccount !== '')
        raw.bankDetails.bankAccount = Number(raw.bankDetails.bankAccount);
      if (raw.bankDetails?.ifscCode) raw.bankDetails.ifscCode = String(raw.bankDetails.ifscCode).toUpperCase();
      if (raw.bloodGroup) raw.bloodGroup = String(raw.bloodGroup).toUpperCase();
      if (raw.emergencyContact?.contactNumber !== undefined && raw.emergencyContact.contactNumber !== '')
        raw.emergencyContact.contactNumber = Number(raw.emergencyContact.contactNumber);

      const payload = stripEmpty(raw);
      const updated = await EmployeeApi.update(editTarget.id, payload);
      toast({ title: 'Employee updated', description: `${updated.empId} saved successfully.` });
      setEditOpen(false);
      await loadList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Could not update employee.';
      toast({ title: 'Error', description: msg });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete employee
  const deleteEmployee = async (emp) => {
    if (!window.confirm(`Delete ${emp.empId}?`)) return;
    try {
      await EmployeeApi.delete(emp.id);
      toast({ title: 'Employee deleted', description: `${emp.empId} removed.` });
      await loadList(page);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Could not delete employee.';
      toast({ title: 'Error', description: msg });
    }
  };

  // Search by EmpID
  const findByEmpId = async () => {
    if (!empIdQuery.trim()) {
      await loadList(0);
      return;
    }
    try {
      const res = await EmployeeApi.getByEmpId(empIdQuery.trim());
      setEmployees([res]);
      setTotalPages(1);
      setPage(0);
    } catch (e) {
      const msg = e?.response?.data?.message || 'Employee not found.';
      toast({ title: 'Not found', description: msg });
    }
  };

  // Simple derived stats from list
  const stats = useMemo(() => {
    const active = employees.length; // demo logic, adapt as needed
    return {
      activeOnboarding: active,
      pendingOffboarding: offboardingList.length,
      completedThisMonth: Math.max(0, Math.floor(active / 2)),
    };
  }, [employees, offboardingList.length]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding & Offboarding</h1>
          <p className="text-gray-600 mt-1">Manage new hires and employee exits</p>
        </div>

        {/* Create Employee Dialog */}
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
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm((s) => ({ ...s, firstName: e.target.value }))}
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm((s) => ({ ...s, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm((s) => ({ ...s, email: e.target.value }))}
                    placeholder="jane@acme.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    required
                    inputMode="numeric"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                    placeholder="9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    required
                    value={createForm.empRole}
                    onChange={(e) => setCreateForm((s) => ({ ...s, empRole: e.target.value }))}
                    placeholder="Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input
                    required
                    value={createForm.empId}
                    onChange={(e) => setCreateForm((s) => ({ ...s, empId: e.target.value.toUpperCase() }))}
                    placeholder="EMP-XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Input
                    value={createForm.bloodGroup}
                    onChange={(e) => setCreateForm((s) => ({ ...s, bloodGroup: e.target.value.toUpperCase() }))}
                    placeholder="O+"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input
                    required
                    inputMode="numeric"
                    value={createForm.salary}
                    onChange={(e) => setCreateForm((s) => ({ ...s, salary: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

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
                        setCreateForm((s) => ({ ...s, address: { ...s.address, address1: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address 2</Label>
                    <Input
                      value={createForm.address.address2}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, address: { ...s.address, address2: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      required
                      value={createForm.address.country}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, address: { ...s.address, country: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      required
                      value={createForm.address.city}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, address: { ...s.address, city: e.target.value } }))
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
                        setCreateForm((s) => ({ ...s, address: { ...s.address, pincode: e.target.value } }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

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
                        setCreateForm((s) => ({ ...s, bankDetails: { ...s.bankDetails, bankAccount: e.target.value } }))
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
                          bankDetails: { ...s.bankDetails, ifscCode: e.target.value.toUpperCase() },
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
                        setCreateForm((s) => ({ ...s, bankDetails: { ...s.bankDetails, bankName: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      required
                      value={createForm.bankDetails.branchName}
                      onChange={(e) =>
                        setCreateForm((s) => ({ ...s, bankDetails: { ...s.bankDetails, branchName: e.target.value } }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

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
                        setCreateForm((s) => ({ ...s, emergencyContact: { ...s.emergencyContact, name: e.target.value } }))
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
                          emergencyContact: { ...s.emergencyContact, contactNumber: e.target.value },
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
                        setCreateForm((s) => ({ ...s, emergencyContact: { ...s.emergencyContact, relation: e.target.value } }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full bg-black text-white" disabled={createSubmitting}>
                {createSubmitting ? 'Creating...' : 'Start Onboarding'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Onboarding</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeOnboarding}</p>
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
                <p className="text-sm text-gray-600">Pending Offboarding</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingOffboarding}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedThisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="onboarding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="offboarding">Offboarding</TabsTrigger>
        </TabsList>

        {/* Manager “IM list” simplified view (same table, shows only key fields) */}
        <TabsContent value="onboarding">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <CardTitle>Employees</CardTitle>
                <CardDescription>Track new employee onboarding progress</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by Emp ID"
                  value={empIdQuery}
                  onChange={(e) => setEmpIdQuery(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" onClick={findByEmpId}>Find</Button>
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
                        <td className="py-3 pr-3">{[e.firstName, e.lastName].filter(Boolean).join(' ') || '—'}</td>
                        <td className="py-3 pr-3"><Badge variant="outline">{e.empId}</Badge></td>
                        <td className="py-3 pr-3">{e.email}</td>
                        <td className="py-3 pr-3">{e.empRole}</td>
                        <td className="py-3 pr-3">{e.phoneNumber}</td>
                        <td className="py-3 pr-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(e)}>
                              <Pencil className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteEmployee(e)}>
                              <Trash2 className="w-4 h-4 mr-1" /> Delete
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

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">Page {page + 1} of {Math.max(1, totalPages)}</span>
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

        <TabsContent value="offboarding">
          <Card>
            <CardHeader>
              <CardTitle>Offboarding Process</CardTitle>
              <CardDescription>Manage employee exits and transitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offboardingList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.employee}</h4>
                      <p className="text-sm text-gray-600 mt-1">{item.department}</p>
                      <p className="text-xs text-gray-500 mt-1">Last Day: {new Date(item.lastDay).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update details and save changes</DialogDescription>
          </DialogHeader>

          {editTarget && (
            <form onSubmit={submitEdit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={editForm.firstName || ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={editForm.lastName || ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    inputMode="numeric"
                    value={editForm.phoneNumber || ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={editForm.empRole || ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, empRole: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Input
                    value={editForm.bloodGroup || ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, bloodGroup: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input
                    inputMode="numeric"
                    value={editForm.salary || ''}
                    onChange={(e) => setEditForm((s) => ({ ...s, salary: e.target.value }))}
                  />
                </div>
              </div>

              <Card>
                <CardHeader><CardTitle>Address</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Address 1</Label>
                    <Input
                      value={editForm?.address?.address1 || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, address: { ...(s.address || {}), address1: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address 2</Label>
                    <Input
                      value={editForm?.address?.address2 || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, address: { ...(s.address || {}), address2: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      value={editForm?.address?.country || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, address: { ...(s.address || {}), country: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={editForm?.address?.city || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, address: { ...(s.address || {}), city: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode</Label>
                    <Input
                      inputMode="numeric"
                      value={editForm?.address?.pincode || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, address: { ...(s.address || {}), pincode: e.target.value } }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      inputMode="numeric"
                      value={editForm?.bankDetails?.bankAccount || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, bankDetails: { ...(s.bankDetails || {}), bankAccount: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input
                      value={editForm?.bankDetails?.ifscCode || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({
                          ...s,
                          bankDetails: { ...(s.bankDetails || {}), ifscCode: e.target.value.toUpperCase() },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={editForm?.bankDetails?.bankName || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, bankDetails: { ...(s.bankDetails || {}), bankName: e.target.value } }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch Name</Label>
                    <Input
                      value={editForm?.bankDetails?.branchName || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({ ...s, bankDetails: { ...(s.bankDetails || {}), branchName: e.target.value } }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Emergency Contact</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editForm?.emergencyContact?.name || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({
                          ...s,
                          emergencyContact: { ...(s.emergencyContact || {}), name: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input
                      inputMode="numeric"
                      value={editForm?.emergencyContact?.contactNumber || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({
                          ...s,
                          emergencyContact: { ...(s.emergencyContact || {}), contactNumber: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relation</Label>
                    <Input
                      value={editForm?.emergencyContact?.relation || ''}
                      onChange={(e) =>
                        setEditForm((s) => ({
                          ...s,
                          emergencyContact: { ...(s.emergencyContact || {}), relation: e.target.value },
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
};

export default OnboardingPage;
