import React, { useState, useEffect } from 'react';
import { getBTPSiteDataByBuildingCode } from '../data/btpSiteData';
import { getBuildingMasters, addBuildingMaster, updateBuildingMaster, deleteBuildingMaster, initializeBuildingMasters, BuildingMaster } from '../data/buildingMasters';
import { BuildingFormModal } from './BuildingFormModal';

export const SiteHierarchy: React.FC = () => {
  const [selectedBuildingCode, setSelectedBuildingCode] = useState<string>('Parin');
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>('Parin');
  const [buildings, setBuildings] = useState<BuildingMaster[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingMaster | undefined>();
  const [activeTab, setActiveTab] = useState<'details' | 'dashboard'>('details');
  
  // Get dynamic site data based on selected building
  const siteData = getBTPSiteDataByBuildingCode(selectedBuildingCode);
  const selectedBuilding = buildings.find(b => b.buildingCode === selectedBuildingCode);

  // Initialize buildings on component mount
  useEffect(() => {
    initializeBuildingMasters();
    setBuildings(getBuildingMasters());
  }, []);

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

  // Calculate metrics from current selected building's floor data
  const totalFloorArea = siteData ? siteData.floorDetails.reduce((sum, f) => sum + f.floorAreaSqft, 0) : 0;
  // Extract number from totalSaleableArea and convert from Sq. mtrs to Sq.ft (1 sq mtr = 10.764 sq ft)
  const totalSaleableAreaMatch = siteData ? siteData.buildingInfo.totalSaleableArea.match(/[\d.]+/) : null;
  const totalSaleableAreaSqMtrs = totalSaleableAreaMatch ? parseFloat(totalSaleableAreaMatch[0]) : 0;
  const leaseableArea = totalSaleableAreaSqMtrs * 10.764; // Convert sq.mtrs to sq.ft
  const availableArea = Math.max(0, leaseableArea - totalFloorArea); // Ensure no negative values
  const balanceAreaLeased = leaseableArea > 0 ? ((totalFloorArea / leaseableArea) * 100).toFixed(2) : '0';
  const totalWaterCapacity = siteData ? siteData.waterTanks.reduce((sum, tank) => sum + tank.capacityKL, 0) : 0;
  const buildingCertification = siteData ? siteData.buildingInfo.greenCertification : 'N/A';
  const tenantCount = siteData ? siteData.tenants.length : 0;

  return (
    <div className="space-y-6 p-6">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Site Hierarchy & Master Data</h1>
          <p className="text-slate-600 mt-1">Comprehensive Infrastructure Overview</p>
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

      {/* ===== TABS ===== */}
      <div className="flex gap-4 border-b border-slate-300">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-3 font-semibold transition-all ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Site Details
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-3 font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Site Details Dashboard
        </button>
      </div>

      {/* ===== PAGE 1: SITE DETAILS ===== */}
      {activeTab === 'details' && (
      <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-3">SELECT BUILDING FOR DETAILED VIEW:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {buildings.map((building) => (
            <button
              key={building.id}
              onClick={() => setSelectedBuildingCode(building.buildingCode)}
              className={`p-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                selectedBuildingCode === building.buildingCode
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
              }`}
            >
              {building.buildingCode}
            </button>
          ))}
        </div>
        {siteData && (
          <p className="text-xs text-green-700 mt-3 p-2 bg-green-50 rounded border border-green-200">
            ✓ Detailed BTP site data available for Parin
          </p>
        )}
        {!siteData && (
          <p className="text-xs text-amber-700 mt-3 p-2 bg-amber-50 rounded border border-amber-200">
            ⓘ Basic building information available. Detailed BTP site data only available for Parin.
          </p>
        )}
      </div>

      {/* ===== SITE OVERVIEW CARDS ===== */}
      {siteData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-blue-700 uppercase">Building Name</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{siteData.siteBasicInfo.siteName}</p>
            <p className="text-xs text-blue-600 mt-1">{siteData.siteBasicInfo.siteType}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-green-700 uppercase">Building Status</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{siteData.floorDetails.length}</p>
            <p className="text-xs text-green-600 mt-1">Floors (All Leased)</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-purple-700 uppercase">Total Area</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{(parseFloat(siteData.buildingInfo.totalSaleableArea.replace(/[^0-9.]/g, '')) / 1000).toFixed(1)}K</p>
            <p className="text-xs text-purple-600 mt-1">Sq.m (Saleable)</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-orange-700 uppercase">Completion</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{siteData.buildingInfo.completionDate}</p>
            <p className="text-xs text-orange-600 mt-1">Year</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-300 rounded-lg shadow-sm">
            <p className="text-xs font-semibold text-pink-700 uppercase">Green Cert</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{siteData.buildingInfo.greenCertification}</p>
            <p className="text-xs text-pink-600 mt-1">Certified</p>
          </div>
        </div>
      ) : (
        // Show data for buildings without detailed site data
        selectedBuilding ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg shadow-sm">
              <p className="text-xs font-semibold text-blue-700 uppercase">Building Name</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{selectedBuilding.name}</p>
              <p className="text-xs text-blue-600 mt-1">{selectedBuilding.buildingCode}</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-300 rounded-lg shadow-sm">
              <p className="text-xs font-semibold text-green-700 uppercase">Floors</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{selectedBuilding.floors.length}</p>
              <p className="text-xs text-green-600 mt-1">Total Floors</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg shadow-sm">
              <p className="text-xs font-semibold text-purple-700 uppercase">Total Area</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{(selectedBuilding.totalArea / 1000).toFixed(1)}K</p>
              <p className="text-xs text-purple-600 mt-1">Sq.m</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded-lg shadow-sm">
              <p className="text-xs font-semibold text-orange-700 uppercase">Completion</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{selectedBuilding.completionYear}</p>
              <p className="text-xs text-orange-600 mt-1">Year</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-300 rounded-lg shadow-sm">
              <p className="text-xs font-semibold text-pink-700 uppercase">Manager</p>
              <p className="text-lg font-bold text-slate-900 mt-2">{selectedBuilding.manager}</p>
              <p className="text-xs text-pink-600 mt-1">{selectedBuilding.type}</p>
            </div>
          </div>
        ) : null
      )}

      {/* ===== SITE DETAILS ===== */}
      {siteData && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">📍 Site Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Location</p>
              <p className="text-sm text-slate-900 mt-1 font-semibold">{siteData.siteBasicInfo.address.split('\r\n')[1]?.trim() || siteData.siteBasicInfo.address.split(',')[0]}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Region</p>
              <p className="text-sm text-slate-900 mt-1 font-semibold">{siteData.siteBasicInfo.region}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Building Type</p>
              <p className="text-sm text-slate-900 mt-1 font-semibold">{siteData.buildingInfo.buildingType}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Owner</p>
              <p className="text-sm text-slate-900 mt-1 font-semibold">{siteData.siteBasicInfo.entityOwner}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== FLOOR DETAILS ===== */}
      {siteData && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">🏢 {siteData.siteBasicInfo.siteName} - Floor Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-700">Floor</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-700">Area (Sq.ft)</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-700">Fire NOC (Sq.m)</th>
                <th className="px-4 py-2 text-center font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {siteData.floorDetails.map((floor, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{floor.floor}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{floor.floorAreaSqft.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{floor.fireNOCArea}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                      {floor.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-700"><span className="font-bold">Total Area:</span> {totalFloorArea.toLocaleString()} Sq.ft</p>
        </div>
      </div>
      )}

      {/* ===== OTHER BUILDING FLOORS ===== */}
      {!siteData && selectedBuilding && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">🏢 {selectedBuilding.name} - Floor Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Floor</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Level</th>
                  <th className="px-4 py-2 text-right font-semibold text-slate-700">Area (Sq.ft)</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedBuilding.floors.map((floor) => (
                  <tr key={floor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{floor.name}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{floor.level}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{floor.area.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                        {floor.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-slate-700"><span className="font-bold">Total Area:</span> {selectedBuilding.totalArea.toLocaleString()} Sq.ft</p>
          </div>
        </div>
      )}

      {/* ===== ELECTRICAL INFRASTRUCTURE (Parin only) ===== */}
      {siteData && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">⚡ Electrical Infrastructure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {siteData.operationalDetails.map((detail, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <h3 className="font-semibold text-slate-800 mb-3">{detail.connectionType}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold">HT Meters</p>
                    <p className="text-lg font-bold text-slate-900">{detail.htMeters}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold">LT Meters</p>
                    <p className="text-lg font-bold text-slate-900">{detail.ltMeters}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold">Connected Load (kW)</p>
                    <p className="text-lg font-bold text-slate-900">{detail.connectedLoad}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold">Billing Demand (kW)</p>
                    <p className="text-lg font-bold text-slate-900">{detail.billingDemand}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-600 uppercase font-semibold">Service Provider</p>
                    <p className="text-lg font-bold text-slate-900">{detail.serviceProvider}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== WATER MANAGEMENT ===== */}
      {siteData && (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">💧 Water Management System - {siteData.siteBasicInfo.siteName}</h2>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-lg font-bold text-blue-900">Total Capacity: {totalWaterCapacity} KL</p>
          <p className="text-sm text-slate-600 mt-1">{siteData.waterTanks.length} tanks across Ground, Terrace, and STP facility</p>
        </div>

        {/* Ground Level Tanks */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">🔴 Ground Level Tanks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Tank Name</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Capacity (KL)</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Volume (Cu.ft)</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {siteData.waterTanks.filter(t => t.location === 'Ground').map((tank, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{tank.name}</td>
                    <td className="px-4 py-3 text-center"><span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded font-bold text-xs">{tank.capacityKL}</span></td>
                    <td className="px-4 py-3 text-center text-slate-700">{tank.sizeCuFt?.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{tank.name.includes('Fire') ? '🔴 Fire' : '💧 Storage'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terrace Level Tanks */}
        <div className="mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">🟡 Terrace Level Tanks</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Tank Name</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Capacity (KL)</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Volume (Cu.ft)</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {siteData.waterTanks.filter(t => t.location === 'Terrace').map((tank, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{tank.name}</td>
                    <td className="px-4 py-3 text-center"><span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded font-bold text-xs">{tank.capacityKL}</span></td>
                    <td className="px-4 py-3 text-center text-slate-700">{tank.sizeCuFt?.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{tank.name.includes('Fire') ? '🔴 Fire' : '💧 Storage'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* STP Facility */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-3">🟢 Sewage Treatment Plant (STP)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-700">Tank/Stage</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Capacity (KL)</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Volume (Cu.ft)</th>
                  <th className="px-4 py-2 text-center font-semibold text-slate-700">Function</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {siteData.waterTanks.filter(t => t.location === 'STP').map((tank, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{tank.name}</td>
                    <td className="px-4 py-3 text-center"><span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded font-bold text-xs">{tank.capacityKL}</span></td>
                    <td className="px-4 py-3 text-center text-slate-700">{tank.sizeCuFt?.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center text-slate-700 text-xs">
                      {tank.name.includes('Raw') && 'Input'}
                      {tank.name.includes('Anoxic') && 'Biological'}
                      {tank.name.includes('Aeration') && 'Treatment'}
                      {tank.name.includes('MBR') && 'Filtration'}
                      {tank.name.includes('Final') && 'Output'}
                      {tank.name.includes('Sludge') && 'Residue'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* ===== MANAGEMENT STRUCTURE ===== */}
      {siteData && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">👔 Site Management Structure - {siteData.siteBasicInfo.siteName}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-300">
              <h3 className="font-semibold text-blue-900 mb-3">🏢 Leadership</h3>
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-blue-700 font-semibold">CLUSTER HEAD</p><p className="font-bold text-slate-900">{siteData.organogram.clusterHead}</p></div>
                <div><p className="text-xs text-blue-700 font-semibold">COMPLEX HEAD</p><p className="font-bold text-slate-900">{siteData.organogram.complexHead}</p></div>
                <div><p className="text-xs text-blue-700 font-semibold">BUILDING MANAGER</p><p className="font-bold text-slate-900">{siteData.organogram.buildingManager}</p></div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-300">
              <h3 className="font-semibold text-green-900 mb-3">🔧 Technical Leaders</h3>
              <div className="space-y-2 text-sm">
                <div><p className="text-xs text-green-700 font-semibold">TECHNICAL SME</p><p className="font-bold text-slate-900">{siteData.organogram.clusterTechnicalSME}</p></div>
                <div><p className="text-xs text-green-700 font-semibold">SOFT SERVICES SME</p><p className="font-bold text-slate-900">{siteData.organogram.clusterSoftSME}</p></div>
                <div><p className="text-xs text-green-700 font-semibold">SECURITY SME</p><p className="font-bold text-slate-900">{siteData.organogram.clusterSecuritySME}</p></div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-300">
              <h3 className="font-semibold text-orange-900 mb-3">⏰ Shift Managers</h3>
              <div className="space-y-2 text-sm">
                {siteData.organogram.shiftManagers.map((manager, idx) => (
                  <div key={idx}>
                    <p className="text-xs text-orange-700 font-semibold">SHIFT {idx + 1}</p>
                    <p className="font-bold text-slate-900">{manager}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADDITIONAL BUILDINGS REGISTRY ===== */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">🏗️ Buildings Registry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {buildings.map((building) => (
            <div key={building.id} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-300">
              <p className="text-xs font-semibold text-slate-700 uppercase">{building.buildingCode}</p>
              <p className="font-bold text-slate-900 mt-1 text-sm">{building.name}</p>
              <p className="text-xs text-slate-600 mt-2">{building.type}</p>
              <div className="mt-3 flex gap-1">
                <button
                  onClick={() => handleEditBuilding(building)}
                  className="text-blue-600 hover:bg-blue-100 p-1 rounded text-sm"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteBuilding(building.id)}
                  className="text-red-600 hover:bg-red-100 p-1 rounded text-sm"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      )}

      {/* ===== PAGE 2: SITE DETAILS DASHBOARD ===== */}
      {activeTab === 'dashboard' && (
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Region</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>All Regions</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Campus</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Bagmane</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Building</label>
              <select 
                value={selectedBuildingCode}
                onChange={(e) => setSelectedBuildingCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.buildingCode}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dashboard Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 font-semibold">Total Leased Area (Sq.Ft)</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{leaseableArea.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 font-semibold">Available Area for Leasing (Sq.Ft)</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{availableArea.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 font-semibold">Balance Area Leased Out (%)</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">{balanceAreaLeased}%</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-600 font-semibold">Water Tank Capacity (KL)</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{totalWaterCapacity}</p>
          </div>
        </div>

        {/* Details Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Site Details Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Property</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedBuilding && siteData && (
                  <>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Building Code</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{selectedBuilding.buildingCode}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Building Name</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{selectedBuilding.name}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Type</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{selectedBuilding.type}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Total Leased Area (Sq.Ft)</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{leaseableArea.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Available Area for Leasing (Sq.Ft)</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{availableArea.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Balance Area Leased Out (%)</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{balanceAreaLeased}%</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Building Certifications</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{buildingCertification}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Tenant Category</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{tenantCount > 0 ? `${tenantCount} Tenants` : 'No Tenants'}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Water Tank Details</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{totalWaterCapacity} KL Capacity</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm font-semibold text-slate-800">Parking Details</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{selectedBuilding.parkingSpaces || 'N/A'} spaces</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Modal */}
      <BuildingFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBuilding(undefined);
        }}
        onSubmit={onSubmitBuilding}
        initialData={editingBuilding}
      />
    </div>
  );
};
