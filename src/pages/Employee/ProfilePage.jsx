import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Building, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { mockEmployees } from '../../mock';
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';

const ProfilePage = () => {
  const { user } = useAuth();
  const employeeData = mockEmployees.find((e) => e.employeeId === user?.employeeId);
  
  const [editData, setEditData] = useState({
    phone: employeeData?.phone || '',
    address: employeeData?.address || ''
  });

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully.',
    });
  };

  if (!employeeData) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Employee data not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your personal information</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={employeeData.avatar} />
              <AvatarFallback className="bg-blue-600 text-white text-3xl">
                {getInitials(employeeData.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{employeeData.name}</h2>
              <p className="text-lg text-gray-600 mt-1">{employeeData.position}</p>
              <div className="flex items-center space-x-3 mt-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  {employeeData.department}
                </Badge>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  {employeeData.status}
                </Badge>
                <span className="text-sm text-gray-600">ID: {employeeData.employeeId}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium text-gray-900">{employeeData.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-900">{employeeData.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{employeeData.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2 text-purple-600" />
              Employment Information
            </CardTitle>
            <CardDescription>Your work details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-gray-900">{employeeData.department}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium text-gray-900">{employeeData.position}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Joining Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(employeeData.joiningDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-gray-400 mt-0.5 flex items-center justify-center">
                  🎯
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium text-gray-900 font-mono">{employeeData.employeeId}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Your performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Years of Service</p>
              <p className="text-2xl font-bold text-blue-900">
                {Math.floor(
                  (new Date() - new Date(employeeData.joiningDate)) / (1000 * 60 * 60 * 24 * 365)
                )}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">Annual Salary</p>
              <p className="text-2xl font-bold text-green-900">
                ${employeeData.salary.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Department</p>
              <p className="text-2xl font-bold text-purple-900">{employeeData.department}</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Status</p>
              <p className="text-2xl font-bold text-orange-900">{employeeData.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default ProfilePage;