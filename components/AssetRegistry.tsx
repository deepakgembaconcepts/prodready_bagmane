import React, { useState, useMemo, useEffect } from 'react';
import type { Asset, Contract } from '../types';
import { Badge } from './ui/Badge';
import { Card, CardContent, CardHeader } from './ui/Card';
import { AssetFormModal } from './AssetFormModal';
import { BulkUploadModal } from './BulkUploadModal';

interface AssetRegistryProps {
  assets: Asset[]; // Initial assets or fallback
  onEdit?: (asset: Asset) => void;
  onDelete?: (assetId: number) => void;
  onAdd?: (asset: Asset) => void;
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const AssetRegistry: React.FC<AssetRegistryProps> = ({ assets: initialAssets, onEdit, onDelete, onAdd }) => {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [loading, setLoading] = useState(false);

  // Fetch from API
  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/masters/assets?limit=1000'); // Get all for now or implement server-side pagination fully
        if (response.ok) {
          const result = await response.json();
          // Handle both array and paginated response { data: [] }
          const data = Array.isArray(result) ? result : result.data;
          if (data && data.length > 0) {
            setAssets(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch assets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const [filter, setFilter] = useState({
    search: '',
    category: '',
    status: '',
    building: '',
    critical: '',
  });
  const [sortBy, setSortBy] = useState<'name' | 'building' | 'category' | 'status' | 'cost'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'qr'>('table');
  const [selectedForQR, setSelectedForQR] = useState<number[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const itemsPerPage = 25;

  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch =
        asset.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        asset.assetId.toLowerCase().includes(filter.search.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(filter.search.toLowerCase());

      const matchesCategory = !filter.category || asset.category === filter.category;
      const matchesStatus = !filter.status || asset.status === filter.status;
      const matchesBuilding = !filter.building || asset.building === filter.building;
      const matchesCritical = !filter.critical || (asset.critical ? 'yes' : 'no') === filter.critical;

      return matchesSearch && matchesCategory && matchesStatus && matchesBuilding && matchesCritical;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [assets, filter, sortBy, sortOrder]);

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage]);

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

  const uniqueBuildings = [...new Set(assets.map(a => a.building))].sort();
  const uniqueCategories = [...new Set(assets.map(a => a.category))].sort();
  const uniqueStatuses = [...new Set(assets.map(a => a.status))].sort();

  const handleSort = (column: 'name' | 'building' | 'category' | 'status' | 'cost') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">Asset Registry</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                + Add Asset
              </button>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 rounded font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                ⬆ Import Assets
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded font-medium transition-colors ${viewMode === 'table'
                    ? 'bg-brand-primary text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewMode('qr')}
                className={`px-4 py-2 rounded font-medium transition-colors ${viewMode === 'qr'
                    ? 'bg-brand-primary text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
              >
                QR Codes ({selectedForQR.length})
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {viewMode === 'table' ? (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-800">Asset Registry - Filters</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Asset name, ID, or Serial No..."
                    value={filter.search}
                    onChange={e => { setFilter({ ...filter, search: e.target.value }); setCurrentPage(1); }}
                    className={filterInputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={filter.category}
                    onChange={e => { setFilter({ ...filter, category: e.target.value }); setCurrentPage(1); }}
                    className={filterInputStyle}
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={filter.status}
                    onChange={e => { setFilter({ ...filter, status: e.target.value }); setCurrentPage(1); }}
                    className={filterInputStyle}
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Building</label>
                  <select
                    value={filter.building}
                    onChange={e => { setFilter({ ...filter, building: e.target.value }); setCurrentPage(1); }}
                    className={filterInputStyle}
                  >
                    <option value="">All Buildings</option>
                    {uniqueBuildings.map(bldg => <option key={bldg} value={bldg}>{bldg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Critical</label>
                  <select
                    value={filter.critical}
                    onChange={e => { setFilter({ ...filter, critical: e.target.value }); setCurrentPage(1); }}
                    className={filterInputStyle}
                  >
                    <option value="">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                Showing <span className="font-semibold">{filteredAssets.length}</span> of <span className="font-semibold">{assets.length}</span> assets
              </div>
            </CardContent>
          </Card>

          {/* Registry Table */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-800">Asset Registry</h3>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 bg-slate-50">
                      <th className="text-center py-3 px-2 font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedForQR.length === paginatedAssets.length && paginatedAssets.length > 0}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedForQR([...new Set([...selectedForQR, ...paginatedAssets.map(a => a.id)])]);
                            } else {
                              setSelectedForQR(selectedForQR.filter(id => !paginatedAssets.map(a => a.id).includes(id)));
                            }
                          }}
                        />
                      </th>
                      <th
                        className="text-left py-3 px-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('name')}
                      >
                        Asset Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Asset ID</th>
                      <th
                        className="text-left py-3 px-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('category')}
                      >
                        Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Serial No.</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Make/Model</th>
                      <th
                        className="text-left py-3 px-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('building')}
                      >
                        Building {sortBy === 'building' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Location</th>
                      <th
                        className="text-left py-3 px-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('status')}
                      >
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Critical</th>
                      <th
                        className="text-left py-3 px-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('cost')}
                      >
                        Cost {sortBy === 'cost' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Warranty</th>
                      <th className="text-center py-3 px-3 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAssets.map((asset) => (
                      <tr key={asset.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="text-center py-3 px-2">
                          <input
                            type="checkbox"
                            checked={selectedForQR.includes(asset.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedForQR([...selectedForQR, asset.id]);
                              } else {
                                setSelectedForQR(selectedForQR.filter(id => id !== asset.id));
                              }
                            }}
                          />
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">{asset.name}</td>
                        <td className="py-3 px-3 text-blue-600 font-mono text-xs">{asset.assetId}</td>
                        <td className="py-3 px-3">
                          <Badge variant="info">{asset.category}</Badge>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs text-slate-600">{asset.serialNumber}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {asset.make ? `${asset.make}${asset.model ? ' - ' + asset.model : ''}` : 'N/A'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">{asset.building}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {asset.wing || asset.floor || asset.room || asset.location || 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={asset.status === 'Operational' ? 'success' : 'warning'}>
                            {asset.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={asset.critical ? 'error' : 'secondary'}>
                            {asset.critical ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {asset.cost ? `₹${asset.cost.toLocaleString()}` : 'N/A'}
                        </td>
                        <td className="py-3 px-3">
                          {asset.warrantyExpiry ? (
                            <span className={asset.warrantyExpiry < new Date() ? 'text-red-600 font-medium' : 'text-green-600'}>
                              {new Date(asset.warrantyExpiry).toLocaleDateString()}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex gap-2 justify-center">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(asset)}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                              >
                                Edit
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(asset.id)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {paginatedAssets.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No assets found matching your filters
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <QRCodeView
          assets={assets.filter(a => selectedForQR.includes(a.id))}
          onBack={() => setViewMode('table')}
        />
      )}
      {/* Add Asset Modal */}
      <AssetFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(newAsset) => {
          if (onAdd) {
            const assetToAdd: Asset = {
              ...newAsset,
              id: Math.max(...assets.map(a => a.id), 0) + 1,
              assetId: `AST-${new Date().getTime()}`,
              nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            };
            onAdd(assetToAdd);
          }
          setIsAddModalOpen(false);
        }}
        contracts={[]}
      />

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUpload={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const content = e.target?.result as string;
              const lines = content.split('\n');
              const headers = lines[0].split(',').map(h => h.trim());

              // Parse CSV and create assets
              const importedAssets = lines.slice(1)
                .filter(line => line.trim())
                .map((line, idx) => {
                  const values = line.split(',').map(v => v.trim());
                  return {
                    name: values[0] || `Imported Asset ${idx + 1}`,
                    assetId: values[1] || `IMP-${Date.now()}-${idx}`,
                    building: values[2] || 'Unknown',
                    category: values[3] || 'Other',
                    status: values[4] || 'Operational',
                    critical: values[5]?.toLowerCase() === 'yes',
                    cost: parseInt(values[6]) || 0,
                  };
                });

              // Show confirmation
              if (importedAssets.length > 0) {
                alert(`${importedAssets.length} assets ready to import. Please use Add Asset button to add them individually or contact admin for bulk import.`);
              }
            } catch (error) {
              alert('Error reading file. Please ensure it is a valid CSV file.');
              console.error(error);
            }
          };
          reader.readAsText(file);
        }}
        title="Import Assets"
        templateName="asset-template"
      />
    </div>
  );
};

// QR Code View Component
interface QRCodeViewProps {
  assets: Asset[];
  onBack: () => void;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ assets, onBack }) => {
  const generateQRCode = (text: string): string => {
    // Generate simple QR-like data matrix
    // Using a basic implementation with canvas
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect fill='white' width='150' height='150'/%3E%3Ctext x='50%25' y='50%25' font-family='monospace' font-size='12' text-anchor='middle' dominant-baseline='middle'%3E${encodeURIComponent(text.substring(0, 20))}%3C/text%3E%3C/svg%3E`;
  };

  const handleDownload = () => {
    if (assets.length === 0) {
      alert('No assets selected for QR code download');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrSize = 180;
    const padding = 20;
    const cols = 3;
    const rows = Math.ceil(assets.length / cols);

    canvas.width = cols * (qrSize + padding) + padding;
    canvas.height = rows * (qrSize + padding) + padding;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    assets.forEach((asset, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * (qrSize + padding) + padding;
      const y = row * (qrSize + padding) + padding;

      // Draw border
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, qrSize, qrSize);

      // Draw placeholder QR
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(x + 5, y + 5, qrSize - 10, qrSize - 20);

      // Draw asset info
      ctx.fillStyle = '#333';
      ctx.font = 'bold 9px Arial';
      ctx.fillText(asset.assetId, x + 8, y + 20);

      ctx.font = '8px Arial';
      ctx.fillText(asset.name.substring(0, 15), x + 8, y + 32);
      ctx.fillText(asset.building, x + 8, y + 42);
      ctx.fillText(`SN: ${asset.serialNumber.substring(0, 12)}`, x + 8, y + 52);
    });

    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = `asset-qr-codes-${new Date().toISOString().split('T')[0]}.png`;
    link.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">
            QR Codes for {assets.length} Asset{assets.length !== 1 ? 's' : ''}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              Back to Registry
            </button>
            <button
              onClick={handleDownload}
              disabled={assets.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Download as Image
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-lg">No assets selected</p>
            <p className="text-sm">Select assets from the registry to generate QR codes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="border border-slate-200 rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
                <div className="w-full aspect-square bg-slate-100 rounded mb-3 flex items-center justify-center border-2 border-dashed border-slate-300">
                  <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM4 14a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </div>
                <p className="font-semibold text-slate-900 text-xs mb-1">{asset.assetId}</p>
                <p className="text-xs text-slate-600 truncate">{asset.name}</p>
                <p className="text-xs text-slate-500">{asset.building}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
