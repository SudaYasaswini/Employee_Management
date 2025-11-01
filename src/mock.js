// Mock data for Employee Management System

export const mockUsers = [
  {
    id: '1',
    email: 'manager@company.com',
    password: 'manager123',
    name: 'John Smith',
    role: 'Manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    department: 'Engineering',
    employeeId: 'EMP001'
  },
  {
    id: '2',
    email: 'hr@company.com',
    password: 'hr123',
    name: 'Sarah Johnson',
    role: 'HR',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    department: 'Human Resources',
    employeeId: 'EMP002'
  },
  {
    id: '3',
    email: 'ceo@company.com',
    password: 'ceo123',
    name: 'Michael Chen',
    role: 'CEO',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    department: 'Executive',
    employeeId: 'EMP003'
  },
  {
    id: '4',
    email: 'employee@company.com',
    password: 'employee123',
    name: 'Emily Davis',
    role: 'Employee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    department: 'Engineering',
    employeeId: 'EMP004'
  }
];

export const mockEmployees = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Manager',
    department: 'Engineering',
    position: 'Engineering Manager',
    joiningDate: '2020-03-15',
    phone: '+1-555-0101',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'Active',
    salary: 95000,
    address: '123 Tech Street, San Francisco, CA'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'Employee',
    department: 'Engineering',
    position: 'Senior Developer',
    joiningDate: '2021-06-01',
    phone: '+1-555-0104',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    status: 'Active',
    salary: 75000,
    address: '456 Code Ave, San Francisco, CA'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'Employee',
    department: 'Engineering',
    position: 'Frontend Developer',
    joiningDate: '2022-01-15',
    phone: '+1-555-0105',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    status: 'Active',
    salary: 68000,
    address: '789 Developer Lane, San Francisco, CA'
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    role: 'Employee',
    department: 'Marketing',
    position: 'Marketing Specialist',
    joiningDate: '2021-09-20',
    phone: '+1-555-0106',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    status: 'Active',
    salary: 62000,
    address: '321 Brand Street, San Francisco, CA'
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'Robert Brown',
    email: 'robert.brown@company.com',
    role: 'Employee',
    department: 'Sales',
    position: 'Sales Executive',
    joiningDate: '2020-11-10',
    phone: '+1-555-0107',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    status: 'Active',
    salary: 58000,
    address: '654 Commerce Blvd, San Francisco, CA'
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Maria Garcia',
    email: 'maria.garcia@company.com',
    role: 'Employee',
    department: 'Design',
    position: 'UI/UX Designer',
    joiningDate: '2022-03-01',
    phone: '+1-555-0108',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    status: 'Active',
    salary: 72000,
    address: '987 Creative Way, San Francisco, CA'
  }
];

export const mockTasks = [
  {
    id: '1',
    title: 'Implement User Authentication',
    description: 'Build JWT-based authentication system with role management',
    assignedTo: 'EMP004',
    assignedToName: 'Emily Davis',
    assignedBy: 'EMP001',
    assignedByName: 'John Smith',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-08-15',
    createdAt: '2025-07-10',
    department: 'Engineering',
    progress: 65
  },
  {
    id: '2',
    title: 'Design Dashboard Mockups',
    description: 'Create wireframes and high-fidelity designs for admin dashboard',
    assignedTo: 'EMP008',
    assignedToName: 'Maria Garcia',
    assignedBy: 'EMP001',
    assignedByName: 'John Smith',
    status: 'Completed',
    priority: 'Medium',
    dueDate: '2025-07-20',
    createdAt: '2025-07-05',
    department: 'Design',
    progress: 100
  },
  {
    id: '3',
    title: 'Q3 Marketing Campaign',
    description: 'Plan and execute social media marketing campaign for Q3',
    assignedTo: 'EMP006',
    assignedToName: 'Lisa Anderson',
    assignedBy: 'EMP001',
    assignedByName: 'John Smith',
    status: 'Open',
    priority: 'Medium',
    dueDate: '2025-09-01',
    createdAt: '2025-07-15',
    department: 'Marketing',
    progress: 20
  },
  {
    id: '4',
    title: 'API Integration Testing',
    description: 'Complete integration tests for all REST API endpoints',
    assignedTo: 'EMP005',
    assignedToName: 'James Wilson',
    assignedBy: 'EMP001',
    assignedByName: 'John Smith',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2025-08-01',
    createdAt: '2025-07-12',
    department: 'Engineering',
    progress: 45
  },
  {
    id: '5',
    title: 'Client Demo Preparation',
    description: 'Prepare presentation and demo materials for upcoming client meeting',
    assignedTo: 'EMP007',
    assignedToName: 'Robert Brown',
    assignedBy: 'EMP001',
    assignedByName: 'John Smith',
    status: 'Open',
    priority: 'High',
    dueDate: '2025-07-25',
    createdAt: '2025-07-18',
    department: 'Sales',
    progress: 10
  }
];

export const mockAttendance = [
  {
    id: '1',
    employeeId: 'EMP004',
    employeeName: 'Emily Davis',
    date: '2025-07-01',
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHours: 9
  },
  {
    id: '2',
    employeeId: 'EMP004',
    employeeName: 'Emily Davis',
    date: '2025-07-02',
    status: 'Present',
    checkIn: '09:15 AM',
    checkOut: '06:30 PM',
    workHours: 9.25
  },
  {
    id: '3',
    employeeId: 'EMP004',
    employeeName: 'Emily Davis',
    date: '2025-07-03',
    status: 'Leave',
    checkIn: '-',
    checkOut: '-',
    workHours: 0
  },
  {
    id: '4',
    employeeId: 'EMP005',
    employeeName: 'James Wilson',
    date: '2025-07-01',
    status: 'Present',
    checkIn: '08:45 AM',
    checkOut: '05:45 PM',
    workHours: 9
  },
  {
    id: '5',
    employeeId: 'EMP005',
    employeeName: 'James Wilson',
    date: '2025-07-02',
    status: 'Present',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    workHours: 9
  }
];

export const mockSalary = [
  {
    id: '1',
    employeeId: 'EMP004',
    employeeName: 'Emily Davis',
    month: 'June 2025',
    basicSalary: 75000,
    allowances: 5000,
    deductions: 8000,
    netSalary: 72000,
    status: 'Paid',
    paidDate: '2025-06-30'
  },
  {
    id: '2',
    employeeId: 'EMP005',
    employeeName: 'James Wilson',
    month: 'June 2025',
    basicSalary: 68000,
    allowances: 4500,
    deductions: 7200,
    netSalary: 65300,
    status: 'Paid',
    paidDate: '2025-06-30'
  },
  {
    id: '3',
    employeeId: 'EMP006',
    employeeName: 'Lisa Anderson',
    month: 'June 2025',
    basicSalary: 62000,
    allowances: 4000,
    deductions: 6500,
    netSalary: 59500,
    status: 'Paid',
    paidDate: '2025-06-30'
  }
];

export const mockLeaveRequests = [
  {
    id: '1',
    employeeId: 'EMP004',
    employeeName: 'Emily Davis',
    leaveType: 'Sick Leave',
    startDate: '2025-07-22',
    endDate: '2025-07-23',
    days: 2,
    reason: 'Medical appointment',
    status: 'Pending',
    appliedDate: '2025-07-15'
  },
  {
    id: '2',
    employeeId: 'EMP005',
    employeeName: 'James Wilson',
    leaveType: 'Vacation',
    startDate: '2025-08-10',
    endDate: '2025-08-15',
    days: 6,
    reason: 'Family vacation',
    status: 'Approved',
    appliedDate: '2025-07-10'
  }
];

export const mockNotifications = [
  {
    id: '1',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: API Integration Testing',
    type: 'task',
    read: false,
    timestamp: '2025-07-18T10:30:00'
  },
  {
    id: '2',
    title: 'Leave Request Update',
    message: 'Your leave request has been approved',
    type: 'leave',
    read: false,
    timestamp: '2025-07-17T14:20:00'
  },
  {
    id: '3',
    title: 'Salary Processed',
    message: 'Your salary for June 2025 has been processed',
    type: 'salary',
    read: true,
    timestamp: '2025-06-30T09:00:00'
  }
];

export const mockCompanyStats = {
  totalEmployees: 156,
  activeTasks: 45,
  completedTasks: 234,
  pendingLeaves: 12,
  presentToday: 142,
  departments: 8,
  monthlyPayroll: 890000,
  avgAttendance: 94.5
};
