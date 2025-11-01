import React from 'react';
import { mockSalary } from '../../mock';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, Download, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from '../../hooks/use-toast';
import { Toaster } from '../../components/ui/toaster';

const MySalaryPage = () => {
  const { user } = useAuth();
  const mySalary = mockSalary.filter((s) => s.employeeId === user?.employeeId);
  const latestSalary = mySalary[0];

  const handleDownload = (month) => {
    toast({
      title: 'Download Started',
      description: `Salary slip for ${month} is being downloaded.`,
    });
  };

  const getSalaryStatusColor = (status) => {
    return status === 'Paid'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Salary Details</h1>
        <p className="text-gray-600 mt-1">View your salary information and download pay slips</p>
      </div>

      {latestSalary && (
        <>
          {/* Current Salary Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Basic Salary</p>
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${latestSalary.basicSalary.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Per month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Allowances</p>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">
                  +${latestSalary.allowances.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">Additional benefits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Net Salary</p>
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  ${latestSalary.netSalary.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">After deductions</p>
              </CardContent>
            </Card>
          </div>

          {/* Latest Salary Breakdown */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Salary Breakdown - {latestSalary.month}</CardTitle>
                  <CardDescription>Detailed breakdown of your current salary</CardDescription>
                </div>
                <Badge variant="outline" className={getSalaryStatusColor(latestSalary.status)}>
                  {latestSalary.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Earnings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Basic Salary</span>
                        <span className="font-semibold text-gray-900">
                          ${latestSalary.basicSalary.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">House Rent Allowance</span>
                        <span className="font-semibold text-green-600">
                          +${Math.round(latestSalary.allowances * 0.6).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Transport Allowance</span>
                        <span className="font-semibold text-green-600">
                          +${Math.round(latestSalary.allowances * 0.4).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b-2 border-gray-300">
                        <span className="font-semibold text-gray-900">Gross Salary</span>
                        <span className="font-bold text-lg text-gray-900">
                          ${(latestSalary.basicSalary + latestSalary.allowances).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Deductions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Income Tax</span>
                        <span className="font-semibold text-red-600">
                          -${Math.round(latestSalary.deductions * 0.7).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Insurance</span>
                        <span className="font-semibold text-red-600">
                          -${Math.round(latestSalary.deductions * 0.3).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Other</span>
                        <span className="font-semibold text-red-600">-$0</span>
                      </div>
                      <div className="flex items-center justify-between pb-2 border-b-2 border-gray-300">
                        <span className="font-semibold text-gray-900">Total Deductions</span>
                        <span className="font-bold text-lg text-red-600">
                          -${latestSalary.deductions.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">Net Payable Amount</span>
                    <span className="text-3xl font-bold text-purple-600">
                      ${latestSalary.netSalary.toLocaleString()}
                    </span>
                  </div>
                  {latestSalary.status === 'Paid' && latestSalary.paidDate && (
                    <p className="text-sm text-gray-600 mt-2">
                      Paid on: {new Date(latestSalary.paidDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Salary History */}
      <Card>
        <CardHeader>
          <CardTitle>Salary History</CardTitle>
          <CardDescription>Your salary records and pay slips</CardDescription>
        </CardHeader>
        <CardContent>
          {mySalary.length > 0 ? (
            <div className="space-y-3">
              {mySalary.map((salary) => (
                <div
                  key={salary.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{salary.month}</h4>
                      <p className="text-sm text-gray-600">
                        Net Salary: ${salary.netSalary.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className={getSalaryStatusColor(salary.status)}>
                      {salary.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(salary.month)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No salary records found</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default MySalaryPage;