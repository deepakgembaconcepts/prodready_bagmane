
import React, { useMemo } from 'react';
import type { ESGMetric } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface ESGDashboardProps {
    data: ESGMetric[];
}

export const ESGDashboard: React.FC<ESGDashboardProps> = ({ data }) => {
    
    const totals = useMemo(() => {
        return data.reduce((acc, curr) => {
            acc.electricity += curr.electricityConsumption;
            acc.water += curr.waterConsumption;
            acc.waste += curr.wasteGenerated;
            acc.carbon += curr.carbonFootprint;
            return acc;
        }, { electricity: 0, water: 0, waste: 0, carbon: 0 });
    }, [data]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-green-600 rounded-lg shadow-lg text-white mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Sustainability Dashboard</h2>
                        <p className="opacity-90">Tracking our environmental impact and carbon footprint reduction goals.</p>
                    </div>
                    <div className="text-right">
                         <p className="text-sm opacity-80">Total Carbon Footprint (YTD)</p>
                         <p className="text-4xl font-bold">{Math.round(totals.carbon / 1000)} <span className="text-lg font-normal">tonnes CO2e</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full border-t-4 border-yellow-400">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Energy Consumption</p>
                                <h3 className="text-2xl font-bold text-slate-800">{(totals.electricity / 1000).toFixed(1)} MWh</h3>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                                <LightningIcon />
                            </div>
                        </div>
                        <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <Area type="monotone" dataKey="electricityConsumption" stroke="#EAB308" fill="#FEF9C3" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full border-t-4 border-blue-400">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Water Usage</p>
                                <h3 className="text-2xl font-bold text-slate-800">{totals.water.toLocaleString()} KL</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                                <DropIcon />
                            </div>
                        </div>
                         <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <Area type="monotone" dataKey="waterConsumption" stroke="#3B82F6" fill="#DBEAFE" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardContent className="p-4 flex flex-col justify-between h-full border-t-4 border-emerald-500">
                        <div className="flex justify-between items-start mb-4">
                             <div>
                                <p className="text-sm text-slate-500 font-medium">Waste Generated</p>
                                <h3 className="text-2xl font-bold text-slate-800">{(totals.waste / 1000).toFixed(1)} Tonnes</h3>
                            </div>
                            <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                                <TrashIcon />
                            </div>
                        </div>
                         <div className="h-24">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <Area type="monotone" dataKey="wasteGenerated" stroke="#10B981" fill="#D1FAE5" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Carbon Footprint Trend</h3>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="carbonFootprint" stroke="#059669" fillOpacity={1} fill="url(#colorCarbon)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <h3 className="text-lg font-semibold text-slate-800">Monthly Resource Consumption</h3>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" orientation="left" stroke="#EAB308" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="right" orientation="right" stroke="#3B82F6" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="electricityConsumption" name="Electricity (kWh)" fill="#EAB308" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="waterConsumption" name="Water (KL)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const LightningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const DropIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);