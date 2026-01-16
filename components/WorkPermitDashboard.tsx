import React, { useMemo } from 'react';
import type { WorkPermit } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface WorkPermitDashboardProps {
    permits: WorkPermit[];
}

const STATUS_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export const WorkPermitDashboard: React.FC<WorkPermitDashboardProps> = ({ permits }) => {
    const metrics = useMemo(() => {
        if (permits.length === 0) {
            return {
                totalPermits: 0,
                activePermits: 0,
                completedPermits: 0,
                expiredPermits: 0,
                pendingApproval: 0,
                avgDuration: 0,
                permitsByType: [],
                statusDistribution: [],
                recentPermits: []
            };
        }

        const now = new Date();
        const active = permits.filter(p => {
            const start = new Date(p.startDate);
            const end = new Date(p.endDate);
            return start <= now && end >= now && p.status === 'Active';
        }).length;

        const completed = permits.filter(p => p.status === 'Completed').length;
        const expired = permits.filter(p => {
            const end = new Date(p.endDate);
            return end < now && p.status === 'Active';
        }).length;
        
        const pending = permits.filter(p => p.status === 'Pending').length;

        // Permit types
        const typeMap: Record<string, number> = {};
        permits.forEach(p => {
            typeMap[p.type] = (typeMap[p.type] || 0) + 1;
        });

        const permitsByType = Object.entries(typeMap).map(([type, count]) => ({
            name: type,
            count,
        }));

        // Status distribution
        const statusMap: Record<string, number> = {};
        permits.forEach(p => {
            statusMap[p.status] = (statusMap[p.status] || 0) + 1;
        });

        const statusDistribution = Object.entries(statusMap).map(([status, count]) => ({
            name: status,
            count,
        }));

        // Average duration
        const durations = permits
            .filter(p => p.status === 'Completed')
            .map(p => {
                const start = new Date(p.startDate).getTime();
                const end = new Date(p.endDate).getTime();
                return (end - start) / (1000 * 60 * 60); // hours
            });
        const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

        return {
            totalPermits: permits.length,
            activePermits: active,
            completedPermits: completed,
            expiredPermits: expired,
            pendingApproval: pending,
            avgDuration,
            permitsByType,
            statusDistribution,
            recentPermits: permits.slice(0, 5)
        };
    }, [permits]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Work Permit Dashboard</h2>
                <div className="text-sm text-slate-600">
                    Total Permits: {metrics.totalPermits}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Active Permits</p>
                        <p className="text-3xl font-bold mt-2">{metrics.activePermits}</p>
                        <p className="text-xs opacity-75 mt-1">Currently in progress</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Completed</p>
                        <p className="text-3xl font-bold mt-2">{metrics.completedPermits}</p>
                        <p className="text-xs opacity-75 mt-1">Finished permits</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Pending Approval</p>
                        <p className="text-3xl font-bold mt-2">{metrics.pendingApproval}</p>
                        <p className="text-xs opacity-75 mt-1">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Expired</p>
                        <p className="text-3xl font-bold mt-2">{metrics.expiredPermits}</p>
                        <p className="text-xs opacity-75 mt-1">Past due date</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Permits by Type</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.permitsByType}>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Status Distribution</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="count"
                                >
                                    {metrics.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Statistics */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Key Statistics</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                            <p className="text-sm text-slate-600">Average Permit Duration</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{metrics.avgDuration} hours</p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4 py-2">
                            <p className="text-sm text-slate-600">Completion Rate</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">
                                {metrics.totalPermits > 0 ? Math.round((metrics.completedPermits / metrics.totalPermits) * 100) : 0}%
                            </p>
                        </div>
                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                            <p className="text-sm text-slate-600">Approval Pending</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">
                                {metrics.totalPermits > 0 ? Math.round((metrics.pendingApproval / metrics.totalPermits) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Permits */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Recent Permits</h3>
                </CardHeader>
                <CardContent>
                    {metrics.recentPermits.length === 0 ? (
                        <p className="text-slate-500">No permits found</p>
                    ) : (
                        <div className="space-y-3">
                            {metrics.recentPermits.map((permit) => (
                                <div key={permit.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-slate-800">{permit.type}</p>
                                            <p className="text-sm text-slate-600">{permit.location}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            permit.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                                            permit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            permit.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {permit.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {new Date(permit.startDate).toLocaleDateString()} - {new Date(permit.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
