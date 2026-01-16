import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SLA_MATRIX, getAllSLALevels, getSLAStatusColor, formatTimeFromMins } from '../services/slaMatrixService';
import type { Ticket } from '../types';

interface HelpDeskDashboardProps {
  tickets: Ticket[];
}

export function HelpDeskDashboard({ tickets }: HelpDeskDashboardProps) {
  // KPI Stats
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'Open').length;
    const wip = tickets.filter(t => t.status === 'WIP').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const closed = tickets.filter(t => t.status === 'Closed').length;
    
    return {
      total,
      open,
      wip,
      resolved,
      closed,
      openPercentage: total > 0 ? Math.round((open / total) * 100) : 0,
      resolutionRate: total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0,
    };
  }, [tickets]);

  // SLA Matrix Display Data
  const slaLevels = useMemo(() => getAllSLALevels(), []);

  // Priority Distribution
  const priorityData = useMemo(() => {
    const data = { P1: 0, P2: 0, P3: 0, P4: 0 };
    tickets.forEach(t => {
      const priority = t.priority || 'P4';
      if (priority in data) data[priority as keyof typeof data]++;
    });
    return Object.entries(data).map(([priority, count]) => ({
      name: priority,
      value: count,
    }));
  }, [tickets]);

  // Status Distribution
  const statusData = useMemo(() => {
    const statuses = ['Open', 'WIP', 'On Hold', 'Resolved', 'Closed'];
    return statuses.map(status => ({
      name: status,
      count: tickets.filter(t => t.status === status).length,
    }));
  }, [tickets]);

  // Category Distribution (Top 5)
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    tickets.forEach(t => {
      categories[t.category || 'Other'] = (categories[t.category || 'Other'] || 0) + 1;
    });
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [tickets]);

  // Escalation Level Distribution
  const escalationData = useMemo(() => {
    const levels: Record<string, number> = {
      L0: 0, L1: 0, L2: 0, L3: 0, L4: 0, L5: 0,
    };
    tickets.forEach(t => {
      const level = `L${t.escalationLevel || 0}`;
      if (level in levels) levels[level]++;
    });
    return Object.entries(levels).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  // Average Response Times by Priority
  const responseTimeData = useMemo(() => {
    const priorities = ['P1', 'P2', 'P3', 'P4'];
    return priorities.map(priority => {
      const priorityTickets = tickets.filter(t => t.priority === priority);
      const avgResponseTime = priorityTickets.length > 0
        ? priorityTickets.reduce((sum, t) => sum + (t.responseTimeTarget || 30), 0) / priorityTickets.length
        : 30;
      return {
        priority,
        avgMinutes: Math.round(avgResponseTime),
        l0Target: 30,
      };
    });
  }, [tickets]);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tickets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
            <div className="text-sm text-gray-600">Open ({stats.openPercentage}%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.wip}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.closed}</div>
            <div className="text-sm text-gray-600">Closed</div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Matrix Section */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <h3 className="text-lg font-semibold">SLA Escalation Matrix</h3>
          <p className="text-sm opacity-90 mt-1">Fixed SLA times for all escalation levels</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-orange-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Level</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Technician Assignment</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Response Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Resolution Time</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration (hrs)</th>
                </tr>
              </thead>
              <tbody>
                {slaLevels.map((level, idx) => {
                  const resolutionHours = (level.resolutionTimeMins / 60).toFixed(0);
                  return (
                    <tr
                      key={level.level}
                      className={`border-b ${
                        idx === 0
                          ? 'bg-blue-50'
                          : idx % 2 === 0
                          ? 'bg-gray-50'
                          : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            idx === 0
                              ? 'bg-blue-100 text-blue-800 font-bold text-lg'
                              : 'bg-gray-100 text-gray-800 font-semibold'
                          }
                        >
                          {level.level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{level.technician}</td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        {formatTimeFromMins(level.responseTimeMins)}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        {formatTimeFromMins(level.resolutionTimeMins)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{resolutionHours}h</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Escalation Process Box */}
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">Automatic Escalation Process:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <span className="font-semibold">1. L0 Ticket Creation:</span> Ticket assigned to L0 technician immediately
              </p>
              <p>
                <span className="font-semibold">2. L0 SLA (24h):</span> If ticket not resolved within 1440 minutes (24 hours), automatically escalates to L1
              </p>
              <p>
                <span className="font-semibold">3. Cascading Escalation:</span> Continues escalating through L1 → L2 → L3 → L4 → L5 based on each level's resolution time target
              </p>
              <p>
                <span className="font-semibold">4. Response Tracking:</span> Each level has response time SLA (when technician must acknowledge)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Priority Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Status Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Categories */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Top 5 Categories</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Escalation Levels */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Escalation Level Distribution</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={escalationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Response Time Comparison */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Average Response Time vs L0 Target (30 mins)</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responseTimeData.map((item) => {
              const percentage = Math.min((item.avgMinutes / 30) * 100, 100);
              const isBreach = item.avgMinutes > 30;
              return (
                <div key={item.priority}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-900">{item.priority}</span>
                    <span className={`font-semibold ${isBreach ? 'text-red-600' : 'text-green-600'}`}>
                      {item.avgMinutes}m
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isBreach ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistics Summary */}
      <Card>
        <CardHeader className="bg-gray-50">
          <h3 className="font-semibold text-gray-900">Summary Statistics</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">SLA Levels (L0-L5)</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Tickets</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.resolutionRate}%</div>
              <div className="text-sm text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">30m</div>
              <div className="text-sm text-gray-600">L0 Response Target</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
