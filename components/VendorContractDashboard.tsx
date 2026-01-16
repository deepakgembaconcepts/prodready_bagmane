import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import type { VendorMaster, ContractEnhanced } from '../services/contractVendorService';
import {
  createVendorContractLink,
  calculateVendorHealth,
  generateVendorContractHealthReport,
  type VendorContractLink,
  type VendorHealthMetrics,
} from '../services/vendorContractSyncService';

interface VendorContractDashboardProps {
  vendors: VendorMaster[];
  contracts: ContractEnhanced[];
}

export const VendorContractDashboard: React.FC<VendorContractDashboardProps> = ({
  vendors,
  contracts,
}) => {
  const [activeVendor, setActiveVendor] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<'all' | 'healthy' | 'at-risk' | 'critical'>('all');

  // Create linked vendor-contract data
  const vendorLinks = useMemo(() => {
    return vendors.map(vendor => {
      const vendorContracts = contracts.filter(c => c.vendorId === vendor.id);
      return createVendorContractLink(vendor, vendorContracts);
    });
  }, [vendors, contracts]);

  // Generate health report
  const healthReport = useMemo(() => {
    return generateVendorContractHealthReport(vendorLinks);
  }, [vendorLinks]);

  // Filter vendors by risk level
  const filteredVendors = useMemo(() => {
    let filtered = vendorLinks;
    
    if (filterRisk === 'healthy') {
      filtered = healthReport.healthyVendors;
    } else if (filterRisk === 'at-risk') {
      filtered = healthReport.atRiskVendors;
    } else if (filterRisk === 'critical') {
      filtered = healthReport.criticalVendors;
    }
    
    return filtered;
  }, [filterRisk, healthReport, vendorLinks]);

  // Get details for selected vendor
  const selectedVendorData = useMemo(() => {
    if (!activeVendor) return null;
    const vendor = vendors.find(v => v.id === activeVendor);
    if (!vendor) return null;
    const vendorContracts = contracts.filter(c => c.vendorId === activeVendor);
    return {
      vendor,
      contracts: vendorContracts,
      health: calculateVendorHealth(vendor, vendorContracts),
    };
  }, [activeVendor, vendors, contracts]);

  return (
    <div className="space-y-6">
      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Healthy Vendors</p>
              <p className="text-2xl font-bold text-green-600">{healthReport.summary.healthy}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <CheckCircleIcon />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">At Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{healthReport.summary.atRisk}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
              <AlertIcon />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Critical</p>
              <p className="text-2xl font-bold text-red-600">{healthReport.summary.critical}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full text-red-600">
              <ExclamationIcon />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Avg Health Score</p>
              <p className="text-2xl font-bold text-brand-primary">{healthReport.summary.avgHealthScore}%</p>
            </div>
            <div className="p-2 bg-brand-primary bg-opacity-10 rounded-full text-brand-primary">
              <HealthIcon />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor List with Risk Indicators */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-800">Vendors & Contracts</h3>
            </CardHeader>
            <CardContent>
              {/* Risk Filter */}
              <div className="mb-4 flex gap-2 flex-wrap">
                {(['all', 'healthy', 'at-risk', 'critical'] as const).map(risk => (
                  <button
                    key={risk}
                    onClick={() => setFilterRisk(risk)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      filterRisk === risk
                        ? 'bg-brand-primary text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {risk === 'at-risk' ? 'At-Risk' : risk.charAt(0).toUpperCase() + risk.slice(1)}
                  </button>
                ))}
              </div>

              {/* Vendor List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredVendors.map(link => (
                  <button
                    key={link.vendorId}
                    onClick={() => setActiveVendor(link.vendorId)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      activeVendor === link.vendorId
                        ? 'border-brand-primary bg-brand-primary bg-opacity-5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{link.vendorName}</p>
                        <p className="text-xs text-slate-500">
                          {link.activeContractCount} active • ₹{(link.totalContractValue / 100000).toFixed(1)}L
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${
                        link.healthScore >= 80 ? 'bg-green-100 text-green-800' :
                        link.healthScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(link.healthScore)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Details & Related Contracts */}
        <div className="lg:col-span-2">
          {selectedVendorData ? (
            <div className="space-y-4">
              {/* Vendor Health Card */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-800">{selectedVendorData.vendor.name}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500 font-medium">Rating</p>
                      <p className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                        {selectedVendorData.vendor.rating}⭐
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500 font-medium">Performance Score</p>
                      <p className="text-2xl font-bold text-brand-primary">
                        {Math.round(selectedVendorData.health.performanceScore)}%
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500 font-medium">Active Contracts</p>
                      <p className="text-2xl font-bold text-slate-800">{selectedVendorData.health.activeContracts}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-xs text-slate-500 font-medium">Total Value</p>
                      <p className="text-lg font-bold text-slate-800">
                        ₹{(selectedVendorData.health.totalContractValue / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>

                  {/* Status & Risk Level */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                        selectedVendorData.vendor.status === 'Active' ? 'bg-green-100 text-green-800' :
                        selectedVendorData.vendor.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedVendorData.vendor.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Risk Level</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                        selectedVendorData.health.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                        selectedVendorData.health.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedVendorData.health.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Warnings */}
                  {selectedVendorData.health.contractsExpiringIn30Days > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                      <p className="text-sm font-semibold text-orange-800">
                        ⚠️ {selectedVendorData.health.contractsExpiringIn30Days} contract(s) expiring within 30 days
                      </p>
                    </div>
                  )}

                  {selectedVendorData.health.contractsExpired > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-semibold text-red-800">
                        🚨 {selectedVendorData.health.contractsExpired} expired contract(s) - Action needed
                      </p>
                    </div>
                  )}

                  {selectedVendorData.vendor.status === 'Blacklisted' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-semibold text-red-800">🚫 Vendor is blacklisted</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related Contracts */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Linked Contracts ({selectedVendorData.contracts.length})
                  </h3>
                </CardHeader>
                <CardContent>
                  {selectedVendorData.contracts.length > 0 ? (
                    <div className="space-y-2">
                      {selectedVendorData.contracts.map(contract => {
                        const now = new Date();
                        const daysLeft = Math.ceil(
                          (new Date(contract.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        );

                        return (
                          <div key={contract.id} className="p-3 border border-slate-200 rounded hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-slate-800 text-sm">{contract.title}</p>
                                <p className="text-xs text-slate-500">
                                  {contract.type} • {new Date(contract.startDate).toLocaleDateString()} to{' '}
                                  {new Date(contract.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${
                                daysLeft <= 0 ? 'bg-red-100 text-red-800' :
                                daysLeft < 30 ? 'bg-red-100 text-red-800' :
                                daysLeft < 90 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {daysLeft <= 0 ? 'EXPIRED' : `${daysLeft}d`}
                              </div>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 mt-1">₹{contract.value.toLocaleString()}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-slate-400 text-sm py-4">No contracts linked to this vendor</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Select a vendor to view details and linked contracts</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </svg>
);

const HealthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);
