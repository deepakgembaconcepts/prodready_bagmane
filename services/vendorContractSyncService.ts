/**
 * Vendor-Contract Synchronization Service
 * 
 * This service ensures vendor master data and contracts remain synchronized:
 * - When vendor rating/performance changes, affected contracts are flagged
 * - Contracts maintain FK reference to vendor (vendorId)
 * - Real-time performance metrics linked to vendor audits
 * - Unified dashboard showing vendor + contract health
 */

import type { VendorMaster, ContractEnhanced } from './contractVendorService';

export interface VendorContractLink {
  vendorId: string;
  vendorName: string;
  vendorRating: number;
  vendorPerformanceScore: number;
  vendorStatus: 'Active' | 'Inactive' | 'Blacklisted';
  contracts: ContractEnhanced[];
  totalContractValue: number;
  activeContractCount: number;
  expiringIn30Days: ContractEnhanced[];
  healthScore: number; // Calculated: (vendorPerformance + contractHealth) / 2
}

export interface VendorHealthMetrics {
  vendorId: string;
  vendorName: string;
  rating: number; // 1-5 stars
  performanceScore: number; // 0-100
  lastAuditDate?: Date;
  certifications: string[];
  activeContracts: number;
  totalContractValue: number;
  contractsExpiringIn30Days: number;
  contractsExpired: number;
  averageContractHealth: number; // Green/Yellow/Red score
  riskLevel: 'Low' | 'Medium' | 'High'; // Based on combined metrics
  lastUpdated: Date;
}

/**
 * Calculate vendor health based on performance and contracts
 */
export function calculateVendorHealth(vendor: VendorMaster, contracts: ContractEnhanced[]): VendorHealthMetrics {
  const now = new Date();
  
  // Performance score (weighted: rating 40%, audit recency 30%, certifications 30%)
  let performanceScore = (vendor.rating || 0) * 20; // Rating max 5 * 20 = 100
  
  // Recency factor (last audit within 6 months = +10)
  if (vendor.lastAuditDate) {
    const monthsSinceAudit = (now.getTime() - new Date(vendor.lastAuditDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
    performanceScore += Math.max(0, 10 - Math.floor(monthsSinceAudit / 6));
  }
  
  // Certifications (each cert = +5, max 15)
  performanceScore += Math.min(15, (vendor.certifications?.length || 0) * 5);
  
  // Contract health calculation
  const activeContracts = contracts.filter(c => c.status === 'Active').length;
  const expiredContracts = contracts.filter(c => c.status === 'Expired').length;
  const expiringIn30 = contracts.filter(c => {
    const daysLeft = Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  }).length;
  
  // Average contract health (weighted by days left)
  let contractHealthScore = 0;
  if (contracts.length > 0) {
    const healthScores = contracts.map(c => {
      const daysLeft = Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) return 0; // Expired = 0
      if (daysLeft <= 30) return 50; // Expiring soon = 50
      if (daysLeft <= 90) return 75; // Medium-term = 75
      return 100; // Healthy = 100
    });
    contractHealthScore = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
  }
  
  // Total value of active contracts
  const totalContractValue = contracts
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + (c.value || 0), 0);
  
  // Risk level determination
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (vendor.status === 'Blacklisted') {
    riskLevel = 'High';
  } else if (vendor.status === 'Inactive' || expiredContracts > 0 || expiringIn30 > activeContracts / 2) {
    riskLevel = 'High';
  } else if (performanceScore < 50 || contractHealthScore < 60 || vendor.rating < 3) {
    riskLevel = 'Medium';
  }
  
  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    rating: vendor.rating || 0,
    performanceScore: Math.min(100, performanceScore),
    lastAuditDate: vendor.lastAuditDate,
    certifications: vendor.certifications || [],
    activeContracts,
    totalContractValue,
    contractsExpiringIn30Days: expiringIn30,
    contractsExpired: expiredContracts,
    averageContractHealth: contractHealthScore,
    riskLevel,
    lastUpdated: new Date(),
  };
}

/**
 * Get linked vendor-contract data for dashboard
 */
export function createVendorContractLink(
  vendor: VendorMaster,
  contracts: ContractEnhanced[]
): VendorContractLink {
  const now = new Date();
  const expiringIn30Days = contracts.filter(c => {
    const daysLeft = Math.ceil((new Date(c.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  });
  
  const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);
  const activeCount = contracts.filter(c => c.status === 'Active').length;
  
  const vendorHealth = calculateVendorHealth(vendor, contracts);
  const contractHealth = contracts.length > 0
    ? expiringIn30Days.length === 0 ? 100 : 50 + (50 * (contracts.length - expiringIn30Days.length) / contracts.length)
    : 100;
  
  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    vendorRating: vendor.rating || 0,
    vendorPerformanceScore: vendorHealth.performanceScore,
    vendorStatus: vendor.status,
    contracts,
    totalContractValue: totalValue,
    activeContractCount: activeCount,
    expiringIn30Days,
    healthScore: (vendorHealth.performanceScore + contractHealth) / 2,
  };
}

/**
 * Flag contracts that need vendor review (performance drop or expiry risk)
 */
export function identifyVendorRiskContracts(
  vendorHealthMetrics: VendorHealthMetrics
): { flaggedContracts: string[]; riskReason: string; recommendedAction: string } {
  const issues: string[] = [];
  let riskReason = '';
  let recommendedAction = '';
  
  if (vendorHealthMetrics.performanceScore < 50) {
    issues.push('Low performance score');
    recommendedAction = 'Schedule vendor audit and performance review';
  }
  
  if (vendorHealthMetrics.contractsExpiringIn30Days > 0) {
    issues.push(`${vendorHealthMetrics.contractsExpiringIn30Days} contracts expiring within 30 days`);
    recommendedAction = 'Initiate renewal negotiations or transition planning';
  }
  
  if (vendorHealthMetrics.contractsExpired > 0) {
    issues.push(`${vendorHealthMetrics.contractsExpired} expired contracts`);
    recommendedAction = 'Review expired contracts and decide on renewal or replacement';
  }
  
  if (vendorHealthMetrics.rating < 3) {
    issues.push('Rating below 3 stars');
    recommendedAction = 'Consider vendor performance improvement plan or replacement';
  }
  
  riskReason = issues.join('; ');
  
  return {
    flaggedContracts: [],
    riskReason,
    recommendedAction,
  };
}

/**
 * Sync vendor update to all related contracts
 * Called when vendor rating/performance is updated
 */
export function syncVendorUpdateToContracts(
  vendor: VendorMaster,
  contracts: ContractEnhanced[]
): ContractEnhanced[] {
  return contracts.map(contract => {
    if (contract.vendorId === vendor.id) {
      // Update vendor reference data in contract
      return {
        ...contract,
        vendorName: vendor.name, // Keep in sync
        // Flag for review if vendor health changed significantly
        statusColor: getContractStatusColor(contract, vendor),
      };
    }
    return contract;
  });
}

/**
 * Determine contract status color based on vendor + contract health
 */
function getContractStatusColor(contract: ContractEnhanced, vendor: VendorMaster): string {
  const now = new Date();
  const daysLeft = Math.ceil((new Date(contract.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // If vendor is blacklisted, highest priority (red)
  if (vendor.status === 'Blacklisted') {
    return 'bg-red-100 text-red-800';
  }
  
  // Base color on days left
  if (daysLeft <= 0) return 'bg-red-100 text-red-800'; // Expired
  if (daysLeft < 30) return 'bg-red-100 text-red-800'; // Expiring soon
  if (daysLeft < 90) return 'bg-orange-100 text-orange-800'; // Medium-term
  
  // If vendor performance is low, warn even if contract is healthy
  if ((vendor.rating || 0) < 3 || (vendor.performanceScore || 0) < 50) {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  return 'bg-green-100 text-green-800'; // Healthy
}

/**
 * Batch sync: Update multiple contracts after vendor data change
 */
export function batchSyncVendorContracts(
  vendors: VendorMaster[],
  contracts: ContractEnhanced[]
): ContractEnhanced[] {
  return contracts.map(contract => {
    const vendor = vendors.find(v => v.id === contract.vendorId);
    if (vendor) {
      return {
        ...contract,
        vendorName: vendor.name,
        statusColor: getContractStatusColor(contract, vendor),
      };
    }
    return contract;
  });
}

/**
 * Export vendor-contract health report for audit
 */
export function generateVendorContractHealthReport(
  vendorLinks: VendorContractLink[]
): {
  healthyVendors: VendorContractLink[];
  atRiskVendors: VendorContractLink[];
  criticalVendors: VendorContractLink[];
  summary: { healthy: number; atRisk: number; critical: number; avgHealthScore: number };
} {
  const healthyVendors = vendorLinks.filter(v => v.healthScore >= 80);
  const atRiskVendors = vendorLinks.filter(v => v.healthScore >= 50 && v.healthScore < 80);
  const criticalVendors = vendorLinks.filter(v => v.healthScore < 50);
  
  const avgHealthScore = vendorLinks.length > 0
    ? vendorLinks.reduce((sum, v) => sum + v.healthScore, 0) / vendorLinks.length
    : 0;
  
  return {
    healthyVendors,
    atRiskVendors,
    criticalVendors,
    summary: {
      healthy: healthyVendors.length,
      atRisk: atRiskVendors.length,
      critical: criticalVendors.length,
      avgHealthScore: Math.round(avgHealthScore),
    },
  };
}
