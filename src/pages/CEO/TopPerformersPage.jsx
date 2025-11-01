import React from 'react';
import { mockEmployees, mockTasks } from '../../mock';
import { Award, TrendingUp, Star, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

const TopPerformersPage = () => {
  const getEmployeeTaskStats = (employeeId) => {
    const employeeTasks = mockTasks.filter((t) => t.assignedTo === employeeId);
    const completed = employeeTasks.filter((t) => t.status === 'Completed').length;
    const total = employeeTasks.length;
    return { completed, total, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const performanceData = mockEmployees
    .filter((emp) => emp.role === 'Employee')
    .map((emp) => {
      const taskStats = getEmployeeTaskStats(emp.employeeId);
      // Generate performance score based on tasks and mock metrics
      const performanceScore =
        taskStats.rate * 0.6 + // Task completion rate (60%)
        Math.random() * 20 + // Random factor for demo
        20; // Base score
      return {
        ...emp,
        ...taskStats,
        performanceScore: Math.min(Math.round(performanceScore), 100),
        rating: (4 + Math.random()).toFixed(1)
      };
    })
    .sort((a, b) => b.performanceScore - a.performanceScore);

  const topPerformers = performanceData.slice(0, 6);
  const avgPerformance = Math.round(
    performanceData.reduce((sum, p) => sum + p.performanceScore, 0) / performanceData.length
  );

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getPerformanceBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 80) return { label: 'Very Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 70) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { label: 'Average', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Top Performers</h1>
        <p className="text-gray-600 mt-1">Recognize and reward high-performing employees</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Top Performers</p>
                <p className="text-2xl font-bold text-blue-600">{topPerformers.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-green-600">{avgPerformance}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Excellence Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round((topPerformers.filter((p) => p.performanceScore >= 90).length / topPerformers.length) * 100)}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks Done</p>
                <p className="text-2xl font-bold text-orange-600">
                  {topPerformers.reduce((sum, p) => sum + p.completed, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Performers - Featured */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topPerformers.slice(0, 3).map((performer, index) => {
          const badge = getPerformanceBadge(performer.performanceScore);
          return (
            <Card
              key={performer.id}
              className="relative overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8 rounded-full ${
                  index === 0
                    ? 'bg-yellow-200'
                    : index === 1
                    ? 'bg-gray-300'
                    : 'bg-orange-200'
                } opacity-20`}
              />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                      <AvatarImage src={performer.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white text-lg">
                        {getInitials(performer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{performer.name}</h3>
                      <p className="text-sm text-gray-600">{performer.position}</p>
                    </div>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      index === 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-400 text-gray-900'
                        : 'bg-orange-400 text-orange-900'
                    }`}
                  >
                    #{index + 1}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Performance Score</span>
                      <span className="text-lg font-bold text-gray-900">
                        {performer.performanceScore}%
                      </span>
                    </div>
                    <Progress value={performer.performanceScore} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tasks Completed</span>
                    <span className="font-semibold text-gray-900">
                      {performer.completed} / {performer.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{performer.rating}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${badge.color} w-full justify-center`}>
                    {badge.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>All Top Performers</CardTitle>
          <CardDescription>Complete ranking of high-performing employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => {
              const badge = getPerformanceBadge(performer.performanceScore);
              return (
                <div
                  key={performer.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={performer.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(performer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                      <p className="text-sm text-gray-600">
                        {performer.position} • {performer.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tasks</p>
                      <p className="font-semibold text-gray-900">
                        {performer.completed}/{performer.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-lg font-bold text-gray-900">{performer.performanceScore}%</p>
                    </div>
                    <Badge variant="outline" className={badge.color}>
                      {badge.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopPerformersPage;