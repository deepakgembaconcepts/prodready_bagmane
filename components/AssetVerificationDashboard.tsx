import React, { useMemo } from 'react';
import type { Asset } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface BuildingStats {
    total: number;
    operational: number;
    inMaintenance: number;
    breakdown: number;
    standby: number;
    decommissioned: number;
}

interface CategoryStats {
    total: number;
    operational: number;
    inMaintenance: number;
    breakdown: number;
    standby: number;
    decommissioned: number;
}

interface AssetVerificationDashboardProps {
    assets: Asset[];
}

export const AssetVerificationDashboard: React.FC<AssetVerificationDashboardProps> = ({ assets }) => {
    // Calculate comprehensive statistics
    const analytics = useMemo(() => {
        const total = assets.length;
        
        // Status breakdown
        const operational = assets.filter(a => a.status === 'Operational').length;
        const inMaintenance = assets.filter(a => a.status === 'In Maintenance').length;
        const breakdown = assets.filter(a => a.status === 'Breakdown').length;
        const standby = assets.filter(a => a.status === 'Standby').length;
        const decommissioned = assets.filter(a => a.status === 'Decommissioned').length;
        
        // Operational percentage
        const operationalPercentage = total > 0 ? (operational / total) * 100 : 0;
        const healthPercentage = total > 0 ? ((operational + standby) / total) * 100 : 0;
        
        // Building-wise breakdown
        const buildingStats = assets.reduce((acc, asset) => {
            if (!acc[asset.building]) {
                acc[asset.building] = {
                    total: 0,
                    operational: 0,
                    inMaintenance: 0,
                    breakdown: 0,
                    standby: 0,
                    decommissioned: 0,
                } as BuildingStats;
            }
            acc[asset.building].total++;
            if (asset.status === 'Operational') acc[asset.building].operational++;
            else if (asset.status === 'In Maintenance') acc[asset.building].inMaintenance++;
            else if (asset.status === 'Breakdown') acc[asset.building].breakdown++;
            else if (asset.status === 'Standby') acc[asset.building].standby++;
            else if (asset.status === 'Decommissioned') acc[asset.building].decommissioned++;
            return acc;
        }, {} as Record<string, BuildingStats>);

        // Category-wise breakdown
        const categoryStats = assets.reduce((acc, asset) => {
            if (!acc[asset.category]) {
                acc[asset.category] = {
                    total: 0,
                    operational: 0,
                    inMaintenance: 0,
                    breakdown: 0,
                    standby: 0,
                    decommissioned: 0,
                } as CategoryStats;
            }
            acc[asset.category].total++;
            if (asset.status === 'Operational') acc[asset.category].operational++;
            else if (asset.status === 'In Maintenance') acc[asset.category].inMaintenance++;
            else if (asset.status === 'Breakdown') acc[asset.category].breakdown++;
            else if (asset.status === 'Standby') acc[asset.category].standby++;
            else if (asset.status === 'Decommissioned') acc[asset.category].decommissioned++;
            return acc;
        }, {} as Record<string, CategoryStats>);

        // Average age calculation
        const averageAge = assets.length > 0 
            ? (assets.reduce((sum, a) => sum + (a.operationalAge || 0), 0) / assets.length).toFixed(1)
            : 0;

        // Critical assets (breakdown or in maintenance)
        const criticalAssets = breakdown + inMaintenance;
        const criticalPercentage = total > 0 ? (criticalAssets / total) * 100 : 0;

        // Verification rate (assets with recent updates)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentlyVerified = assets.filter(a => {
            const lastVerified = new Date(a.lastVerificationDate || a.dateAdded);
            return lastVerified >= thirtyDaysAgo;
        }).length;
        const verificationRate = total > 0 ? (recentlyVerified / total) * 100 : 0;

        return {
            total,
            operational,
            inMaintenance,
            breakdown,
            standby,
            decommissioned,
            operationalPercentage,
            healthPercentage,
            buildingStats,
            categoryStats,
            averageAge,
            criticalAssets,
            criticalPercentage,
            recentlyVerified,
            verificationRate,
        };
    }, [assets]);

    const buildingEntries = Object.entries(analytics.buildingStats).sort((a, b) => (b[1] as BuildingStats).total - (a[1] as BuildingStats).total);
    const categoryEntries = Object.entries(analytics.categoryStats).sort((a, b) => (b[1] as CategoryStats).total - (a[1] as CategoryStats).total);

    const StatCard = ({ label, value, unit = '', color = 'blue' }: { label: string; value: string | number; unit?: string; color?: string }) => {
        const colorMap = {
            blue: 'bg-blue-50 text-blue-700',
            green: 'bg-green-50 text-green-700',
            red: 'bg-red-50 text-red-700',
            yellow: 'bg-yellow-50 text-yellow-700',
            purple: 'bg-purple-50 text-purple-700',
            orange: 'bg-orange-50 text-orange-700',
        };
        return (
            <div className={`${colorMap[color as keyof typeof colorMap] || colorMap.blue} p-4 rounded-lg`}>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-2xl font-bold mt-1">{value} {unit}</p>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Assets" value={analytics.total} color="blue" />
                <StatCard label="Operational" value={analytics.operationalPercentage.toFixed(1)} unit="%" color="green" />
                <StatCard label="Overall Health" value={analytics.healthPercentage.toFixed(1)} unit="%" color="purple" />
                <StatCard label="Critical Issues" value={analytics.criticalPercentage.toFixed(1)} unit="%" color="red" />
            </div>

            {/* Status Breakdown */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Asset Status Breakdown</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 font-medium">Operational</p>
                            <p className="text-3xl font-bold text-green-700 mt-2">{analytics.operational}</p>
                            <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                                <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${analytics.total > 0 ? (analytics.operational / analytics.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 font-medium">In Maintenance</p>
                            <p className="text-3xl font-bold text-yellow-700 mt-2">{analytics.inMaintenance}</p>
                            <div className="w-full bg-yellow-200 rounded-full h-2 mt-3">
                                <div 
                                    className="bg-yellow-600 h-2 rounded-full" 
                                    style={{ width: `${analytics.total > 0 ? (analytics.inMaintenance / analytics.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 font-medium">Breakdown</p>
                            <p className="text-3xl font-bold text-red-700 mt-2">{analytics.breakdown}</p>
                            <div className="w-full bg-red-200 rounded-full h-2 mt-3">
                                <div 
                                    className="bg-red-600 h-2 rounded-full" 
                                    style={{ width: `${analytics.total > 0 ? (analytics.breakdown / analytics.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 font-medium">Standby</p>
                            <p className="text-3xl font-bold text-orange-700 mt-2">{analytics.standby}</p>
                            <div className="w-full bg-orange-200 rounded-full h-2 mt-3">
                                <div 
                                    className="bg-orange-600 h-2 rounded-full" 
                                    style={{ width: `${analytics.total > 0 ? (analytics.standby / analytics.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-slate-600 font-medium">Decommissioned</p>
                            <p className="text-3xl font-bold text-gray-700 mt-2">{analytics.decommissioned}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                <div 
                                    className="bg-gray-600 h-2 rounded-full" 
                                    style={{ width: `${analytics.total > 0 ? (analytics.decommissioned / analytics.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Average Asset Age" value={analytics.averageAge} unit="years" color="blue" />
                <StatCard label="Recently Verified (30d)" value={analytics.verificationRate.toFixed(1)} unit="%" color="green" />
                <StatCard label="Critical Assets" value={analytics.criticalAssets} color="red" />
            </div>

            {/* Building-wise Analysis */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Asset Distribution by Building</h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-4 py-3">Building</th>
                                    <th className="px-4 py-3 text-center">Total</th>
                                    <th className="px-4 py-3 text-center">Operational</th>
                                    <th className="px-4 py-3 text-center">Maintenance</th>
                                    <th className="px-4 py-3 text-center">Breakdown</th>
                                    <th className="px-4 py-3 text-center">Standby</th>
                                    <th className="px-4 py-3 text-center">Health %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {buildingEntries.map(([building, stats]) => {
                                    const buildingData = stats as BuildingStats;
                                    const healthPercentage = buildingData.total > 0 ? ((buildingData.operational + buildingData.standby) / buildingData.total) * 100 : 0;
                                    return (
                                        <tr key={building} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{building}</td>
                                            <td className="px-4 py-3 text-center font-semibold">{buildingData.total}</td>
                                            <td className="px-4 py-3 text-center text-green-700 font-medium">{buildingData.operational}</td>
                                            <td className="px-4 py-3 text-center text-yellow-700 font-medium">{buildingData.inMaintenance}</td>
                                            <td className="px-4 py-3 text-center text-red-700 font-medium">{buildingData.breakdown}</td>
                                            <td className="px-4 py-3 text-center text-orange-700 font-medium">{buildingData.standby}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    healthPercentage >= 90 ? 'bg-green-100 text-green-800' :
                                                    healthPercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {healthPercentage.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Category-wise Analysis */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Asset Distribution by Category</h3>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-center">Total</th>
                                    <th className="px-4 py-3 text-center">Operational</th>
                                    <th className="px-4 py-3 text-center">Maintenance</th>
                                    <th className="px-4 py-3 text-center">Breakdown</th>
                                    <th className="px-4 py-3 text-center">Standby</th>
                                    <th className="px-4 py-3 text-center">Health %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryEntries.map(([category, stats]) => {
                                    const categoryData = stats as CategoryStats;
                                    const healthPercentage = categoryData.total > 0 ? ((categoryData.operational + categoryData.standby) / categoryData.total) * 100 : 0;
                                    return (
                                        <tr key={category} className="border-b hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-900">{category}</td>
                                            <td className="px-4 py-3 text-center font-semibold">{categoryData.total}</td>
                                            <td className="px-4 py-3 text-center text-green-700 font-medium">{categoryData.operational}</td>
                                            <td className="px-4 py-3 text-center text-yellow-700 font-medium">{categoryData.inMaintenance}</td>
                                            <td className="px-4 py-3 text-center text-red-700 font-medium">{categoryData.breakdown}</td>
                                            <td className="px-4 py-3 text-center text-orange-700 font-medium">{categoryData.standby}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    healthPercentage >= 90 ? 'bg-green-100 text-green-800' :
                                                    healthPercentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {healthPercentage.toFixed(1)}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
