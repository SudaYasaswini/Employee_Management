import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldOff } from 'lucide-react';
import { Button } from '../components/ui/button';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Your current role is <strong>{user?.role}</strong>.
        </p>
        <Link to="/">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
