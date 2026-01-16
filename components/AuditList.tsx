
import React, { useState, useMemo } from 'react';
import type { Audit } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface AuditListProps {
    audits: Audit[];
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const AuditList: React.FC<AuditListProps> = ({ audits }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredAudits = useMemo(() => {
        return audits.filter(a => {
            const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                                  a.auditId.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === '' || a.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [audits, search, statusFilter]);

    const stats = useMemo(() => {
        const completed = audits.filter(a => a.status === 'Completed');
        const avgScore = completed.length > 0 
            ? completed.reduce((acc, a) => acc + (a.score || 0), 0) / completed.length 
            : 0;
        return {
            total: audits.length,
            scheduled: audits.filter(a => a.status === 'Scheduled').length,
            avgScore: Math.round(avgScore)
        };
    }, [audits]);

    const getScoreColor = (score?: number) => {
        if (score === undefined) return 'bg-gray-100 text-gray-400';
        if (score >= 90) return 'bg-green-100 text-green-700';
        if (score >= 75) return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-slate-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Scheduled Audits</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.scheduled}</p>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-full text-slate-600">
                             <CalendarIcon />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-brand-primary">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Avg. Compliance Score</p>
                            <p className="text-2xl font-bold text-brand-primary">{stats.avgScore}%</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-full text-brand-primary">
                             <ChartPieIcon />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-green-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Audits Completed</p>
                            <p className="text-2xl font-bold text-green-600">{audits.length - stats.scheduled}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-full text-green-600">
                             <ClipboardCheckIcon />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Compliance Audit Log</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input 
                            type="text" 
                            placeholder="Search Audits..." 
                            className={filterInputStyle}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                         <select 
                            className={filterInputStyle}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Audit ID</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Scope</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3">Non-Conformance</th>
                                    <th className="px-6 py-3">Observations</th>
                                    <th className="px-6 py-3">Buildings Covered</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAudits.map(audit => (
                                    <tr key={audit.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{audit.auditId}</td>
                                        <td className="px-6 py-4 text-sm">{audit.type}</td>
                                        <td className="px-6 py-4 text-sm">{audit.scope || '—'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                audit.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                audit.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {audit.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {audit.score !== undefined ? (
                                                <div className="flex items-center">
                                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${getScoreColor(audit.score)}`}>
                                                        {audit.score}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {audit.nonConformanceItems && audit.nonConformanceItems.length > 0 ? (
                                                <span className="text-red-600 font-bold">{audit.nonConformanceItems.length}</span>
                                            ) : (
                                                <span className="text-green-600 font-bold">0</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {audit.auditObservations && audit.auditObservations.length > 0 ? (
                                                <span className="text-orange-600">{audit.auditObservations.length}</span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {audit.buildingCovered ? (
                                                <span className="text-slate-600">{Array.isArray(audit.buildingCovered) ? audit.buildingCovered.join(', ') : audit.buildingCovered}</span>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredAudits.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-6 text-slate-400">No audits found.</td>
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

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ChartPieIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

const ClipboardCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);
