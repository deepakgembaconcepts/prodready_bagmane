import React, { useState } from 'react';
import type { Asset } from '../types';

interface AssetBucketingDashboardProps {
  assets: Asset[];
}

export const AssetBucketingDashboard: React.FC<AssetBucketingDashboardProps> = ({ assets }) => {
  const [bucketBy, setBucketBy] = useState<'category' | 'status' | 'location' | 'criticality' | 'operationalAge'>('category');

  // Calculate operational age in years
  const getOperationalAge = (asset: Asset): number => {
    if (!asset.installDate) return 0;
    const install = new Date(asset.installDate);
    if (isNaN(install.getTime())) return 0; // Handle invalid dates
    const now = new Date();
    return Math.floor((now.getTime() - install.getTime()) / (1000 * 60 * 60 * 24 * 365));
  };

  // Get operational age bucket
  const getOperationalAgeBucket = (years: number): string => {
    if (years < 1) return '0-1 years';
    if (years < 2) return '1-2 years';
    if (years < 4) return '2-4 years';
    if (years < 6) return '4-6 years';
    if (years < 8) return '6-8 years';
    return '8+ years';
  };

  // Data bucketing logic
  const getBucketedData = () => {
    const buckets: Record<string, Asset[]> = {};
    
    assets.forEach(asset => {
      let key = '';
      switch (bucketBy) {
        case 'category':
          key = asset.category || 'Uncategorized';
          break;
        case 'status':
          key = asset.status || 'Unknown';
          break;
        case 'location':
          key = asset.location || 'Unassigned';
          break;
        case 'criticality':
          key = asset.criticality || 'Standard';
          break;
        case 'operationalAge':
          const age = getOperationalAge(asset);
          key = getOperationalAgeBucket(age);
          break;
      }
      
      if (!buckets[key]) {
        buckets[key] = [];
      }
      buckets[key].push(asset);
    });
    
    return buckets;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  const buckets = getBucketedData();
  const bucketEntries = Object.entries(buckets);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Asset Bucketing & QR Code Management</h1>
        <p className="text-slate-600 mt-1">Organize and track {assets.length} assets</p>
      </div>

      {/* Filter & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-50 p-4 rounded-lg">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Bucket By:</label>
          <select 
            value={bucketBy}
            onChange={(e) => setBucketBy(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="category">Category</option>
            <option value="status">Status</option>
            <option value="location">Location</option>
            <option value="criticality">Criticality Level</option>
            <option value="operationalAge">Operational Age</option>
          </select>
        </div>
        <div>
          <p className="text-sm text-slate-600">
            Total Buckets: <span className="font-bold text-slate-900">{bucketEntries.length}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      {assets.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
          <p className="text-slate-500 text-lg">No assets available to bucket</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Bucket Summary Cards */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Bucket Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bucketEntries.map(([bucket, bucketAssets], idx) => (
                <div
                  key={bucket}
                  className="p-4 bg-gradient-to-r from-slate-100 to-slate-50 border-2 border-slate-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{bucket}</h3>
                      <p className="text-sm text-slate-600">{bucketAssets.length} assets</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {Math.round((bucketAssets.length / assets.length) * 100)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assets List */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4">Asset Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-lg transition-all bg-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-slate-900 flex-1 line-clamp-2">{asset.name}</h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ml-2 ${
                      asset.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : asset.status === 'Inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="font-semibold">ID:</span> {asset.assetId}</p>
                    <p><span className="font-semibold">Category:</span> {asset.category}</p>
                    {asset.location && <p><span className="font-semibold">Location:</span> {asset.location}</p>}
                    {asset.criticality && <p><span className="font-semibold">Criticality:</span> {asset.criticality}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
