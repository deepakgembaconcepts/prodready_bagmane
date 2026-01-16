import React, { useMemo } from 'react';
import type { Asset } from '../types';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader } from './ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, LineChart, Line, ComposedChart } from 'recharts';
import { AssetOperationalAge } from './AssetOperationalAge';

interface AssetDashboardProps {
  assets: Asset[];
}

const StatCard: React.FC<{ title: string; value: number | string; color?: string; icon: React.ReactNode; subtitle?: string }> = ({ title, value, color = 'text-slate-900', icon, subtitle }) => (
  <Card>
    <CardContent className="flex items-center justify-between p-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 truncate">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-full bg-slate-100 ${color} opacity-80`}>
        {icon}
      </div>
    </CardContent>
  </Card>
);

const CubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3.75-6.75h7.5M12 3.75c-4.97 0-9 2.686-9 6s4.03 6 9 6 9-2.686 9-6-4.03-6-9-6z" />
  </svg>
);

export const AssetDashboard: React.FC<AssetDashboardProps> = ({ assets }) => {
  const metrics = useMemo(() => {
    const today = new Date();
    
    const totalAssets = assets.length;
    const operational = assets.filter(a => a.status === 'Operational').length;
    const inMaintenance = assets.filter(a => a.status === 'In Maintenance').length;
    const breakdown = assets.filter(a => a.status === 'Breakdown').length;
    const critical = assets.filter(a => a.critical).length;
    const expiredWarranty = assets.filter(a => a.warrantyExpiry && a.warrantyExpiry < today).length;
    
    const totalCost = assets.reduce((sum, a) => sum + (a.cost || 0), 0);
    const totalReplacementCost = assets.reduce((sum, a) => sum + (a.replacementCost || 0), 0);
    
    // Category breakdown
    const categoryMetrics = Object.values({} as Record<string, any>);
    const categoryMap: Record<string, number> = {};
    assets.forEach(asset => {
      categoryMap[asset.category] = (categoryMap[asset.category] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
    
    // Status breakdown
    const statusData = [
      { name: 'Operational', count: operational, fill: '#10b981' },
      { name: 'In Maintenance', count: inMaintenance, fill: '#f59e0b' },
      { name: 'Breakdown', count: breakdown, fill: '#ef4444' },
      { name: 'Standby', count: assets.filter(a => a.status === 'Standby').length, fill: '#6b7280' },
      { name: 'Decommissioned', count: assets.filter(a => a.status === 'Decommissioned').length, fill: '#9ca3af' },
    ].filter(s => s.count > 0);
    
    // Critical by category
    const criticalByCategory = Object.entries(
      assets
        .filter(a => a.critical)
        .reduce((acc, a) => {
          acc[a.category] = (acc[a.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }));
    
    // Age analysis
    const ageRanges = {
      '0-1 years': 0,
      '1-3 years': 0,
      '3-5 years': 0,
      '5-10 years': 0,
      '10+ years': 0,
    };
    
    assets.forEach(asset => {
      if (asset.installDate) {
        const installDate = new Date(asset.installDate);
        // Only process if it's a valid date
        if (!isNaN(installDate.getTime())) {
          const ageInYears = (today.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          if (ageInYears < 1) ageRanges['0-1 years']++;
          else if (ageInYears < 3) ageRanges['1-3 years']++;
          else if (ageInYears < 5) ageRanges['3-5 years']++;
          else if (ageInYears < 10) ageRanges['5-10 years']++;
          else ageRanges['10+ years']++;
        }
      }
    });
    
    const ageData = Object.entries(ageRanges).map(([name, count]) => ({ name, count }));
    
    // Cost by category
    const costByCategory = Object.entries(
      assets.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + (a.cost || 0);
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => (b.cost as number) - (a.cost as number))
      .slice(0, 10);
    
    // Warranty status
    const warrantyExpiring = assets.filter(a => {
      if (!a.warrantyExpiry) return false;
      const daysUntilExpiry = (new Date(a.warrantyExpiry).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 90;
    });
    
    // Building breakdown
    const buildingData = Object.entries(
      assets.reduce((acc, a) => {
        acc[a.building] = (acc[a.building] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count })).sort((a, b) => (b.count as number) - (a.count as number));
    
    return {
      totalAssets,
      operational,
      inMaintenance,
      breakdown,
      critical,
      expiredWarranty,
      warrantyExpiring,
      totalCost,
      totalReplacementCost,
      categoryData,
      statusData,
      criticalByCategory,
      ageData,
      costByCategory,
      buildingData,
    };
  }, [assets]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Assets"
          value={metrics.totalAssets}
          color="text-blue-600"
          icon={<CubeIcon />}
        />
        <StatCard
          title="Operational"
          value={metrics.operational}
          color="text-green-600"
          icon={<CheckIcon />}
          subtitle={`${((metrics.operational / metrics.totalAssets) * 100).toFixed(0)}%`}
        />
        <StatCard
          title="Critical Assets"
          value={metrics.critical}
          color="text-red-600"
          icon={<AlertIcon />}
        />
        <StatCard
          title="In Maintenance"
          value={metrics.inMaintenance}
          color="text-amber-600"
          icon={<AlertIcon />}
        />
        <StatCard
          title="Total Asset Value"
          value={`₹${(metrics.totalCost / 10000000).toFixed(1)}Cr`}
          color="text-purple-600"
          icon={<CurrencyIcon />}
          subtitle={`Replacement: ₹${(metrics.totalReplacementCost / 10000000).toFixed(1)}Cr`}
        />
      </div>

      {/* Status & Category Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Asset Status Distribution</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count, fill }) => (
                    <text fill={fill} className="text-xs font-semibold">
                      {count}
                    </text>
                  )}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {metrics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} assets`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Assets by Category</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.categoryData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Age & Critical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Age Analysis */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Asset Age Distribution</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.ageData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Critical Assets by Category */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Critical Assets by Category</h3>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.criticalByCategory} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cost & Building */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cost Categories */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Top 10 Cost by Category</h3>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.costByCategory} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="cost" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assets by Building */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Assets by Building</h3>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.buildingData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operational Age Dashboard */}
      <AssetOperationalAge assets={assets} />

      {/* Alerts */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Alert Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-900">Breakdown Assets</p>
                <p className="text-sm text-red-700">{metrics.breakdown} assets require immediate attention</p>
              </div>
              <div className="text-2xl font-bold text-red-600">{metrics.breakdown}</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <p className="font-medium text-orange-900">Warranty Expiring Soon</p>
                <p className="text-sm text-orange-700">{metrics.warrantyExpiring.length} assets within 90 days</p>
              </div>
              <div className="text-2xl font-bold text-orange-600">{metrics.warrantyExpiring.length}</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="font-medium text-yellow-900">Expired Warranty</p>
                <p className="text-sm text-yellow-700">{metrics.expiredWarranty} assets no longer covered</p>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{metrics.expiredWarranty}</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div>
                <p className="font-medium text-purple-900">Critical Assets</p>
                <p className="text-sm text-purple-700">{metrics.critical} assets flagged as critical</p>
              </div>
              <div className="text-2xl font-bold text-purple-600">{metrics.critical}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
