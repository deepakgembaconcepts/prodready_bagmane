import React, { useState, useMemo } from 'react';
import type { WorkPermit } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface WorkPermitApprovalDashboardProps {
    permits: WorkPermit[];
    onApprove?: (permitId: string) => void;
    onReject?: (permitId: string, reason: string) => void;
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const WorkPermitApprovalDashboard: React.FC<WorkPermitApprovalDashboardProps> = ({
    permits,
    onApprove,
    onReject
}) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [search, setSearch] = useState('');
    const [selectedPermit, setSelectedPermit] = useState<WorkPermit | null>(null);
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const filteredPermits = useMemo(() => {
        let filtered = permits.filter(p => {
            const matchesSearch = p.description.toLowerCase().includes(search.toLowerCase()) ||
                p.permitId.toLowerCase().includes(search.toLowerCase()) ||
                (p.vendor?.toLowerCase().includes(search.toLowerCase()) || false);

            if (activeTab === 'pending') return matchesSearch && p.status === 'Pending';
            if (activeTab === 'approved') return matchesSearch && p.status === 'Approved';
            if (activeTab === 'rejected') return matchesSearch && p.status === 'Rejected';
            return matchesSearch;
        });

        return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    }, [permits, activeTab, search]);

    const getRiskColor = (type: string) => {
        switch (type) {
            case 'Hot Work': return 'bg-red-100 text-red-800';
            case 'Height Work': return 'bg-orange-100 text-orange-800';
            case 'Confined Space': return 'bg-purple-100 text-purple-800';
            case 'Electrical': return 'bg-yellow-100 text-yellow-800';
            case 'Excavation': return 'bg-indigo-100 text-indigo-800';
            case 'Lifting and Hoisting': return 'bg-blue-100 text-blue-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Approved': return 'bg-green-100 text-green-800 border-green-300';
            case 'Active': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Completed': return 'bg-slate-100 text-slate-800 border-slate-300';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    const getDaysRemaining = (endDate: Date) => {
        const today = new Date();
        const end = new Date(endDate);
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleApprove = () => {
        if (selectedPermit && onApprove) {
            onApprove(selectedPermit.id);
            setSelectedPermit(null);
        }
    };

    const handleReject = () => {
        if (selectedPermit && onReject && rejectionReason.trim()) {
            onReject(selectedPermit.id, rejectionReason);
            setSelectedPermit(null);
            setRejectionReason('');
            setShowRejectForm(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Work Permit Approval Dashboard</h2>
                        <p className="text-sm text-slate-600 mt-1">Admin review and approval of work permits</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                    {[
                        { id: 'pending', label: '⏳ Pending Approval', count: permits.filter(p => p.status === 'Pending').length },
                        { id: 'approved', label: '✓ Approved', count: permits.filter(p => p.status === 'Approved').length },
                        { id: 'rejected', label: '✗ Rejected', count: permits.filter(p => p.status === 'Rejected').length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'text-brand-primary border-b-2 border-brand-primary'
                                    : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200">
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search by Permit ID, Description, Vendor..."
                    className={filterInputStyle}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Permits List */}
                <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto">
                    {filteredPermits.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-slate-600">No permits found in this category</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredPermits.map(permit => {
                            const daysRemaining = getDaysRemaining(permit.endDate);
                            const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
                            const isExpired = daysRemaining <= 0;

                            return (
                                <button
                                    key={permit.id}
                                    onClick={() => setSelectedPermit(permit)}
                                    className="w-full text-left"
                                >
                                    <Card
                                        className={`cursor-pointer transition-all hover:shadow-md ${selectedPermit?.id === permit.id ? 'ring-2 ring-brand-primary' : ''} ${isExpired ? 'border-red-300' : ''}`}
                                    >
                                        <CardContent className="pt-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(permit.type)}`}>
                                                        {permit.type}
                                                    </span>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusColor(permit.status)}`}>
                                                        {permit.status}
                                                    </span>
                                                    {isExpiringSoon && (
                                                        <span className="text-xs font-medium px-2 py-1 rounded bg-orange-100 text-orange-800">
                                                            ⚠️ Expiring Soon
                                                        </span>
                                                    )}
                                                    {isExpired && (
                                                        <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-800">
                                                            ✗ Expired
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-slate-800 mb-1">{permit.description}</h4>
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {permit.permitId} • {permit.location}
                                                </p>
                                                <div className="flex gap-2 flex-wrap text-xs">
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                        🏢 {permit.vendor}
                                                    </span>
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                        📅 {new Date(permit.startDate).toLocaleDateString()} - {new Date(permit.endDate).toLocaleDateString()}
                                                    </span>
                                                    {permit.jsaVerified && (
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                                                            ✓ JSA Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right text-xs text-slate-500">
                                                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                                            </div>
                                        </div>
                                    </CardContent>
                                    </Card>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Right: Approval Panel */}
                <div className="lg:col-span-1">
                    {selectedPermit ? (
                        <Card className="sticky top-0 h-fit max-h-[70vh] overflow-y-auto">
                            <CardHeader className="pb-3 border-b">
                                <h4 className="font-semibold text-slate-800">{selectedPermit.description}</h4>
                                <p className="text-xs text-slate-600 mt-1">{selectedPermit.permitId}</p>
                            </CardHeader>

                            <CardContent className="pt-4 space-y-4">
                                {/* Permit Details */}
                                <div className="space-y-3 text-sm">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Permit Type</p>
                                        <p className="text-slate-600">{selectedPermit.type}</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Location</p>
                                        <p className="text-slate-600">{selectedPermit.location}</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Vendor</p>
                                        <p className="text-slate-600">{selectedPermit.vendor}</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Validity Period</p>
                                        <p className="text-slate-600">
                                            {new Date(selectedPermit.startDate).toLocaleDateString()} - {new Date(selectedPermit.endDate).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {selectedPermit.approver && (
                                        <div className="bg-slate-50 p-3 rounded-lg">
                                            <p className="text-xs font-semibold text-slate-700 uppercase">Current Approver</p>
                                            <p className="text-slate-600">{selectedPermit.approver}</p>
                                        </div>
                                    )}
                                </div>

                                {/* JSA Verification Status */}
                                <div className="border-t pt-3">
                                    <p className="text-xs font-semibold text-slate-700 uppercase mb-2">JSA Verification</p>
                                    <div className={`p-3 rounded-lg border ${selectedPermit.jsaVerified ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                        <p className={selectedPermit.jsaVerified ? 'text-green-800 font-medium' : 'text-yellow-800 font-medium'}>
                                            {selectedPermit.jsaVerified ? '✓ JSA Verified' : '⚠️ Pending JSA Verification'}
                                        </p>
                                    </div>
                                </div>

                                {/* Approval Actions */}
                                {selectedPermit.status === 'Pending' && (
                                    <div className="border-t pt-3 space-y-2">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Admin Actions</p>

                                        {!showRejectForm ? (
                                            <>
                                                <button
                                                    onClick={handleApprove}
                                                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                                >
                                                    <span>✓</span> Approve Permit
                                                </button>
                                                <button
                                                    onClick={() => setShowRejectForm(true)}
                                                    className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                                                >
                                                    <span>✗</span> Reject Permit
                                                </button>
                                            </>
                                        ) : (
                                            <div className="space-y-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                <p className="text-sm font-medium text-red-900">Provide Rejection Reason</p>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    placeholder="Reason for rejection..."
                                                    rows={3}
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowRejectForm(false);
                                                            setRejectionReason('');
                                                        }}
                                                        className="flex-1 px-3 py-2 bg-slate-300 text-slate-800 rounded-lg hover:bg-slate-400 font-medium text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleReject}
                                                        disabled={!rejectionReason.trim()}
                                                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 font-medium text-sm"
                                                    >
                                                        Confirm Rejection
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Approved Status */}
                                {selectedPermit.status === 'Approved' && (
                                    <div className="border-t pt-3 bg-green-50 p-3 rounded-lg border border-green-200">
                                        <p className="text-green-800 font-medium">✓ Approved by Admin</p>
                                        <p className="text-xs text-green-700 mt-1">This permit has been approved and is ready for use.</p>
                                    </div>
                                )}

                                {/* Rejected Status */}
                                {selectedPermit.status === 'Rejected' && (
                                    <div className="border-t pt-3 bg-red-50 p-3 rounded-lg border border-red-200">
                                        <p className="text-red-800 font-medium">✗ Rejected</p>
                                        <p className="text-xs text-red-700 mt-1">This permit has been rejected by admin and cannot be used.</p>
                                    </div>
                                )}

                                {/* View Full Details Button */}
                                <button className="w-full px-3 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary/5 font-medium text-sm">
                                    📄 View Full Permit
                                </button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8 text-slate-600">
                                <p>Select a permit to review and approve</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
