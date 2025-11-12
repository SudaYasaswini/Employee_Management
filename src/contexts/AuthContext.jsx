import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 🧠 MAIN LOGIN FUNCTION — uses backend
  const login = async (empIdOrEmail, password) => {
    if (!empIdOrEmail || !password) {
      return { success: false, error: 'Both Emp ID and Password are required' };
    }

    try {
      let empId = empIdOrEmail.trim();

      // 🔍 if the user entered an email instead of empId, resolve it to empId
      if (empId.includes('@')) {
        const res = await fetch(`/api/employees?page=0&size=500`);
        if (!res.ok) return { success: false, error: 'Unable to fetch employees' };
        const data = await res.json();
        const found = (data.content || []).find(
          (e) => e.email.toLowerCase() === empId.toLowerCase()
        );
        if (!found) return { success: false, error: 'Email not found' };
        empId = found.empId;
      }

      // ✅ Backend login request
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: empId.toUpperCase(), password }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: errText || 'Invalid credentials' };
      }

      const loginResp = await res.json(); // { id, empId, email, empRole, message }

      const userData = {
        id: loginResp.id,
        empId: loginResp.empId,
        email: loginResp.email,
        role: loginResp.empRole,
        name: `${loginResp.firstName || ""} ${loginResp.lastName || ""}`.trim() || loginResp.empId,
        message: loginResp.message,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Server error during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasRole,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
