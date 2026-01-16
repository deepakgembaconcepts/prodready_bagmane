
import React, { useState, useMemo, useEffect } from 'react';
import type { Asset, Contract } from '../types';
import { AssetStatus, AssetCategory } from '../types';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader } from './ui/Card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BulkUploadModal } from './BulkUploadModal';
import { AssetBucketingDashboard } from './AssetBucketingDashboard';
import { getBuildingMasters, BuildingMaster } from '../data/buildingMasters';

interface AssetListProps {
  assets: Asset[];
  contracts?: Contract[];
  onBulkUpload?: (file: File) => void;
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

const COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3', '#9E9E9E'];

// Stat Card Component
const StatCard: React.FC<{ title: string; value: number; color?: string; icon: React.ReactNode }> = ({ title, value, color = 'text-slate-900', icon }) => (
    <Card>
        <CardContent className="flex items-center justify-between p-4">
            <div>
                <p className="text-sm font-medium text-slate-600 truncate">{title}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
            <div className={`p-2 rounded-full bg-slate-100 ${color} opacity-80`}>
                {icon}
            </div>
        </CardContent>
    </Card>
);

// QR Code Modal Component
const QRCodeModal: React.FC<{ asset: Asset | null, onClose: () => void }> = ({ asset, onClose }) => {
    if (!asset) return null;

    // Using a public QR code API for demonstration
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({id: asset.assetId, name: asset.name}))}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 text-center">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Asset QR Code</h3>
                <p className="text-sm text-slate-500 mb-4">{asset.name} ({asset.assetId})</p>
                
                <div className="flex justify-center mb-6">
                    <img src={qrCodeUrl} alt="Asset QR Code" className="border-4 border-slate-100 rounded-lg" />
                </div>
                
                <div className="space-y-2 mb-6 text-left text-sm bg-slate-50 p-3 rounded-md">
                     <div className="flex justify-between">
                         <span className="text-slate-500">Location:</span>
                         <span className="font-medium text-slate-700">{asset.building}, {asset.location}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-slate-500">Category:</span>
                         <span className="font-medium text-slate-700">{asset.category}</span>
                     </div>
                     <div className="flex justify-between">
                         <span className="text-slate-500">SN:</span>
                         <span className="font-medium text-slate-700">{asset.serialNumber}</span>
                     </div>
                </div>

                <button 
                    onClick={onClose} 
                    className="w-full bg-brand-primary text-white py-2 rounded-md hover:bg-brand-secondary transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

// Icons
const CubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

const WrenchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.063.53.113.999.412 1.321.841m-2.92-2.113c.277-.66.793-1.196 1.436-1.488.665-.303 1.465-.257 2.086.133m-1.357 1.05a1.503 1.503 0 00-1.77.265 1.503 1.503 0 00-.265 1.77" />
    </svg>
);

const ExclamationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
);

export const AssetList: React.FC<AssetListProps> = ({ assets, contracts, onBulkUpload }) => {
  const [filter, setFilter] = useState({ category: '', status: '', search: '', building: '' });
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'bucketing'>('list');
  const [buildingMasters, setBuildingMasters] = useState<BuildingMaster[]>([]);

  // Load building masters from Complex Info Module
  useEffect(() => {
    const masters = getBuildingMasters();
    setBuildingMasters(masters);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const categoryMatch = filter.category ? asset.category === filter.category : true;
      const statusMatch = filter.status ? asset.status === filter.status : true;
      const buildingMatch = filter.building ? asset.building === filter.building : true;
      const searchMatch = filter.search
        ? asset.assetId.toLowerCase().includes(filter.search.toLowerCase()) ||
          asset.name.toLowerCase().includes(filter.search.toLowerCase()) ||
          asset.serialNumber.toLowerCase().includes(filter.search.toLowerCase())
        : true;
      return categoryMatch && statusMatch && buildingMatch && searchMatch;
    });
  }, [assets, filter]);

  // Dashboard Stats
  const stats = useMemo(() => {
    return assets.reduce((acc, asset) => {
        acc.total++;
        if (asset.status === AssetStatus.Operational) acc.operational++;
        if (asset.status === AssetStatus.InMaintenance) acc.maintenance++;
        if (asset.status === AssetStatus.Breakdown) acc.breakdown++;
        if (asset.status === AssetStatus.Standby) acc.standby++;
        return acc;
    }, { total: 0, operational: 0, maintenance: 0, breakdown: 0, standby: 0 });
  }, [assets]);

  const statusDistribution = useMemo(() => {
      const data = [
          { name: AssetStatus.Operational, value: stats.operational },
          { name: AssetStatus.InMaintenance, value: stats.maintenance },
          { name: AssetStatus.Breakdown, value: stats.breakdown },
          { name: AssetStatus.Standby, value: stats.standby },
          { name: AssetStatus.Decommissioned, value: stats.total - (stats.operational + stats.maintenance + stats.breakdown + stats.standby) }
      ];
      return data.filter(d => d.value > 0);
  }, [stats]);

  const getContractTitle = (id?: string) => {
      if (!id || !contracts) return null;
      return contracts.find(c => c.contractId === id)?.title;
  }
  
  const handleUpload = (file: File) => {
    if (onBulkUpload) {
        onBulkUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            viewMode === 'list'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          📊 Asset Registry
        </button>
        <button
          onClick={() => setViewMode('bucketing')}
          className={`px-4 py-2 font-semibold transition-all border-b-2 ${
            viewMode === 'bucketing'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          🏷️ Asset Bucketing & QR Codes
        </button>
      </div>

      {/* Bucketing Dashboard View */}
      {viewMode === 'bucketing' && <AssetBucketingDashboard assets={assets} />}

      {/* List View */}
      {viewMode === 'list' && (
        <>
        {/* Module 3: Asset Operational Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="Total Assets" value={stats.total} icon={<CubeIcon />} />
            <StatCard title="Operational" value={stats.operational} color="text-green-600" icon={<CubeIcon />} />
            <StatCard title="In Maintenance" value={stats.maintenance} color="text-yellow-600" icon={<WrenchIcon />} />
            <StatCard title="Breakdown" value={stats.breakdown} color="text-red-600" icon={<ExclamationIcon />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-700">Asset Status Distribution</h3>
                </CardHeader>
                <CardContent className="flex justify-center">
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        {/* Asset Listing */}
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-700">Asset Registry</h3>
                     <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-1.5 px-3 rounded-md shadow-sm transition-colors text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Import Assets</span>
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search ID, Name, Serial..."
                        className={filterInputStyle}
                        onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
                    />
                    <select
                        className={filterInputStyle}
                        onChange={e => setFilter(f => ({ ...f, category: e.target.value }))}
                    >
                        <option value="">All Categories</option>
                        {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select
                        className={filterInputStyle}
                        onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                    >
                        <option value="">All Statuses</option>
                        {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        className={filterInputStyle}
                        onChange={e => setFilter(f => ({ ...f, building: e.target.value }))}
                    >
                        <option value="">All Buildings (from Complex Info Master)</option>
                        {buildingMasters.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th className="px-6 py-3">Asset ID</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Manufacturer</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Last Maintenance</th>
                                <th className="px-6 py-3">Frequency</th>
                                <th className="px-6 py-3">Criticality</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAssets.length > 0 ? (
                                filteredAssets.map(asset => (
                                    <tr key={asset.id} className="bg-white border-b hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-brand-primary">{asset.assetId}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{asset.name}</td>
                                        <td className="px-6 py-4 text-sm">{asset.category}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{asset.manufacturer || '—'}</td>
                                        <td className="px-6 py-4"><Badge type={asset.status} /></td>
                                        <td className="px-6 py-4 text-sm">
                                            {asset.lastMaintenanceDate ? new Date(asset.lastMaintenanceDate).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                asset.maintenance_Frequency === 'Monthly' ? 'bg-blue-100 text-blue-800' :
                                                asset.maintenance_Frequency === 'Quarterly' ? 'bg-green-100 text-green-800' :
                                                'bg-orange-100 text-orange-800'
                                            }`}>
                                                {asset.maintenance_Frequency || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                asset.criticalityLevel === 'Critical' ? 'bg-red-100 text-red-800' :
                                                asset.criticalityLevel === 'High' ? 'bg-orange-100 text-orange-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {asset.criticalityLevel || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => setSelectedAssetForQR(asset)}
                                                className="flex items-center text-brand-secondary hover:text-brand-primary font-medium text-xs transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 6h2v4H6V6zm8 0h2v4h-2V6zM6 16h2v4H6v-4z" />
                                                </svg>
                                                View QR
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                                        No assets found matching criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>

        {/* Modals */}
        <QRCodeModal asset={selectedAssetForQR} onClose={() => setSelectedAssetForQR(null)} />
        <BulkUploadModal 
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onUpload={handleUpload}
            title="Bulk Import Assets"
            templateName="Asset_Master_Template.xlsx"
        />
        </>
      )}
    </div>
  );
};
