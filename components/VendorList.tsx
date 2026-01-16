
import React, { useState, useMemo } from 'react';
import type { Vendor } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface VendorListProps {
    vendors: Vendor[];
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const VendorList: React.FC<VendorListProps> = ({ vendors }) => {
    const [filter, setFilter] = useState({ search: '', status: '' });

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const matchesSearch = filter.search === '' || 
                v.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                v.serviceCategory.toLowerCase().includes(filter.search.toLowerCase());
            const matchesStatus = filter.status === '' || v.status === filter.status;
            return matchesSearch && matchesStatus;
        });
    }, [vendors, filter]);

    return (
        <>
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">Vendor Master List</h3>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="Search Vendors or Services..." 
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
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th className="px-6 py-3">Vendor Name</th>
                                <th className="px-6 py-3">Service Category</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Contract Expiry</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.map(vendor => (
                                <tr key={vendor.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        {vendor.name}
                                        <div className="text-xs text-slate-400">{vendor.vendorId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{vendor.serviceCategory}</td>
                                    <td className="px-6 py-4 text-xs">
                                        <div>{vendor.contactPerson}</div>
                                        <div className="text-slate-400">{vendor.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{vendor.contractExpiry.toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${vendor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredVendors.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-slate-400">No vendors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
        </>
    );
};

