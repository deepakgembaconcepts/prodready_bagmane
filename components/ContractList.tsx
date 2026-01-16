
import React, { useState, useMemo } from 'react';
import type { Contract } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

interface ContractListProps {
    contracts: Contract[];
}

export const ContractList: React.FC<ContractListProps> = ({ contracts }) => {
    const [activeTab, setActiveTab] = useState<'contracts' | 'vendors'>('contracts');
    const [filter, setFilter] = useState({ search: '', status: '' });

    const filteredContracts = useMemo(() => {
        return contracts.filter(c => {
            const matchesSearch = filter.search === '' || 
                c.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                c.vendorName.toLowerCase().includes(filter.search.toLowerCase());
            const matchesStatus = filter.status === '' || c.status === filter.status;
            return matchesSearch && matchesStatus;
        });
    }, [contracts, filter]);

    const stats = useMemo(() => {
        const total = contracts.length;
        const active = contracts.filter(c => c.status === 'Active').length;
        const expiring = contracts.filter(c => {
             const daysToExpiry = Math.ceil((c.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
             return daysToExpiry > 0 && daysToExpiry <= 60;
        }).length;
        return { total, active, expiring };
    }, [contracts]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Contracts</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-full text-slate-600">
                            <DocumentIcon />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Active Contracts</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <CheckBadgeIcon />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Expiring Soon (60 Days)</p>
                            <p className="text-2xl font-bold text-orange-500">{stats.expiring}</p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                            <ClockIcon />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('contracts')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'contracts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    Contracts
                </button>
            </div>

            {activeTab === 'contracts' && (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Contract Registry</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <input 
                            type="text" 
                            placeholder="Search Contracts or Vendors..." 
                            className={filterInputStyle}
                            value={filter.search}
                            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                        />
                         <select 
                            className={filterInputStyle}
                            value={filter.status}
                            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                        >
                            <option value="">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Renewing">Renewing</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Contract ID</th>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Vendor</th>
                                    <th className="px-6 py-3">Value</th>
                                    <th className="px-6 py-3">Expiry Date</th>
                                    <th className="px-6 py-3">Days Left</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContracts.map(contract => {
                                    const daysLeft = Math.ceil((contract.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                    const isExpired = daysLeft <= 0;
                                    // Determine actual status based on expiry
                                    const actualStatus = isExpired ? 'Expired' : contract.status;
                                    
                                    // Determine row highlight color based on contract expiry
                                    let rowBgColor = 'bg-white';
                                    if (isExpired || daysLeft < 30) {
                                        rowBgColor = 'bg-orange-50';
                                    }
                                    
                                    return (
                                        <tr key={contract.id} className={`${rowBgColor} border-b hover:opacity-80 transition-opacity`}>
                                            <td className="px-6 py-4 font-medium text-brand-primary">
                                                {contract.contractId}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {contract.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div>{contract.vendorName}</div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold">₹{contract.value.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {contract.endDate.toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    isExpired ? 'bg-red-100 text-red-800' :
                                                    daysLeft < 30 ? 'bg-red-100 text-red-800' :
                                                    daysLeft < 90 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {isExpired ? 'EXPIRED' : `${daysLeft}d`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    actualStatus === 'Expired' ? 'bg-red-100 text-red-800' :
                                                    actualStatus === 'Active' ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {actualStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredContracts.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-6 text-slate-400">No contracts found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            )}

        </div>
    );
};

const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CheckBadgeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
