import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../mock';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Minimal helper to look up employee email in backend (dev-only)
async function findEmployeeByEmail(email) {
  try {
    const res = await fetch(`/api/employees?page=0&size=500`);
    if (!res.ok) return null;
    const data = await res.json();
    const list = data?.content || [];
    const emp = list.find((e) => String(e.email).toLowerCase() === String(email).toLowerCase());
    return emp || null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // 1) Existing mock/demos path (unchanged)
    if (password) {
      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );
      if (foundUser) {
        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
      }
      // If password supplied but not found in mock, continue to email-only fallback as a convenience
    }

    // 2) Email-only employee login (dev-only, no backend auth)
    const emp = await findEmployeeByEmail(email);
    if (emp) {
      const employeeUser = {
        id: emp.id,
        empId: emp.empId,
        email: emp.email,
        name: [emp.firstName, emp.lastName].filter(Boolean).join(' ') || emp.empId,
        role: 'Employee', // minimal role tagging to keep hasRole working
      };
      setUser(employeeUser);
      localStorage.setItem('user', JSON.stringify(employeeUser));
      return { success: true, user: employeeUser };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  };

  const value = {
    user,
    login,
    logout,
    hasRole,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
