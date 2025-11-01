import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AppShell from "./components/Layout/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingPage from "./pages/HR/OnboardingPage";
// Auth Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import RoleRedirect from "./pages/RoleRedirect";

// Manager Pages
import ClientIntakePage from "./pages/Manager/ClientRequirement";
import EmployeesPage from "./pages/Manager/EmployeesPage";
import AssignTaskPage from "./pages/Manager/AssignTaskPage";
import AttendanceSalaryPage from "./pages/Manager/AttendanceSalaryPage";
import AllTasksPage from "./pages/Manager/AllTasksPage";
import TaskHistoryPage from "./pages/Manager/TaskHistoryPage";
import ManagerBoard from "./pages/Manager/ManagerBoard";

// Employee Pages
import MyTasksPage from "./pages/Employee/MyTasksPage";
import EmployeeBoardPage from "./pages/Employee/EmployeeBoard";

// HR Pages
import PayrollPage from "./pages/HR/PayrollPage";
import LeaveRequestsPage from "./pages/HR/LeaveRequestsPage";
import EmployeeDirectoryPage from "./pages/HR/EmployeeDirectoryPage";
import AttendanceManagementPage from "./pages/HR/AttendanceManagementPage";
import OnboardingHRPage from "./pages/HR/OnboardingPage";

// Placeholder for other pages
const PlaceholderPage = ({ title }) => (
  <div className="p-6">
    <div className="max-w-4xl mx-auto text-center py-20">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="text-4xl">🚧</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-600">This page is under construction and will be available soon.</p>
    </div>
  </div>
);

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <RoleRedirect />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/client-requirements"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <AppShell>
                    <ClientIntakePage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <AppShell>
                    <EmployeesPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager-board"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <AppShell>
                    <ManagerBoard />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assign-task"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <AppShell>
                    <AssignTaskPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-salary"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <AppShell>
                    <AttendanceSalaryPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/all-tasks"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <AppShell>
                    <AllTasksPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/task-history"
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <AppShell>
                    <TaskHistoryPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* HR Routes */}
            <Route
              path="/employee-directory"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <AppShell>
                    <PlaceholderPage title="Employee Directory" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance-management"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <AppShell>
                    <PlaceholderPage title="Attendance Management" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <AppShell>
                    <OnboardingPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave-requests"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <AppShell>
                    <PlaceholderPage title="Leave Requests" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={['HR']}>
                  <AppShell>
                    <PlaceholderPage title="Payroll" />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* CEO Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['CEO']}>
                  <AppShell>
                    <PlaceholderPage title="Dashboard" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-reports"
              element={
                <ProtectedRoute allowedRoles={['CEO']}>
                  <AppShell>
                    <PlaceholderPage title="Department Reports" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/salaries-overview"
              element={
                <ProtectedRoute allowedRoles={['CEO']}>
                  <AppShell>
                    <PlaceholderPage title="Salaries Overview" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/top-performers"
              element={
                <ProtectedRoute allowedRoles={['CEO']}>
                  <AppShell>
                    <PlaceholderPage title="Top Performers" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/task-analytics"
              element={
                <ProtectedRoute allowedRoles={['CEO']}>
                  <AppShell>
                    <PlaceholderPage title="Task Analytics" />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Employee Routes */}
            <Route
              path="/my-tasks"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <AppShell>
                    <MyTasksPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee-board"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <AppShell>
                    <EmployeeBoardPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-attendance"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <AppShell>
                    <PlaceholderPage title="My Attendance" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-salary"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <AppShell>
                    <PlaceholderPage title="My Salary" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['Employee']}>
                  <AppShell>
                    <PlaceholderPage title="Profile" />
                  </AppShell>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
