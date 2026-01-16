import React, { useState, useMemo } from 'react';
import type { CSATResponse, NPSResponse } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';

interface FeedbackDashboardProps {
    csatResponses: CSATResponse[];
    npsResponses: NPSResponse[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
const NPS_COLORS = ['#ef4444', '#eab308', '#22c55e']; // Detractor, Passive, Promoter

export const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ csatResponses, npsResponses }) => {
    const [activeTab, setActiveTab] = useState<'NPS' | 'CSAT'>('NPS');

    // --- NPS Metrics ---
    const npsMetrics = useMemo(() => {
        const total = npsResponses.length;
        const promoters = npsResponses.filter(r => r.score >= 9).length;
        const passives = npsResponses.filter(r => r.score >= 7 && r.score <= 8).length;
        const detractors = npsResponses.filter(r => r.score <= 6).length;
        
        const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
        
        return { total, promoters, passives, detractors, npsScore };
    }, [npsResponses]);

    const npsTrend = useMemo(() => {
        interface TrendData {
            total: number;
            scoreSum: number;
            count: number;
            promoters: number;
            detractors: number;
        }

        // Group by month
        const groups = npsResponses.reduce((acc, curr) => {
            const month = curr.date.toLocaleDateString('default', { month: 'short' });
            if (!acc[month]) acc[month] = { total: 0, scoreSum: 0, count: 0, promoters: 0, detractors: 0 };
            
            acc[month].total++;
            if (curr.score >= 9) acc[month].promoters++;
            if (curr.score <= 6) acc[month].detractors++;
            
            return acc;
        }, {} as Record<string, TrendData>);

        return Object.entries(groups).map(([month, data]: [string, TrendData]) => ({
            name: month,
            nps: Math.round(((data.promoters - data.detractors) / data.total) * 100)
        })); // Simplified trend logic
    }, [npsResponses]);

    const npsDistribution = [
        { name: 'Detractors (0-6)', value: npsMetrics.detractors },
        { name: 'Passives (7-8)', value: npsMetrics.passives },
        { name: 'Promoters (9-10)', value: npsMetrics.promoters },
    ];


    // --- CSAT Metrics ---
    const csatMetrics = useMemo(() => {
        const total = csatResponses.length;
        const sum = csatResponses.reduce((acc, r) => acc + r.rating, 0);
        const avg = total > 0 ? (sum / total).toFixed(1) : '0.0';
        
        const distribution = [0, 0, 0, 0, 0]; // 1 to 5
        csatResponses.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
        });

        return { total, avg, distribution };
    }, [csatResponses]);

    const csatDistributionData = csatMetrics.distribution.map((count, index) => ({
        name: `${index + 1} Star`,
        value: count
    }));

    return (
        <div className="space-y-6">
            {/* Toggle Tabs */}
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('NPS')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'NPS' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    Net Promoter Score (NPS)
                </button>
                <button
                    onClick={() => setActiveTab('CSAT')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'CSAT' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    Customer Satisfaction (CSAT)
                </button>
            </div>

            {activeTab === 'NPS' && (
                <div className="animate-fade-in-up space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="md:col-span-2 bg-slate-900 text-white border-none">
                            <CardContent className="flex flex-col justify-center items-center h-full p-8">
                                <h3 className="text-lg font-medium opacity-80 mb-2">Current NPS Score</h3>
                                <div className="text-6xl font-bold mb-4">{npsMetrics.npsScore}</div>
                                <div className="flex space-x-6 text-sm">
                                    <div className="text-center">
                                        <span className="block font-bold text-green-400">{npsMetrics.promoters}</span>
                                        <span className="opacity-70">Promoters</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-yellow-400">{npsMetrics.passives}</span>
                                        <span className="opacity-70">Passives</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-red-400">{npsMetrics.detractors}</span>
                                        <span className="opacity-70">Detractors</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="md:col-span-2">
                            <CardHeader><h3 className="font-semibold text-slate-700">NPS Distribution</h3></CardHeader>
                            <CardContent className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={npsDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {npsDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={NPS_COLORS[index]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><h3 className="font-semibold text-slate-700">NPS Trend (Last 6 Months)</h3></CardHeader>
                        <CardContent className="h-72">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={npsTrend}>
                                    <defs>
                                        <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="nps" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNps)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <h3 className="text-lg font-bold text-slate-800 mt-8">Recent Tenant Feedback</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {npsResponses.slice(0, 6).map(response => (
                            <div key={response.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-slate-700">{response.tenantName}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        response.score >= 9 ? 'bg-green-100 text-green-800' :
                                        response.score >= 7 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        Score: {response.score}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm italic">"{response.feedback}"</p>
                                <p className="text-xs text-slate-400 mt-2">{response.date.toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'CSAT' && (
                <div className="animate-fade-in-up space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="md:col-span-1">
                            <CardContent className="flex flex-col justify-center items-center h-full p-6 text-center">
                                <h3 className="text-sm font-medium text-slate-500 mb-1">Average Rating</h3>
                                <div className="text-5xl font-bold text-slate-800 mb-2">{csatMetrics.avg}</div>
                                <div className="flex text-yellow-400 text-xl">
                                    {'★'.repeat(Math.round(Number(csatMetrics.avg)))}
                                    <span className="text-slate-200">{'★'.repeat(5 - Math.round(Number(csatMetrics.avg)))}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Based on {csatMetrics.total} responses</p>
                            </CardContent>
                        </Card>
                        <Card className="md:col-span-3">
                            <CardHeader><h3 className="font-semibold text-slate-700">Rating Distribution</h3></CardHeader>
                             <CardContent className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={csatDistributionData} layout="vertical">
                                        <XAxis type="number" stroke="#94a3b8" />
                                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {csatDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mt-8">Recent Ticket Feedback</h3>
                    <div className="space-y-4">
                        {csatResponses.slice(0, 5).map(response => (
                            <div key={response.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-600">
                                        {response.rating}★
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-slate-800 text-sm">{response.ticketId} <span className="text-slate-400 font-normal">| {response.category}</span></h4>
                                        <span className="text-xs text-slate-500">{response.date.toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-1">{response.comment}</p>
                                    <p className="text-xs text-slate-400 mt-2">Technician: {response.technicianName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};