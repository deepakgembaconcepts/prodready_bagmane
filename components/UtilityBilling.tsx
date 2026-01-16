
import React, { useMemo, useState } from 'react';
import type { UtilityBill, UtilityReading } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface UtilityBillingProps {
    readings: UtilityReading[];
    bills: UtilityBill[];
}

const COLORS = ['#0ea5e9', '#3b82f6', '#1d4ed8'];

export const UtilityBilling: React.FC<UtilityBillingProps> = ({ readings, bills }) => {
    const [bescomBill, setBescomBill] = useState(0);
    const [tenantConsumption, setTenantConsumption] = useState(0);
    const [perUnitCharge, setPerUnitCharge] = useState(0);
    
    const calculateCharges = () => {
        if (bescomBill > 0 && tenantConsumption > 0) {
            const calculated = bescomBill / tenantConsumption;
            setPerUnitCharge(calculated);
        }
    };
    
    const stats = useMemo(() => {
        const totalRevenue = bills.reduce((acc, b) => acc + b.amount, 0);
        const outstanding = bills.filter(b => b.status === 'Overdue' || b.status === 'Sent').reduce((acc, b) => acc + b.amount, 0);
        const collected = totalRevenue - outstanding;
        const collectionPercentage = totalRevenue > 0 ? (collected / totalRevenue) * 100 : 0;
        
        return { totalRevenue, outstanding, collected, collectionPercentage };
    }, [bills]);

    const consumptionData = useMemo(() => {
        // Group by utility type
        const grouped = readings.reduce((acc, r) => {
            acc[r.utilityType] = (acc[r.utilityType] || 0) + r.consumption;
            return acc;
        }, {} as Record<string, number>);
        
        return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }, [readings]);

    const revenueByMonth = useMemo(() => {
        const grouped = bills.reduce((acc, b) => {
            acc[b.billingMonth] = (acc[b.billingMonth] || 0) + b.amount;
            return acc;
        }, {} as Record<string, number>);
        
        // Simple sort order for months
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return Object.entries(grouped)
            .map(([name, value]) => ({ name: name.substring(0, 3), value }))
            .sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
    }, [bills]);

    return (
        <div className="space-y-6">
            {/* Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-4 border-l-4 border-blue-600">
                         <p className="text-sm text-slate-500 font-medium">Total Revenue (YTD)</p>
                         <p className="text-2xl font-bold text-slate-800">₹{stats.totalRevenue.toLocaleString()}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 border-l-4 border-green-500">
                         <p className="text-sm text-slate-500 font-medium">Collected</p>
                         <p className="text-2xl font-bold text-green-600">₹{stats.collected.toLocaleString()}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 border-l-4 border-red-500">
                         <p className="text-sm text-slate-500 font-medium">Outstanding</p>
                         <p className="text-2xl font-bold text-red-600">₹{stats.outstanding.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 border-l-4 border-indigo-500">
                         <p className="text-sm text-slate-500 font-medium">Collection Efficiency</p>
                         <p className="text-2xl font-bold text-indigo-600">{Math.round(stats.collectionPercentage)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* Per Unit Charge Calculator */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Per Unit Charge Calculator</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">BESCOM Bill Amount (₹)</label>
                            <input
                                type="number"
                                value={bescomBill}
                                onChange={(e) => setBescomBill(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                placeholder="Enter BESCOM bill"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Tenant Consumption (Units)</label>
                            <input
                                type="number"
                                value={tenantConsumption}
                                onChange={(e) => setTenantConsumption(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                placeholder="Enter total units"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Calculated Per Unit (₹)</label>
                            <div className="flex">
                                <input
                                    type="number"
                                    value={perUnitCharge.toFixed(2)}
                                    readOnly
                                    className="w-full px-3 py-2 border border-slate-300 rounded-l-lg bg-slate-50"
                                />
                                <button
                                    onClick={calculateCharges}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                                >
                                    Calculate
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Verification Steps:</h4>
                        <ol className="text-sm text-slate-600 space-y-1">
                            <li>1. Enter the total BESCOM bill amount for the building</li>
                            <li>2. Enter the sum of all tenant consumptions for the period</li>
                            <li>3. Click Calculate to get the per unit charge</li>
                            <li>4. Verify the calculation matches expected rates</li>
                            <li>5. Generate tenant bills using this rate</li>
                        </ol>
                    </div>
                </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Monthly Revenue Trend</h3>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={revenueByMonth}>
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Recent Meter Readings</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-500">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Tenant</th>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Meter ID</th>
                                        <th className="px-4 py-2 text-right">Consumption</th>
                                        <th className="px-4 py-2">Verified</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {readings.slice(0, 5).map(reading => (
                                        <tr key={reading.id} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3">{reading.readingDate.toLocaleDateString()}</td>
                                            <td className="px-4 py-3">{reading.tenantName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                    reading.utilityType === 'Electricity' ? 'bg-yellow-100 text-yellow-800' :
                                                    reading.utilityType === 'Water' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {reading.utilityType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono text-slate-600">{reading.meterId || '—'}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                {reading.consumption} {reading.unit}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {reading.isVerified ? <span className="text-green-600">✓ Yes</span> : <span className="text-orange-600">⚠ No</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bills List */}
             <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Recent Invoices</h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Invoice ID</th>
                                    <th className="px-6 py-3">Tenant</th>
                                    <th className="px-6 py-3">Month</th>
                                    <th className="px-6 py-3">Utility Type</th>
                                    <th className="px-6 py-3 text-right">Amount (₹)</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map(bill => (
                                    <tr key={bill.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{bill.billId}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{bill.tenantName}</td>
                                        <td className="px-6 py-4">{bill.billingMonth}</td>
                                        <td className="px-6 py-4">{bill.utilityType}</td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-700">{bill.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                bill.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                                                bill.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{bill.dueDate.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};