import React, { useMemo, useState } from 'react';
import type { Ticket } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface TicketDashboardProps {
  tickets: Ticket[];
}

const ESCALATION_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444'];
const PRIORITY_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const STATUS_COLORS = {
  'Open': '#3b82f6',
  'In Progress': '#8b5cf6',
  'On Hold': '#f59e0b',
  'Resolved': '#10b981',
  'Closed': '#6b7280'
};

export const TicketDashboard: React.FC<TicketDashboardProps> = ({ tickets }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  const metrics = useMemo(() => {
    if (!tickets || tickets.length === 0) {
      return {
        totalTickets: 0,
        openTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
        priorityDistribution: [],
        statusDistribution: [],
        levelDistribution: [],
        monthlyTrendData: [],
        categoryMetrics: [],
        recentTickets: [],
        months: [],
      };
    }

    const now = new Date();

    // Priority distribution
    const priorityMap: Record<string, number> = {};
    tickets.forEach(t => {
      const p = t.priority || 'P4';
      priorityMap[p] = (priorityMap[p] || 0) + 1;
    });
    const priorityDistribution = Object.entries(priorityMap).map(([priority, count]) => ({
      name: priority,
      count,
    }));

    // Status distribution
    const statusMap: Record<string, number> = {};
    tickets.forEach(t => {
      const s = t.status || 'Open';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
      name: status,
      count,
      fill: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280',
    }));

    // Escalation level distribution
    const levelMap: Record<string, number> = {};
    tickets.forEach(t => {
      const level = t.assignedLevel || 'L0';
      levelMap[level] = (levelMap[level] || 0) + 1;
    });
    const levelDistribution = Object.entries(levelMap).map(([level, count]) => ({
      name: level,
      count,
    }));

    // Category metrics
    const categoryMap: Record<string, number> = {};
    tickets.forEach(t => {
      const cat = t.category || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryMetrics = Object.entries(categoryMap)
      .map(([category, count]) => ({
        name: category,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Escalation trend
    const escalationTrendData = [
      { level: 'L0', count: levelDistribution.find(l => l.name === 'L0')?.count || 0 },
      { level: 'L1', count: levelDistribution.find(l => l.name === 'L1')?.count || 0 },
      { level: 'L2', count: levelDistribution.find(l => l.name === 'L2')?.count || 0 },
      { level: 'L3', count: levelDistribution.find(l => l.name === 'L3')?.count || 0 },
      { level: 'L4', count: levelDistribution.find(l => l.name === 'L4')?.count || 0 },
      { level: 'L5', count: levelDistribution.find(l => l.name === 'L5')?.count || 0 },
    ];

    // Generate monthly data (last 12 months)
    const monthlyMap: Record<string, { created: number; resolved: number }> = {};
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyMap[monthKey] = { created: 0, resolved: 0 };
    }

    tickets.forEach(t => {
      const ticketDate = new Date(t.createdAt);
      const monthKey = ticketDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (monthKey in monthlyMap) {
        monthlyMap[monthKey].created++;
        
        if (t.status === 'Closed' || t.status === 'Resolved') {
          monthlyMap[monthKey].resolved++;
        }
      }
    });

    const monthlyTrendData = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      created: data.created,
      resolved: data.resolved,
    }));

    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status !== 'Closed' && t.status !== 'Resolved').length,
      resolvedTickets: tickets.filter(t => t.status === 'Resolved').length,
      closedTickets: tickets.filter(t => t.status === 'Closed').length,
      priorityDistribution,
      statusDistribution,
      levelDistribution,
      monthlyTrendData,
      categoryMetrics,
      recentTickets: tickets.slice(0, 8),
      months: Object.keys(monthlyMap),
    };
  }, [tickets]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Ticket Analytics Dashboard</h2>
        <div className="text-sm text-slate-600">
          Total Tickets: {metrics.totalTickets}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <p className="text-sm font-medium opacity-90">Total Tickets</p>
            <p className="text-3xl font-bold mt-2">{metrics.totalTickets}</p>
            <p className="text-xs opacity-75 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <p className="text-sm font-medium opacity-90">Open Tickets</p>
            <p className="text-3xl font-bold mt-2">{metrics.openTickets}</p>
            <p className="text-xs opacity-75 mt-1">In progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <p className="text-sm font-medium opacity-90">Resolved</p>
            <p className="text-3xl font-bold mt-2">{metrics.resolvedTickets}</p>
            <p className="text-xs opacity-75 mt-1">Resolved</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-none">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <p className="text-sm font-medium opacity-90">Closed</p>
            <p className="text-3xl font-bold mt-2">{metrics.closedTickets}</p>
            <p className="text-xs opacity-75 mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Monthly Ticket Trend (Last 12 Months)</h3>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.monthlyTrendData}>
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" strokeWidth={2} />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Priority Distribution</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.priorityDistribution}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Status Distribution</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.statusDistribution}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Escalation Level Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Escalation Levels</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.levelDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Top Ticket Categories</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.categoryMetrics.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ESCALATION_COLORS[index % ESCALATION_COLORS.length] }}
                  ></div>
                  <span className="text-slate-700">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(category.count / metrics.totalTickets) * 100}%`,
                        backgroundColor: ESCALATION_COLORS[index % ESCALATION_COLORS.length],
                      }}
                    ></div>
                  </div>
                  <span className="text-slate-600 font-medium min-w-[40px]">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Recent Tickets</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Ticket ID</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Category</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Priority</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Level</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentTickets.map((ticket) => {
                  return (
                    <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-2 text-blue-600 font-medium">{ticket.ticketId}</td>
                      <td className="py-2 px-2 text-slate-700">{ticket.category}</td>
                      <td className="py-2 px-2">
                        <Badge
                          variant={
                            ticket.priority === 'P1'
                              ? 'error'
                              : ticket.priority === 'P2'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {ticket.priority}
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <Badge variant="secondary">{ticket.status}</Badge>
                      </td>
                      <td className="py-2 px-2 font-medium text-slate-700">{ticket.assignedLevel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
