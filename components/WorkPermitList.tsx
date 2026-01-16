
import React, { useState, useMemo } from 'react';
import type { WorkPermit } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface WorkPermitListProps {
    permits: WorkPermit[];
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const WorkPermitList: React.FC<WorkPermitListProps> = ({ permits }) => {
    const [activeTab, setActiveTab] = useState<'permits' | 'jsa'>('permits');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredPermits = useMemo(() => {
        return permits.filter(p => {
            const matchesSearch = p.description.toLowerCase().includes(search.toLowerCase()) || 
                                  p.permitId.toLowerCase().includes(search.toLowerCase()) ||
                                  p.vendor.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === '' || p.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [permits, search, statusFilter]);

    const stats = useMemo(() => {
        const total = permits.length;
        const active = permits.filter(p => p.status === 'Active').length;
        const pending = permits.filter(p => p.status === 'Pending').length;
        return { total, active, pending };
    }, [permits]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Active': return 'bg-green-100 text-green-800 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Approved': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
            case 'Completed': return 'bg-slate-100 text-slate-800 border-slate-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-slate-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Permits</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                         <div className="p-2 bg-slate-50 rounded-full text-slate-600">
                             <span className="text-2xl">📋</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-green-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active Permits</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                         <div className="p-2 bg-green-50 rounded-full text-green-600">
                             <span className="text-2xl">👷</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-yellow-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Pending Approval</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                         <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                             <span className="text-2xl">⏳</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('permits')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'permits' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    Permits Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('jsa')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'jsa' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    JSA Management
                </button>
            </div>

            {activeTab === 'permits' && (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Permit to Work (PTW) Register</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input 
                            type="text" 
                            placeholder="Search Permit ID, Vendor..." 
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
                            <option value="Active">Active</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPermits.map(permit => (
                            <div key={permit.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{permit.permitId}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(permit.status)}`}>
                                        {permit.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{permit.type}</h4>
                                <p className="text-xs text-slate-500 mb-3 h-8 overflow-hidden">{permit.description}</p>
                                
                                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-3">
                                    <div className="flex items-center">
                                        <span className="w-5 text-center mr-2">👷</span>
                                        <span className="text-xs"><strong>Contractor:</strong> {permit.contractorName || '—'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-5 text-center mr-2">🛡️</span>
                                        <span className="text-xs"><strong>JSA:</strong> {permit.jsaVerified ? '✓ Done' : '⚠ Pending'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-5 text-center mr-2">🧪</span>
                                        <span className="text-xs"><strong>Gas Test:</strong> {permit.gasTestResults ? '✓' : '⚠'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-5 text-center mr-2">⚠️</span>
                                        <span className="text-xs"><strong>Incident:</strong> {permit.incidentOccurred ? '⚠ Yes' : '✓ No'}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-5 text-center mr-2">🕒</span>
                                        <span className="text-xs">{permit.startDate.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                     {filteredPermits.length === 0 && (
                        <div className="text-center py-8 text-slate-400">No permits found.</div>
                    )}
                </CardContent>
            </Card>
            )}

            {activeTab === 'jsa' && (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">JSA Management</h3>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600">JSA (Job Safety Analysis) forms and management will be implemented here.</p>
                    <p className="text-sm text-slate-500 mt-2">JSA must be completed and saved before a Work Permit can be finalized.</p>
                </CardContent>
            </Card>
            )}
        </div>
    );
};
