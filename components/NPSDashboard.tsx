import React, { useMemo } from 'react';
import type { NPSResponse } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface NPSDashboardProps {
    npsResponses: NPSResponse[];
}

const NPS_COLORS = ['#ef4444', '#eab308', '#22c55e']; // Detractor, Passive, Promoter

export const NPSDashboard: React.FC<NPSDashboardProps> = ({ npsResponses }) => {
    const metrics = useMemo(() => {
        if (npsResponses.length === 0) {
            return {
                npsScore: 0,
                totalResponses: 0,
                promoters: 0,
                passives: 0,
                detractors: 0,
                promoterPercentage: 0,
                passivePercentage: 0,
                detractorPercentage: 0,
                scoreDistribution: [],
                trendData: [],
                recentResponses: []
            };
        }

        const total = npsResponses.length;
        let promoters = 0, passives = 0, detractors = 0;

        npsResponses.forEach(r => {
            if (r.score >= 9) promoters++;
            else if (r.score >= 7) passives++;
            else detractors++;
        });

        const npsScore = Math.round(((promoters - detractors) / total) * 100);
        const promoterPercentage = Math.round((promoters / total) * 100);
        const passivePercentage = Math.round((passives / total) * 100);
        const detractorPercentage = Math.round((detractors / total) * 100);

        // Score distribution
        const distribution = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 0-10
        npsResponses.forEach(r => {
            if (r.score >= 0 && r.score <= 10) {
                distribution[r.score]++;
            }
        });

        const scoreDistribution = [
            { score: '0', count: distribution[0] },
            { score: '1', count: distribution[1] },
            { score: '2', count: distribution[2] },
            { score: '3', count: distribution[3] },
            { score: '4', count: distribution[4] },
            { score: '5', count: distribution[5] },
            { score: '6', count: distribution[6] },
            { score: '7', count: distribution[7] },
            { score: '8', count: distribution[8] },
            { score: '9', count: distribution[9] },
            { score: '10', count: distribution[10] },
        ];

        // Trend data (by month)
        const trendMap: Record<string, { promoters: number, detractors: number, total: number }> = {};
        npsResponses.forEach(r => {
            const month = r.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            if (!trendMap[month]) {
                trendMap[month] = { promoters: 0, detractors: 0, total: 0 };
            }
            if (r.score >= 9) trendMap[month].promoters++;
            if (r.score <= 6) trendMap[month].detractors++;
            trendMap[month].total++;
        });

        const trendData = Object.entries(trendMap).map(([month, data]) => ({
            name: month,
            nps: Math.round(((data.promoters - data.detractors) / data.total) * 100),
            promoters: data.promoters,
            detractors: data.detractors
        }));

        return {
            npsScore,
            totalResponses: total,
            promoters,
            passives,
            detractors,
            promoterPercentage,
            passivePercentage,
            detractorPercentage,
            scoreDistribution,
            trendData,
            recentResponses: npsResponses.slice(0, 5)
        };
    }, [npsResponses]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">NPS Dashboard</h2>
                <div className="text-sm text-slate-600">
                    Total Responses: {metrics.totalResponses}
                </div>
            </div>

            {/* Primary NPS Score */}
            <Card className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
                <CardContent className="flex flex-col justify-center items-center h-48 p-8">
                    <p className="text-lg font-semibold opacity-90 mb-4">Net Promoter Score</p>
                    <p className="text-7xl font-bold">{metrics.npsScore}</p>
                    <p className="text-sm opacity-75 mt-4">Based on {metrics.totalResponses} responses</p>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Promoters (9-10)</p>
                        <p className="text-3xl font-bold mt-2">{metrics.promoters}</p>
                        <p className="text-sm opacity-75 mt-1">{metrics.promoterPercentage}% of total</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Passives (7-8)</p>
                        <p className="text-3xl font-bold mt-2">{metrics.passives}</p>
                        <p className="text-sm opacity-75 mt-1">{metrics.passivePercentage}% of total</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Detractors (0-6)</p>
                        <p className="text-3xl font-bold mt-2">{metrics.detractors}</p>
                        <p className="text-sm opacity-75 mt-1">{metrics.detractorPercentage}% of total</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Score Distribution (0-10)</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metrics.scoreDistribution}>
                                <XAxis dataKey="score" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Respondent Segments</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Detractors (0-6)', value: metrics.detractors },
                                        { name: 'Passives (7-8)', value: metrics.passives },
                                        { name: 'Promoters (9-10)', value: metrics.promoters },
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {[0, 1, 2].map((index) => (
                                        <Cell key={`cell-${index}`} fill={NPS_COLORS[index]} />
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
                        <h3 className="text-lg font-semibold text-slate-800">NPS Trend (Last 6 Months)</h3>
                    </CardHeader>
                    <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={metrics.trendData}>
                                <XAxis dataKey="name" />
                                <YAxis domain={[-100, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="nps" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6' }}
                                    name="NPS Score"
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
                            {metrics.recentResponses.map((response) => {
                                let scoreColor = 'text-red-600';
                                let bgColor = 'bg-red-50 border-red-500';
                                if (response.score >= 9) {
                                    scoreColor = 'text-green-600';
                                    bgColor = 'bg-green-50 border-green-500';
                                } else if (response.score >= 7) {
                                    scoreColor = 'text-yellow-600';
                                    bgColor = 'bg-yellow-50 border-yellow-500';
                                }
                                return (
                                    <div key={response.id} className={`border-l-4 pl-4 py-2 ${bgColor} rounded`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-slate-800">{response.tenantName}</p>
                                            </div>
                                            <span className={`text-2xl font-bold ${scoreColor}`}>{response.score}/10</span>
                                        </div>
                                        {response.feedback && (
                                            <p className="text-sm text-slate-600 italic">"{response.feedback}"</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-2">{response.date.toLocaleDateString()}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
