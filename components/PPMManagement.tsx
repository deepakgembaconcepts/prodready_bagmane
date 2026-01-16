
import React, { useState, useMemo, useCallback } from 'react';
import type { Asset } from '../types';
import { AssetStatus } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';

interface PPMManagementProps {
    assets: Asset[];
    onUpdateAsset?: (assetId: number, updates: Partial<Asset>) => void;
}

export const PPMManagement: React.FC<PPMManagementProps> = ({ assets = [], onUpdateAsset }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [simulatingId, setSimulatingId] = useState<number | null>(null);
    const [completedPPMs, setCompletedPPMs] = useState<Set<number>>(new Set());
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [scheduledDate, setScheduledDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isReschedule, setIsReschedule] = useState(false);
    const today = new Date();
    
    // Sort assets by next maintenance date
    const sortedAssets = useMemo(() => {
        return [...(assets || [])].filter(a => a && a.id).sort((a, b) => {
            const dateA = a?.nextMaintenanceDate || new Date();
            const dateB = b?.nextMaintenanceDate || new Date();
            return dateA.getTime() - dateB.getTime();
        });
    }, [assets]);

    const getDueStatus = (date: Date) => {
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-700 border-red-200' };
        if (diffDays <= 7) return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
        return { label: 'Upcoming', color: 'bg-green-100 text-green-700 border-green-200' };
    };

    const stats = useMemo(() => {
        let overdue = 0;
        let dueSoon = 0;
        let upcoming = 0;

        sortedAssets.forEach(asset => {
            if (!asset || !asset.id || completedPPMs.has(asset.id)) return; // Skip completed or invalid
            const maintenanceDate = asset.nextMaintenanceDate || new Date();
            const status = getDueStatus(maintenanceDate).label;
            if (status === 'Overdue') overdue++;
            else if (status === 'Due Soon') dueSoon++;
            else upcoming++;
        });

        return { overdue, dueSoon, upcoming, completed: completedPPMs.size };
    }, [sortedAssets, completedPPMs]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            setUploadSuccess(false);
            // Simulate processing delay
            setTimeout(() => {
                setUploading(false);
                setUploadSuccess(true);
                // In a real app, this would parse Excel/JSON and update the DB
                setTimeout(() => setUploadSuccess(false), 3000);
            }, 2000);
        }
    };

    const simulateWorkCompletion = useCallback((assetId: number) => {
        setSimulatingId(assetId);
        // Simulate work progress
        setTimeout(() => {
            const asset = assets?.find(a => a && a.id === assetId);
            if (asset && asset.id) {
                // Mark as completed
                setCompletedPPMs(prev => new Set(prev).add(assetId));
                
                // Schedule next maintenance for 30 days from now
                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + 30);
                
                if (onUpdateAsset) {
                    onUpdateAsset(assetId, { nextMaintenanceDate: nextDate });
                }
            }
            setSimulatingId(null);
        }, 2000);
    }, [assets, onUpdateAsset]);

    const rescheduleWork = useCallback((assetId: number, days: number) => {
        const asset = assets?.find(a => a && a.id === assetId);
        if (asset && asset.id) {
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + days);
            
            if (onUpdateAsset) {
                onUpdateAsset(assetId, { nextMaintenanceDate: newDate });
            }
        }
    }, [assets, onUpdateAsset]);

    const openScheduleModal = (assetId?: number, reschedule = false) => {
        setSelectedAssetId(assetId || null);
        setIsReschedule(reschedule);
        setScheduledDate(new Date().toISOString().split('T')[0]);
        setIsScheduleModalOpen(true);
    };

    const handleScheduleSave = () => {
        if (!selectedAssetId) return;
        
        const newDate = new Date(scheduledDate);
        if (onUpdateAsset) {
            onUpdateAsset(selectedAssetId, { nextMaintenanceDate: newDate });
        }
        
        setIsScheduleModalOpen(false);
        setSelectedAssetId(null);
    };

    const selectedAsset = assets?.find(a => a && a.id === selectedAssetId);

    return (
        <div className="space-y-6">
            <div className="flex justify-end space-x-4">
                 <div className="relative">
                    <input 
                        type="file" 
                        id="checklist-upload" 
                        className="hidden" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    <label 
                        htmlFor="checklist-upload"
                        className={`flex items-center space-x-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-medium py-2 px-4 rounded-lg shadow-sm cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {uploading ? (
                            <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        )}
                        <span>{uploading ? 'Processing...' : 'Upload Offline Checklist'}</span>
                    </label>
                    {uploadSuccess && (
                        <div className="absolute top-12 right-0 bg-green-100 border border-green-200 text-green-800 text-sm px-3 py-1 rounded shadow-md whitespace-nowrap animate-fade-in-up">
                            Checklist uploaded successfully!
                        </div>
                    )}
                </div>
                <button 
                    onClick={() => openScheduleModal(null, false)}
                    className="flex items-center space-x-2 bg-brand-primary text-white font-medium py-2 px-4 rounded-lg shadow hover:bg-brand-secondary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Schedule PPM</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between border-l-4 border-red-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Overdue PPMs</p>
                            <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
                        </div>
                        <CalendarIcon className="text-red-200" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between border-l-4 border-yellow-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Due This Week</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.dueSoon}</p>
                        </div>
                        <ClockIcon className="text-yellow-200" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between border-l-4 border-green-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Upcoming</p>
                            <p className="text-3xl font-bold text-green-600">{stats.upcoming}</p>
                        </div>
                         <CalendarCheckIcon className="text-green-200" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between border-l-4 border-blue-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Completed</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
                        </div>
                        <CompletedIcon className="text-blue-200" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Maintenance Schedule</h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Asset</th>
                                    <th className="px-6 py-3">Location</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAssets.map(asset => {
                                    if (completedPPMs.has(asset.id)) return null; // Hide completed
                                    const status = getDueStatus(asset.nextMaintenanceDate);
                                    const isSimulating = simulatingId === asset.id;
                                    return (
                                        <tr key={asset.id} className="bg-white border-b hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{asset.name}</div>
                                                <div className="text-xs text-slate-400">{asset.assetId}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-slate-700">{asset.building}</div>
                                                <div className="text-xs text-slate-400">{asset.location}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {asset.nextMaintenanceDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 space-x-2">
                                                <button 
                                                    onClick={() => simulateWorkCompletion(asset.id)}
                                                    disabled={isSimulating}
                                                    className={`font-medium px-3 py-1 rounded text-white text-sm transition-colors ${
                                                        isSimulating 
                                                            ? 'bg-slate-400 cursor-not-allowed' 
                                                            : 'bg-green-500 hover:bg-green-600'
                                                    }`}
                                                >
                                                    {isSimulating ? (
                                                        <span className="flex items-center space-x-1">
                                                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            <span>Working...</span>
                                                        </span>
                                                    ) : (
                                                        'Complete Work'
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => openScheduleModal(asset.id, true)}
                                                    className="font-medium px-3 py-1 rounded text-slate-600 border border-slate-300 hover:bg-slate-100 text-sm transition-colors"
                                                >
                                                    Reschedule
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule/Reschedule Modal */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">
                                {isReschedule ? 'Reschedule Maintenance' : 'Schedule PPM'}
                            </h2>
                            <button 
                                onClick={() => setIsScheduleModalOpen(false)} 
                                className="text-2xl text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Asset Selection */}
                            {!isReschedule && (
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Select Asset *
                                    </label>
                                    <select
                                        value={selectedAssetId || ''}
                                        onChange={(e) => setSelectedAssetId(Number(e.target.value) || null)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Select an asset --</option>
                                        {assets?.filter(a => a && a.id).map(asset => (
                                            <option key={asset.id} value={asset.id}>
                                                {asset.name} ({asset.assetId}) - {asset.building}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Auto-filled Asset Details */}
                            {selectedAsset && (
                                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                                    <h3 className="font-semibold text-slate-800 mb-3">Asset Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Asset Name</label>
                                            <p className="text-slate-900 font-medium mt-1">{selectedAsset.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Asset ID</label>
                                            <p className="text-slate-900 font-medium mt-1">{selectedAsset.assetId}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Category</label>
                                            <p className="text-slate-900 font-medium mt-1">{selectedAsset.category}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Building</label>
                                            <p className="text-slate-900 font-medium mt-1">{selectedAsset.building}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Location</label>
                                            <p className="text-slate-900 font-medium mt-1">{selectedAsset.location}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Current Status</label>
                                            <p className="text-slate-900 font-medium mt-1">{selectedAsset.status}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Maintenance Details */}
                            {selectedAsset && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600 uppercase">Maintenance Policy</label>
                                        <p className="text-slate-900 font-medium mt-1">{selectedAsset.maintenancePolicy || 'N/A'}</p>
                                    </div>
                                    {isReschedule && (
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600 uppercase">Previous Due Date</label>
                                            <p className="text-slate-900 font-medium mt-1">
                                                {selectedAsset.nextMaintenanceDate?.toLocaleDateString() || 'N/A'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Due Date *
                                </label>
                                <input
                                    type="date"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-slate-600 mt-1">Select the date when this maintenance should be performed</p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    placeholder="Add any notes or instructions for this maintenance..."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-slate-200 bg-slate-50 p-6 flex gap-3 justify-end">
                            <button
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="px-6 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleSave}
                                disabled={!selectedAssetId || !scheduledDate}
                                className={`px-6 py-2 text-white font-medium rounded-lg transition-colors ${
                                    selectedAssetId && scheduledDate
                                        ? 'bg-blue-600 hover:bg-blue-700'
                                        : 'bg-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isReschedule ? 'Update Schedule' : 'Schedule Maintenance'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CalendarCheckIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const CompletedIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
