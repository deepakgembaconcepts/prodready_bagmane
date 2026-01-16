import React, { useState, useEffect } from 'react';
import { BTP_PARIN_SITE_DATA } from '../data/btpSiteData';
import { getBuildingMasters, addBuildingMaster, updateBuildingMaster, deleteBuildingMaster, initializeBuildingMasters, BuildingMaster } from '../data/buildingMasters';
import { BuildingFormModal } from './BuildingFormModal';

interface FloorData {
  floor: string;
  area: number;
  fireNOCArea: string;
  status: string;
}

export const SiteHierarchy: React.FC = () => {
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>('Parin');
  const [buildings, setBuildings] = useState<BuildingMaster[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingMaster | undefined>();
  const [siteData] = useState(BTP_PARIN_SITE_DATA);
  
  // Initialize buildings on component mount
  useEffect(() => {
    initializeBuildingMasters();
    setBuildings(getBuildingMasters());
  }, []);

  // Group floors by building (for BTP data display)
  const buildingsByName = siteData.floorDetails.reduce((acc, floor) => {
    if (!acc[floor.building]) {
      acc[floor.building] = [];
    }
    acc[floor.building].push(floor);
    return acc;
  }, {} as Record<string, typeof siteData.floorDetails>);

  const handleAddBuilding = (building: BuildingMaster) => {
    const newBuilding = addBuildingMaster(building);
    setBuildings(getBuildingMasters());
    setIsModalOpen(false);
    setEditingBuilding(undefined);
  };

  const handleEditBuilding = (building: BuildingMaster) => {
    setEditingBuilding(building);
    setIsModalOpen(true);
  };

  const handleUpdateBuilding = (building: BuildingMaster) => {
    updateBuildingMaster(building.id, building);
    setBuildings(getBuildingMasters());
    setIsModalOpen(false);
    setEditingBuilding(undefined);
  };

  const handleDeleteBuilding = (buildingId: string) => {
    if (confirm('Are you sure you want to delete this building? This action cannot be undone.')) {
      deleteBuildingMaster(buildingId);
      setBuildings(getBuildingMasters());
    }
  };

  const onSubmitBuilding = (building: BuildingMaster) => {
    if (editingBuilding) {
      handleUpdateBuilding(building);
    } else {
      handleAddBuilding(building);
    }
  };

  // Calculate dynamic metrics
  const totalFloors = buildings.reduce((acc, b) => acc + b.floors.length, 0);
  const totalArea = buildings.reduce((acc, b) => acc + b.totalArea, 0);
  const averageArea = buildings.length > 0 ? (totalArea / buildings.length) : 0;
  const certificationsCount = new Set(buildings.map(b => b.greenCertification)).size;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Site Hierarchy</h1>
          <p className="text-slate-600 mt-1">Manage buildings, floors, and site infrastructure</p>
        </div>
        <button
          onClick={() => {
            setEditingBuilding(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
        >
          <span>➕</span> Add Building
        </button>
      </div>

      {/* Dynamic Site Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-blue-700 uppercase">Total Buildings</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{buildings.length}</p>
          <p className="text-xs text-blue-600 mt-1">Managed properties</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-green-700 uppercase">Total Floors</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalFloors}</p>
          <p className="text-xs text-green-600 mt-1">Across all buildings</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-purple-700 uppercase">Total Area</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{(totalArea / 1000).toFixed(1)}K</p>
          <p className="text-xs text-purple-600 mt-1">Sq.ft (total)</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-orange-700 uppercase">Avg Building Area</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{(averageArea / 1000).toFixed(1)}K</p>
          <p className="text-xs text-orange-600 mt-1">Sq.ft per building</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-300 rounded-lg shadow-sm">
          <p className="text-xs font-semibold text-pink-700 uppercase">Green Certs</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{certificationsCount}</p>
          <p className="text-xs text-pink-600 mt-1">Certifications</p>
        </div>
      </div>

      {/* Site Details */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase">Primary Site</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{siteData.siteBasicInfo.siteName}</p>
            <p className="text-xs text-slate-500 mt-2">{siteData.siteBasicInfo.address.split('\r\n')[1] || 'Bangalore'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase">Portfolio Type</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{siteData.siteBasicInfo.siteType}</p>
            <p className="text-xs text-slate-500 mt-2">{siteData.siteBasicInfo.region} Region</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase">Active Buildings</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{buildings.filter(b => b.status === 'Active').length}/{buildings.length}</p>
            <p className="text-xs text-slate-500 mt-2">{((buildings.filter(b => b.status === 'Active').length / buildings.length) * 100).toFixed(0)}% operational</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase">Sustainability</p>
            <p className="text-sm font-bold text-slate-900 mt-1">LEED Certified</p>
            <p className="text-xs text-slate-500 mt-2">{certificationsCount} different certifications</p>
          </div>
        </div>
      </div>

      {/* Building Type Distribution */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Building Types Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from(new Set(buildings.map(b => b.type))).map((type) => {
            const count = buildings.filter(b => b.type === type).length;
            const totalTypeArea = buildings.filter(b => b.type === type).reduce((sum, b) => sum + b.totalArea, 0);
            return (
              <div key={type} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 uppercase">{type}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{count}</p>
                <p className="text-xs text-blue-600 mt-1">{(totalTypeArea / 1000).toFixed(0)}K sq.ft</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buildings & Floors Hierarchy */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Building Hierarchy</h2>
        
            {/* Display all buildings from buildingMasters */}
            {buildings.map((building) => (
              <div key={building.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            {/* Building Header */}
            <button
              onClick={() => setExpandedBuilding(expandedBuilding === building.buildingCode ? null : building.buildingCode)}
              className="w-full p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xl transition-transform ${expandedBuilding === building.buildingCode ? 'rotate-90' : ''}`}>
                  ▶
                </span>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900">🏢 {building.name}</h3>
                  <p className="text-xs text-slate-600">{building.floors.length} floors • {building.buildingCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditBuilding(building);
                  }}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Edit building"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBuilding(building.id);
                  }}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                  title="Delete building"
                >
                  🗑️
                </button>
              </div>
            </button>

            {/* Building Details */}
            {expandedBuilding === building.buildingCode && (
              <div className="border-t border-slate-200 p-4 space-y-4 bg-slate-50">
                {/* Building Info */}
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-3">Building Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Status</p>
                      <p className="text-sm font-bold text-slate-900">{building.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Type</p>
                      <p className="text-sm font-bold text-slate-900">{building.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Completion Year</p>
                      <p className="text-sm font-bold text-slate-900">{building.completionYear}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Green Cert</p>
                      <p className="text-sm font-bold text-slate-900">{building.greenCertification || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Construction Area</p>
                      <p className="text-sm font-bold text-slate-900">{building.constructionArea.toLocaleString()} sqft</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Saleable Area</p>
                      <p className="text-sm font-bold text-slate-900">{building.saleableArea.toLocaleString()} sqft</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Manager</p>
                      <p className="text-sm font-bold text-slate-900">{building.manager}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase font-semibold">Address</p>
                      <p className="text-sm font-bold text-slate-900">{building.address}</p>
                    </div>
                  </div>
                </div>

                {/* Floors Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold text-slate-700">Floor Name</th>
                          <th className="px-4 py-2 text-left font-semibold text-slate-700">Level</th>
                          <th className="px-4 py-2 text-left font-semibold text-slate-700">Area (Sq.ft)</th>
                          <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {building.floors.map((floor) => (
                          <tr key={floor.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {floor.name}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {floor.level}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {floor.area.toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                                {floor.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Management Structure */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Site Management Structure & Accountability</h2>
        
        {/* Corporate Leadership */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">🏢 Corporate Leadership</h3>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Cluster Head</p>
              <p className="text-sm font-bold text-slate-900">{siteData.organogram.clusterHead}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Complex Head</p>
              <p className="text-sm font-bold text-slate-900">{siteData.organogram.complexHead}</p>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-green-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">👔 Operational Management</h3>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Building Manager</p>
              <p className="text-sm font-bold text-slate-900">{siteData.organogram.buildingManager}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Shift Managers</p>
              <p className="text-sm font-bold text-slate-900">{siteData.organogram.shiftManagers.length} personnel</p>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-purple-50 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2">👨‍💼 Subject Matter Experts</h3>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Technical Lead</p>
              <p className="text-sm font-bold text-slate-900">{siteData.organogram.clusterTechnicalSME}</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase font-semibold">Soft Services Lead</p>
              <p className="text-sm font-bold text-slate-900">{siteData.organogram.clusterSoftSME}</p>
            </div>
          </div>
        </div>

        {/* Building Managers */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>🏗️</span> Building Management Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {buildings.map((building) => (
              <div key={building.id} className="p-3 bg-white border border-blue-300 rounded-lg">
                <p className="text-xs font-semibold text-blue-700 uppercase">{building.name}</p>
                <p className="text-sm font-bold text-slate-900 mt-2">{building.manager}</p>
                <p className="text-xs text-slate-600 mt-1">{building.buildingCode}</p>
                <p className="text-xs text-slate-500 mt-1">{building.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized Teams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">🔧 Technical Services</h4>
            <p className="text-sm text-slate-700 mb-2">{siteData.organogram.clusterTechnicalSME}</p>
            <p className="text-xs text-orange-600">HVAC, Electrical, Plumbing, Fire Safety</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🧹 Soft Services</h4>
            <p className="text-sm text-slate-700 mb-2">{siteData.organogram.clusterSoftSME}</p>
            <p className="text-xs text-green-600">Housekeeping, Pest Control, Landscaping</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">🛡️ Security & Safety</h4>
            <p className="text-sm text-slate-700 mb-2">{siteData.organogram.clusterSecuritySME}</p>
            <p className="text-xs text-red-600">Access Control, CCTV, Patrolling, QHSE</p>
          </div>
        </div>

        {/* Shift Schedule */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span>⏰</span> Shift Management Schedule
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {siteData.organogram.shiftManagers.map((manager, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-300 rounded-lg">
                <p className="text-xs text-blue-700 uppercase font-semibold">Shift {idx + 1} Manager</p>
                <p className="text-sm font-bold text-slate-900 mt-2">{manager}</p>
                <p className="text-xs text-blue-600 mt-2">{idx === 0 ? '06:00 - 14:00' : idx === 1 ? '14:00 - 22:00' : '22:00 - 06:00'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Water Management Infrastructure */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6">💧 Water Management Infrastructure</h2>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-700 mb-2">Total Water Storage Capacity: <span className="font-bold text-blue-700">{siteData.waterTanks.reduce((sum, tank) => sum + tank.capacityKL, 0)} KL</span></p>
          <p className="text-xs text-slate-600">Supporting {buildings.length} buildings with {totalFloors} floors across {(totalArea / 1000).toFixed(1)}K sq.ft</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Tank Name</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Location</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700 text-center">Capacity (KL)</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700 text-center">Size (Cu.ft)</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {siteData.waterTanks.map((tank, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{tank.name}</td>
                  <td className="px-4 py-3 text-slate-700">{tank.location}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{tank.capacityKL}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-center">{tank.sizeCuFt ? tank.sizeCuFt.toFixed(0) : 'N/A'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Building Master Data */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Building Master Database</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Building Name</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Code</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Manager</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Area (Sq.ft)</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {buildings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-4 text-center text-slate-500">
                    No buildings added yet. Click "Add Building" to create one.
                  </td>
                </tr>
              ) : (
                buildings.map((building) => (
                  <tr key={building.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{building.name}</td>
                    <td className="px-4 py-3 text-slate-700">{building.buildingCode}</td>
                    <td className="px-4 py-3 text-slate-700">{building.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        building.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : building.status === 'Under Construction'
                          ? 'bg-orange-100 text-orange-800'
                          : building.status === 'Planned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {building.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{building.manager || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{building.totalArea.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                      <button
                        onClick={() => handleEditBuilding(building)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-all text-xs font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBuilding(building.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-all text-xs font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Building Form Modal */}
      <BuildingFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBuilding(undefined);
        }}
        onSubmit={onSubmitBuilding}
        initialData={editingBuilding}
        isEditing={!!editingBuilding}
      />
    </div>
  );
};
