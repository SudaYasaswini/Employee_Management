import React, { useState } from 'react';
import { mockLeaveRequests } from '../../mock';
import { FileText, Check, X, Clock, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';

const LeaveRequestsPage = () => {
  const [requests, setRequests] = useState(mockLeaveRequests);

  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const approvedRequests = requests.filter((r) => r.status === 'Approved');
  const rejectedRequests = requests.filter((r) => r.status === 'Rejected');

  const handleApprove = (id) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r)));
    toast({
      title: 'Leave Approved',
      description: 'The leave request has been approved.',
    });
  };

  const handleReject = (id) => {
    setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r)));
    toast({
      title: 'Leave Rejected',
      description: 'The leave request has been rejected.',
      variant: 'destructive',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Approved: 'bg-green-100 text-green-800 border-green-200',
      Rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const LeaveRequestCard = ({ request, showActions = false }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{request.employeeName}</h3>
            <p className="text-sm text-gray-600 mt-1">{request.leaveType}</p>
          </div>
          <Badge variant="outline" className={getStatusColor(request.status)}>
            {request.status}
          </Badge>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span>
              {new Date(request.startDate).toLocaleDateString()} -{' '}
              {new Date(request.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            <span>{request.days} day(s)</span>
          </div>
          <div className="mt-3">
            <p className="text-gray-700">
              <strong>Reason:</strong> {request.reason}
            </p>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Applied on: {new Date(request.appliedDate).toLocaleDateString()}
          </div>
        </div>
        {showActions && (
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleApprove(request.id)}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => handleReject(request.id)}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
        <p className="text-gray-600 mt-1">Review and manage employee leave requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <LeaveRequestCard key={request.id} request={request} showActions={true} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">No pending leave requests</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {approvedRequests.length > 0 ? (
              approvedRequests.map((request) => (
                <LeaveRequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No approved leave requests</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {rejectedRequests.length > 0 ? (
              rejectedRequests.map((request) => (
                <LeaveRequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card className="col-span-2">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No rejected leave requests</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  );
};

export default LeaveRequestsPage;