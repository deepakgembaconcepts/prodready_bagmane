
import React, { useState, useMemo, useEffect } from 'react';
import type { Asset } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { AssetVerificationDashboard } from './AssetVerificationDashboard';

interface AssetVerificationProps {
    assets: Asset[];
    onUpdateAssetStatus?: (assetId: number, status: 'Operational' | 'In Maintenance' | 'Breakdown' | 'Standby' | 'Decommissioned') => void;
}

export const AssetVerification: React.FC<AssetVerificationProps> = ({ assets, onUpdateAssetStatus }) => {
    const [selectedBuilding, setSelectedBuilding] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedFloor, setSelectedFloor] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [showDashboard, setShowDashboard] = useState<boolean>(false);

    // Get unique buildings from assets
    const buildings = useMemo(() => {
        const uniqueBuildings = [...new Set(assets.map(a => a.building))].sort();
        return uniqueBuildings;
    }, [assets]);

    // Get unique categories from assets
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(assets.map(a => a.category))].sort();
        return uniqueCategories;
    }, [assets]);

    // Get unique floors for selected building
    const floors = useMemo(() => {
        if (!selectedBuilding) return [];
        const buildingAssets = assets.filter(a => a.building === selectedBuilding);
        const uniqueFloors = [...new Set(buildingAssets.map(a => a.floor))].filter(Boolean).sort();
        return uniqueFloors;
    }, [assets, selectedBuilding]);

    // Filter assets based on selections
    const filteredAssets = useMemo(() => {
        return assets.filter(a => {
            const matchesBuilding = !selectedBuilding || a.building === selectedBuilding;
            const matchesCategory = !selectedCategory || a.category === selectedCategory;
            const matchesFloor = !selectedFloor || a.floor === selectedFloor;
            const matchesStatus = !filterStatus || a.status === filterStatus;
            return matchesBuilding && matchesCategory && matchesFloor && matchesStatus;
        });
    }, [assets, selectedBuilding, selectedCategory, selectedFloor, filterStatus]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = filteredAssets.length;
        const operational = filteredAssets.filter(a => a.status === 'Operational').length;
        const inMaintenance = filteredAssets.filter(a => a.status === 'In Maintenance').length;
        const breakdown = filteredAssets.filter(a => a.status === 'Breakdown').length;
        const standby = filteredAssets.filter(a => a.status === 'Standby').length;
        const decommissioned = filteredAssets.filter(a => a.status === 'Decommissioned').length;
        const progress = total > 0 ? (operational / total) * 100 : 0;
        return { total, operational, inMaintenance, breakdown, standby, decommissioned, progress };
    }, [filteredAssets]);

    return (
        <div className="space-y-6">
            {/* Dashboard Toggle */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Asset Verification Module</h2>
                <button
                    onClick={() => setShowDashboard(!showDashboard)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        showDashboard
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                >
                    {showDashboard ? '📊 Hide Analytics' : '📊 View Analytics'}
                </button>
            </div>

            {/* Show Dashboard or Verification List */}
            {showDashboard ? (
                <AssetVerificationDashboard assets={assets} />
            ) : (
                <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Asset Verification Session</h3>
                    <p className="text-sm text-slate-600 mt-1">Verify assets from the BSOC Asset List</p>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Building</label>
                            <select 
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                value={selectedBuilding}
                                onChange={(e) => {
                                    setSelectedBuilding(e.target.value);
                                    setSelectedFloor('');
                                }}
                            >
                                <option value="">All Buildings</option>
                                {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                            <select 
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Floor</label>
                            <select 
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:opacity-50"
                                value={selectedFloor}
                                onChange={(e) => setSelectedFloor(e.target.value)}
                                disabled={!selectedBuilding}
                            >
                                <option value="">All Floors</option>
                                {floors.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Asset Status</label>
                            <select 
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Operational">Operational</option>
                                <option value="In Maintenance">In Maintenance</option>
                                <option value="Breakdown">Breakdown</option>
                                <option value="Standby">Standby</option>
                                <option value="Decommissioned">Decommissioned</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-600">Total</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600">Operational</p>
                            <p className="text-2xl font-bold text-green-700">{stats.operational}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-xs text-yellow-600">In Maintenance</p>
                            <p className="text-2xl font-bold text-yellow-700">{stats.inMaintenance}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-xs text-red-600">Breakdown</p>
                            <p className="text-2xl font-bold text-red-700">{stats.breakdown}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <p className="text-xs text-orange-600">Standby</p>
                            <p className="text-2xl font-bold text-orange-700">{stats.standby}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-slate-700">Operational Status</span>
                            <span className="font-bold text-brand-primary">{Math.round(stats.progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-green-600 h-3 rounded-full transition-all duration-500" 
                                style={{ width: `${stats.progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Asset List */}
                    <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                        {filteredAssets.length > 0 ? (
                            filteredAssets.map(asset => (
                                <div 
                                    key={asset.id} 
                                    className={`p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors ${
                                        asset.status === 'Operational' ? 'bg-green-50 border-green-200' : 
                                        asset.status === 'In Maintenance' ? 'bg-yellow-50 border-yellow-200' :
                                        asset.status === 'Breakdown' ? 'bg-red-50 border-red-200' :
                                        asset.status === 'Standby' ? 'bg-orange-50 border-orange-200' :
                                        'bg-slate-50 border-slate-200'
                                    }`}
                                >
                                    {/* Asset Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-slate-800 truncate">{asset.name}</h4>
                                            <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-300 flex-shrink-0">{asset.assetId}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <Badge variant="info">{asset.category}</Badge>
                                            <span className="text-slate-600">{asset.building}</span>
                                            <span className="text-slate-600">{asset.floor}</span>
                                            <span className="text-slate-500">{asset.room}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Make: {asset.make || 'N/A'} | Model: {asset.model || 'N/A'} | SN: {asset.serialNumber}
                                        </p>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 flex-wrap md:flex-nowrap w-full md:w-auto">
                                        <button 
                                            onClick={() => onUpdateAssetStatus?.(asset.id, 'Operational')}
                                            className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${
                                                asset.status === 'Operational' 
                                                ? 'bg-green-600 text-white' 
                                                : 'bg-white border border-green-600 text-green-600 hover:bg-green-50'
                                            }`}
                                        >
                                            ✓ Operational
                                        </button>
                                        <button 
                                            onClick={() => onUpdateAssetStatus?.(asset.id, 'In Maintenance')}
                                            className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${
                                                asset.status === 'In Maintenance' 
                                                ? 'bg-yellow-500 text-white' 
                                                : 'bg-white border border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                                            }`}
                                        >
                                            ⚙ In Maintenance
                                        </button>
                                        <button 
                                            onClick={() => onUpdateAssetStatus?.(asset.id, 'Breakdown')}
                                            className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${
                                                asset.status === 'Breakdown' 
                                                ? 'bg-red-600 text-white' 
                                                : 'bg-white border border-red-600 text-red-600 hover:bg-red-50'
                                            }`}
                                        >
                                            ✗ Breakdown
                                        </button>
                                        <button 
                                            onClick={() => onUpdateAssetStatus?.(asset.id, 'Standby')}
                                            className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium transition-colors flex-1 md:flex-none ${
                                                asset.status === 'Standby' 
                                                ? 'bg-orange-500 text-white' 
                                                : 'bg-white border border-orange-500 text-orange-500 hover:bg-orange-50'
                                            }`}
                                        >
                                            ⏸ Standby
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-base">No assets found with the selected filters.</p>
                                <p className="text-sm mt-1">Select a building or adjust your filters to view assets.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            )}
        </div>
    );
};
