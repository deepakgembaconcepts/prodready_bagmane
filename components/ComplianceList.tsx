
import React, { useState, useMemo } from 'react';
import type { ComplianceItem } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface ComplianceListProps {
    compliances: ComplianceItem[];
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const ComplianceList: React.FC<ComplianceListProps> = ({ compliances }) => {
    const [search, setSearch] = useState('');

    const filteredCompliances = useMemo(() => {
        return compliances.filter(c => 
            c.title.toLowerCase().includes(search.toLowerCase()) || 
            c.authority.toLowerCase().includes(search.toLowerCase())
        );
    }, [compliances, search]);

    const stats = useMemo(() => {
        const total = compliances.length;
        const compliant = compliances.filter(c => c.status === 'Compliant').length;
        const expiring = compliances.filter(c => c.status === 'Expiring Soon').length;
        const expired = compliances.filter(c => c.status === 'Expired' || c.status === 'Non-Compliant').length;
        
        const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;

        return { total, compliant, expiring, expired, percentage };
    }, [compliances]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Compliant': return 'bg-green-100 text-green-800';
            case 'Expiring Soon': return 'bg-yellow-100 text-yellow-800';
            case 'Expired':
            case 'Non-Compliant': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <Card>
                    <CardContent className="p-4 flex flex-col justify-center items-center h-full">
                        <div className="relative h-24 w-24">
                             <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                    className="text-slate-100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-brand-primary transition-all duration-1000 ease-out"
                                    strokeDasharray={`${stats.percentage}, 100`}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-bold text-slate-800">{stats.percentage}%</span>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-slate-500 mt-2">Overall Compliance</span>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-green-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Compliant</p>
                            <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-full text-green-600">
                             <CheckIcon />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-yellow-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Expiring Soon</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.expiring}</p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                             <ClockIcon />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-red-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Critical / Expired</p>
                            <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-full text-red-600">
                             <AlertIcon />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Statutory License & Compliance Register</h3>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <input 
                            type="text" 
                            placeholder="Search Regulation, Authority..." 
                            className={filterInputStyle}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Regulation / Title</th>
                                    <th className="px-6 py-3">Authority</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Days Left</th>
                                    <th className="px-6 py-3">Responsible Person</th>
                                    <th className="px-6 py-3">Renewal Cost</th>
                                    <th className="px-6 py-3">Renewal Vendor</th>
                                    <th className="px-6 py-3">Criticality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCompliances.map(item => {
                                    const now = new Date();
                                    const daysLeft = Math.ceil((item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
                                            <td className="px-6 py-4 text-sm">{item.authority}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold text-sm ${
                                                    daysLeft < 30 ? 'text-red-600' :
                                                    daysLeft < 90 ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`}>
                                                    {daysLeft > 0 ? `${daysLeft}d` : 'EXPIRED'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{item.responsiblePerson || '—'}</td>
                                            <td className="px-6 py-4 text-sm font-semibold">
                                                {item.renewalCost ? `₹${item.renewalCost.toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{item.renewalVendor || '—'}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    item.criticality === 'Critical' ? 'bg-red-100 text-red-800' :
                                                    item.criticality === 'High' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {item.criticality || 'Low'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredCompliances.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-6 text-slate-400">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AlertIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);
