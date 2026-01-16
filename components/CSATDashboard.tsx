import React, { useMemo } from 'react';
import type { CSATResponse } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface CSATDashboardProps {
    csatResponses: CSATResponse[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

export const CSATDashboard: React.FC<CSATDashboardProps> = ({ csatResponses }) => {
    const metrics = useMemo(() => {
        if (csatResponses.length === 0) {
            return {
                avgScore: 0,
                totalResponses: 0,
                avgServiceQuality: 0,
                avgResponseTime: 0,
                avgProfessionalism: 0,
                satisfactionDistribution: [
                    { rating: '1 Star', count: 0, percentage: 0 },
                    { rating: '2 Star', count: 0, percentage: 0 },
                    { rating: '3 Star', count: 0, percentage: 0 },
                    { rating: '4 Star', count: 0, percentage: 0 },
                    { rating: '5 Star', count: 0, percentage: 0 },
                ],
                trendData: [],
                recentResponses: []
            };
        }

        const total = csatResponses.length;
        const avgScore = (csatResponses.reduce((sum, r) => sum + (r.overallSatisfaction || 0), 0) / total).toFixed(2);
        const avgServiceQuality = (csatResponses.reduce((sum, r) => sum + (r.serviceQuality || 0), 0) / total).toFixed(2);
        const avgResponseTime = (csatResponses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / total).toFixed(2);
        const avgProfessionalism = (csatResponses.reduce((sum, r) => sum + (r.professionalismScore || 0), 0) / total).toFixed(2);

        // Distribution calculation
        const distribution = [0, 0, 0, 0, 0];
        csatResponses.forEach(r => {
            const rating = r.overallSatisfaction || 0;
            if (rating >= 1 && rating <= 5) {
                distribution[rating - 1]++;
            }
        });

        const satisfactionDistribution = [
            { rating: '1 Star', count: distribution[0], percentage: Math.round((distribution[0] / total) * 100) },
            { rating: '2 Star', count: distribution[1], percentage: Math.round((distribution[1] / total) * 100) },
            { rating: '3 Star', count: distribution[2], percentage: Math.round((distribution[2] / total) * 100) },
            { rating: '4 Star', count: distribution[3], percentage: Math.round((distribution[3] / total) * 100) },
            { rating: '5 Star', count: distribution[4], percentage: Math.round((distribution[4] / total) * 100) },
        ];

        // Trend data (by month)
        const trendMap: Record<string, { scores: number[], count: number }> = {};
        csatResponses.forEach(r => {
            const month = r.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            if (!trendMap[month]) {
                trendMap[month] = { scores: [], count: 0 };
            }
            trendMap[month].scores.push(r.overallSatisfaction || 0);
            trendMap[month].count++;
        });

        const trendData = Object.entries(trendMap).map(([month, data]) => ({
            name: month,
            avg: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.count) * 10) / 10,
            count: data.count
        }));

        return {
            avgScore,
            totalResponses: total,
            avgServiceQuality,
            avgResponseTime,
            avgProfessionalism,
            satisfactionDistribution,
            trendData,
            recentResponses: csatResponses.slice(0, 5)
        };
    }, [csatResponses]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">CSAT Dashboard</h2>
                <div className="text-sm text-slate-600">
                    Total Responses: {metrics.totalResponses}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Overall Satisfaction</p>
                        <p className="text-3xl font-bold mt-2">{metrics.avgScore}/5</p>
                        <p className="text-xs opacity-75 mt-1">{metrics.totalResponses} responses</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Service Quality</p>
                        <p className="text-3xl font-bold mt-2">{metrics.avgServiceQuality}/5</p>
                        <p className="text-xs opacity-75 mt-1">Average rating</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Response Time</p>
                        <p className="text-3xl font-bold mt-2">{metrics.avgResponseTime}/5</p>
                        <p className="text-xs opacity-75 mt-1">Average rating</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Professionalism</p>
                        <p className="text-3xl font-bold mt-2">{metrics.avgProfessionalism}/5</p>
                        <p className="text-xs opacity-75 mt-1">Average rating</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Satisfaction Distribution</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.satisfactionDistribution}>
                                <XAxis dataKey="rating" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Rating Breakdown</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics.satisfactionDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="count"
                                >
                                    {metrics.satisfactionDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Trend Chart */}
            {metrics.trendData.length > 0 && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">CSAT Trend (Last 6 Months)</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics.trendData}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="avg" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                    name="Average Score"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Recent Responses */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Recent Responses</h3>
                </CardHeader>
                <CardContent>
                    {metrics.recentResponses.length === 0 ? (
                        <p className="text-slate-500">No responses yet</p>
                    ) : (
                        <div className="space-y-4">
                            {metrics.recentResponses.map((response) => (
                                <div key={response.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-slate-800">{response.tenantName}</p>
                                            <p className="text-sm text-slate-600">{response.tenantPoC}</p>
                                        </div>
                                        <span className="text-2xl font-bold text-blue-600">{response.overallSatisfaction}/5</span>
                                    </div>
                                    {response.comments && (
                                        <p className="text-sm text-slate-600 italic">"{response.comments}"</p>
                                    )}
                                    <p className="text-xs text-slate-400 mt-2">{response.date.toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
