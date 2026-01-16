import React, { useState, useMemo } from 'react';
import type { JSA } from '../services/jsaService';
import { JSAService } from '../services/jsaService';
import { Card, CardContent, CardHeader } from './ui/Card';

interface JSAListProps {
    jsas: JSA[];
    onJSASelect?: (jsa: JSA) => void;
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const JSADashboard: React.FC<JSAListProps> = ({ jsas, onJSASelect }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [selectedJSA, setSelectedJSA] = useState<JSA | null>(null);
    const [approvalLevel, setApprovalLevel] = useState<'L1' | 'L2' | 'L3'>('L1');

    const filteredJSAs = useMemo(() => {
        let filtered = jsas.filter(j => {
            const matchesSearch = j.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
                j.jsaId.toLowerCase().includes(search.toLowerCase()) ||
                j.workLocation.toLowerCase().includes(search.toLowerCase());

            if (activeTab === 'all') return matchesSearch;
            if (activeTab === 'active') return matchesSearch && j.isActive && j.status === 'Approved';
            if (activeTab === 'pending') return matchesSearch && (j.status === 'Submitted' || j.status === 'L1 Approved' || j.status === 'L2 Approved');
            if (activeTab === 'rejected') return matchesSearch && j.status === 'Rejected';
            return matchesSearch;
        });

        return filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    }, [jsas, activeTab, search]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Draft': return 'bg-slate-100 text-slate-800';
            case 'Submitted': return 'bg-blue-100 text-blue-800';
            case 'L1 Approved': return 'bg-cyan-100 text-cyan-800';
            case 'L2 Approved': return 'bg-purple-100 text-purple-800';
            case 'Approved': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Draft': return '📝';
            case 'Submitted': return '📤';
            case 'L1 Approved': return '✓';
            case 'L2 Approved': return '✓✓';
            case 'Approved': return '✓✓✓';
            case 'Rejected': return '✗';
            default: return '•';
        }
    };

    const getRiskColor = (riskScore: number) => {
        if (riskScore >= 9) return 'text-red-600 bg-red-50 border-red-200';
        if (riskScore >= 6) return 'text-orange-600 bg-orange-50 border-orange-200';
        if (riskScore >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const getRiskBadge = (riskScore: number) => {
        if (riskScore >= 9) return 'CRITICAL';
        if (riskScore >= 6) return 'HIGH';
        if (riskScore >= 4) return 'MEDIUM';
        return 'LOW';
    };

    return (
        <div className="space-y-6">
            {/* Header with Tabs */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">Job Safety Analysis (JSA) Module</h2>
                    <div className="flex gap-2 flex-wrap">
                        <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 font-medium">
                            + Create New JSA
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200">
                    {[
                        { id: 'all', label: '📋 All JSAs', count: jsas.length },
                        { id: 'active', label: '✓ Active', count: jsas.filter(j => j.isActive && j.status === 'Approved').length },
                        { id: 'pending', label: '⏳ Pending Review', count: jsas.filter(j => j.status === 'Submitted' || j.status === 'L1 Approved' || j.status === 'L2 Approved').length },
                        { id: 'rejected', label: '✗ Rejected', count: jsas.filter(j => j.status === 'Rejected').length }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 font-medium transition-all relative ${
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

            {/* Search Bar */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Search by Job Title, JSA ID, or Location..."
                    className={filterInputStyle}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: JSA List */}
                <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto">
                    {filteredJSAs.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-slate-600">No JSAs found in this category</p>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredJSAs.map(jsa => (
                            <Card
                                key={jsa.id}
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedJSA?.id === jsa.id ? 'ring-2 ring-brand-primary' : ''}`}
                                onClick={() => setSelectedJSA(jsa)}
                            >
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-slate-800">{jsa.jobTitle}</h3>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(jsa.status)}`}>
                                                    {getStatusIcon(jsa.status)} {jsa.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">
                                                {jsa.jsaId} • {jsa.workLocation}
                                            </p>
                                            <div className="flex gap-2 flex-wrap">
                                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                    📍 {jsa.department}
                                                </span>
                                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                    👤 {jsa.createdBy}
                                                </span>
                                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                    ⚠️ {jsa.hazards.length} hazards
                                                </span>
                                                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                    🛡️ {jsa.requiredPPE.length} PPE items
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-slate-500">
                                            {new Date(jsa.createdDate).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Approval Chain */}
                                    {(jsa.status !== 'Draft' && jsa.status !== 'Rejected') && (
                                        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs">
                                            <span className={jsa.l1Approval ? 'text-green-600 font-bold' : 'text-slate-400'}>L1✓</span>
                                            <span className="text-slate-300">→</span>
                                            <span className={jsa.l2Approval ? 'text-green-600 font-bold' : 'text-slate-400'}>L2✓</span>
                                            <span className="text-slate-300">→</span>
                                            <span className={jsa.l3Approval ? 'text-green-600 font-bold' : 'text-slate-400'}>L3✓</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Right: Detail View & Approval Panel */}
                <div className="lg:col-span-1">
                    {selectedJSA ? (
                        <Card className="sticky top-0 h-fit max-h-[70vh] overflow-y-auto">
                            <CardHeader className="pb-3 border-b">
                                <h4 className="font-semibold text-slate-800">{selectedJSA.jobTitle}</h4>
                                <p className="text-xs text-slate-600 mt-1">{selectedJSA.jsaId}</p>
                            </CardHeader>

                            <CardContent className="pt-4 space-y-4">
                                {/* Summary */}
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Location</p>
                                        <p className="text-slate-600">{selectedJSA.workLocation}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Department</p>
                                        <p className="text-slate-600">{selectedJSA.department}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 uppercase">Valid Period</p>
                                        <p className="text-slate-600">
                                            {new Date(selectedJSA.validFrom).toLocaleDateString()} - {new Date(selectedJSA.validUntil).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Hazards & Control Measures (BDPL Format) */}
                                <div className="border-t pt-3">
                                    <p className="text-xs font-semibold text-slate-700 uppercase mb-3">Hazard & Consequence | Control Measures</p>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {selectedJSA.hazards.map((hazard) => {
                                            const measures = selectedJSA.controlMeasures.filter(m => m.hazardId === hazard.id);
                                            return (
                                                <div key={hazard.id} className={`border rounded-lg p-3 ${getRiskColor(hazard.riskScore)}`}>
                                                    <div className="mb-2">
                                                        <div className="flex justify-between items-start gap-2 mb-1">
                                                            <p className="font-bold text-sm">{getRiskBadge(hazard.riskScore)} RISK</p>
                                                            <span className="text-xs font-bold">S:{hazard.severity} × L:{hazard.likelihood} = {hazard.riskScore}</span>
                                                        </div>
                                                        <p className="font-medium text-sm">{hazard.description}</p>
                                                        <p className="text-xs opacity-75 mt-1">Potential Injury: {hazard.potentialInjury}</p>
                                                    </div>
                                                    {measures.length > 0 && (
                                                        <div className="border-t border-current opacity-30 pt-2 mt-2">
                                                            <p className="text-xs font-semibold mb-1">Control Measures:</p>
                                                            {measures.map((m) => (
                                                                <p key={m.id} className="text-xs mb-1 opacity-80">
                                                                    • {m.measure}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* PPE Requirements */}
                                <div className="border-t pt-3">
                                    <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Required PPE</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedJSA.requiredPPE.map((ppe, i) => (
                                            <span key={i} className={`text-xs px-2 py-1 rounded border ${ppe.isRequired ? 'bg-red-50 border-red-300 text-red-800 font-medium' : 'bg-slate-50 border-slate-300 text-slate-700'}`}>
                                                {ppe.isRequired ? '⚠️' : '•'} {ppe.equipment}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Emergency Procedures */}
                                {selectedJSA.emergencyProcedures && (
                                    <div className="border-t pt-3 bg-red-50 p-3 rounded border border-red-200">
                                        <p className="text-xs font-semibold text-red-800 uppercase mb-1">Emergency Procedures</p>
                                        <p className="text-xs text-red-700">{selectedJSA.emergencyProcedures}</p>
                                    </div>
                                )}

                                {/* Sign-off Section (BDPL Format) */}
                                {(selectedJSA.preparedBySignature || selectedJSA.checkedBySignature || selectedJSA.approvedBySignature) && (
                                    <div className="border-t pt-3">
                                        <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Sign-off</p>
                                        <div className="space-y-2 text-xs">
                                            {selectedJSA.preparedBySignature && (
                                                <div className="bg-slate-50 p-2 rounded">
                                                    <p className="font-semibold">Prepared by</p>
                                                    <p className="text-slate-600">{selectedJSA.preparedBySignature.name}</p>
                                                    <p className="text-slate-500">{selectedJSA.preparedBySignature.designation}</p>
                                                    <p className="text-slate-500">{new Date(selectedJSA.preparedBySignature.date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {selectedJSA.checkedBySignature && (
                                                <div className="bg-slate-50 p-2 rounded">
                                                    <p className="font-semibold">Checked by</p>
                                                    <p className="text-slate-600">{selectedJSA.checkedBySignature.name}</p>
                                                    <p className="text-slate-500">{selectedJSA.checkedBySignature.designation}</p>
                                                    <p className="text-slate-500">{new Date(selectedJSA.checkedBySignature.date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Approval Status */}
                                {selectedJSA.status !== 'Draft' && selectedJSA.status !== 'Rejected' && (
                                    <div className="border-t pt-3">
                                        <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Approval Status</p>
                                        <div className="space-y-2">
                                            {selectedJSA.l1Approval && (
                                                <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
                                                    <p className="font-medium text-green-800">✓ L1 Approved</p>
                                                    <p className="text-green-700">{selectedJSA.l1Approval.approvedBy}</p>
                                                    <p className="text-green-600">{new Date(selectedJSA.l1Approval.approvalDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {selectedJSA.l2Approval && (
                                                <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
                                                    <p className="font-medium text-green-800">✓ L2 Approved</p>
                                                    <p className="text-green-700">{selectedJSA.l2Approval.approvedBy}</p>
                                                    <p className="text-green-600">{new Date(selectedJSA.l2Approval.approvalDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                            {selectedJSA.l3Approval && (
                                                <div className="text-xs bg-green-50 p-2 rounded border border-green-200">
                                                    <p className="font-medium text-green-800">✓ L3 Approved (Final)</p>
                                                    <p className="text-green-700">{selectedJSA.l3Approval.approvedBy}</p>
                                                    <p className="text-green-600">{new Date(selectedJSA.l3Approval.approvalDate).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {selectedJSA.status === 'Rejected' && selectedJSA.rejectionReason && (
                                    <div className="border-t pt-3">
                                        <p className="text-xs font-semibold text-red-700 uppercase mb-2">Rejection Reason</p>
                                        <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                            {selectedJSA.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {/* Approval Actions (if pending) */}
                                {selectedJSA.status === 'Submitted' && (
                                    <div className="border-t pt-3 space-y-2">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">L1 Review Actions</p>
                                        <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium">
                                            ✓ Approve (L1)
                                        </button>
                                        <button className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium">
                                            ✗ Reject
                                        </button>
                                    </div>
                                )}

                                {selectedJSA.status === 'L1 Approved' && !selectedJSA.l2Approval && (
                                    <div className="border-t pt-3 space-y-2">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">L2 Review Actions</p>
                                        <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium">
                                            ✓ Approve (L2)
                                        </button>
                                        <button className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium">
                                            ✗ Reject
                                        </button>
                                    </div>
                                )}

                                {selectedJSA.status === 'L2 Approved' && !selectedJSA.l3Approval && (
                                    <div className="border-t pt-3 space-y-2">
                                        <p className="text-xs font-semibold text-slate-700 uppercase">L3 Final Review</p>
                                        <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 font-medium">
                                            ✓ Final Approve (L3)
                                        </button>
                                        <button className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium">
                                            ✗ Reject
                                        </button>
                                    </div>
                                )}

                                {/* View Details Button */}
                                <button className="w-full px-3 py-2 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary/5 font-medium text-sm mt-3">
                                    📄 View Full Details
                                </button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="text-center py-8 text-slate-600">
                                <p>Select a JSA to view details and approve</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};
