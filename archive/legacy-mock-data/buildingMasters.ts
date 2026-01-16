import { Building, Floor } from '../types';
import { BTP_ADDITIONAL_BUILDINGS, BTP_PARIN_SITE_DATA } from './btpSiteData';

export interface BuildingMaster extends Building {
  buildingCode: string;
  type: string;
  greenCertification?: string;
  constructionArea: number;
  saleableArea: number;
  completionYear: number;
  status: 'Active' | 'Under Construction' | 'Planned' | 'Decommissioned';
  manager: string;
  contactNumber?: string;
}

// Create floors array from BTP Parin floor details
const createFloorsFromParin = (): Floor[] => {
  return BTP_PARIN_SITE_DATA.floorDetails.map((floorDetail, idx) => ({
    id: `parin-f${idx}`,
    name: floorDetail.floor,
    level: idx,
    area: floorDetail.floorAreaSqft,
    status: 'Occupied',
  }));
};

// Create default floors for other buildings
const createDefaultFloors = (count: number, baseArea: number): Floor[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `f${i}`,
    name: i === 0 ? 'Ground Floor' : `${i} Floor`,
    level: i,
    area: baseArea / count,
    status: 'Occupied',
  }));
};

export const BTP_PARIN_BUILDING: BuildingMaster = {
  id: 'bld-001',
  buildingCode: BTP_PARIN_SITE_DATA.buildingInfo.buildingName,
  name: `Bagmane ${BTP_PARIN_SITE_DATA.buildingInfo.buildingName}`,
  type: BTP_PARIN_SITE_DATA.buildingInfo.buildingType,
  greenCertification: BTP_PARIN_SITE_DATA.buildingInfo.greenCertification,
  constructionArea: parseFloat(BTP_PARIN_SITE_DATA.buildingInfo.totalConstructionArea.replace(/[^0-9.]/g, '')),
  saleableArea: parseFloat(BTP_PARIN_SITE_DATA.buildingInfo.totalSaleableArea.replace(/[^0-9.]/g, '')),
  completionYear: BTP_PARIN_SITE_DATA.buildingInfo.completionDate,
  address: BTP_PARIN_SITE_DATA.siteBasicInfo.address,
  totalArea: parseFloat(BTP_PARIN_SITE_DATA.buildingInfo.totalConstructionArea.replace(/[^0-9.]/g, '')),
  status: 'Active',
  manager: 'Ramesh Paul S',
  contactNumber: '+91-80-XXXX-XXXX',
  floors: createFloorsFromParin(),
};

// Create buildings from BTP_ADDITIONAL_BUILDINGS
const createBuildingFromBTPData = (btpBuilding: any, id: string): BuildingMaster => {
  const area = typeof btpBuilding.totalArea === 'string' 
    ? parseFloat(btpBuilding.totalArea.replace(/[^0-9.]/g, ''))
    : btpBuilding.totalArea;
  
  return {
    id,
    buildingCode: btpBuilding.buildingCode,
    name: btpBuilding.buildingName,
    type: btpBuilding.buildingType,
    greenCertification: btpBuilding.greenCertification,
    constructionArea: area,
    saleableArea: area,
    completionYear: btpBuilding.completionYear,
    address: btpBuilding.address,
    totalArea: area,
    status: btpBuilding.status,
    manager: btpBuilding.manager,
    contactNumber: '+91-80-XXXX-XXXX',
    floors: createDefaultFloors(btpBuilding.floors, area),
  };
};

// Create buildings from BTP_ADDITIONAL_BUILDINGS for all Bagmane properties
export const BTP_LAUREL_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[0], 'bld-002');
export const BTP_LAUREL1_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[1], 'bld-003');
export const BTP_TRIDIB_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[2], 'bld-004');
export const BTP_CROWN_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[3], 'bld-005');
export const BTP_QUAY_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[4], 'bld-006');
export const BTP_LAKEVIEW_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[5], 'bld-007');
export const BTP_OLYMPIA_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[6], 'bld-008');
export const BTP_COMMERZ1_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[7], 'bld-009');
export const BTP_COMMERZ2_BUILDING: BuildingMaster = createBuildingFromBTPData(BTP_ADDITIONAL_BUILDINGS[8], 'bld-010');

// Building masters repository - all 10 Bagmane properties
let buildingMasters: BuildingMaster[] = [
  BTP_PARIN_BUILDING,
  BTP_LAUREL_BUILDING,
  BTP_LAUREL1_BUILDING,
  BTP_TRIDIB_BUILDING,
  BTP_CROWN_BUILDING,
  BTP_QUAY_BUILDING,
  BTP_LAKEVIEW_BUILDING,
  BTP_OLYMPIA_BUILDING,
  BTP_COMMERZ1_BUILDING,
  BTP_COMMERZ2_BUILDING,
];

export const getBuildingMasters = (): BuildingMaster[] => {
  return [...buildingMasters];
};

export const addBuildingMaster = (building: BuildingMaster): BuildingMaster => {
  // Ensure unique ID
  if (buildingMasters.some(b => b.id === building.id)) {
    building.id = `bld-${Date.now()}`;
  }
  buildingMasters.push(building);
  return building;
};

export const updateBuildingMaster = (buildingId: string, updates: Partial<BuildingMaster>): BuildingMaster | null => {
  const index = buildingMasters.findIndex(b => b.id === buildingId);
  if (index === -1) return null;
  
  buildingMasters[index] = { ...buildingMasters[index], ...updates };
  return buildingMasters[index];
};

export const deleteBuildingMaster = (buildingId: string): boolean => {
  const index = buildingMasters.findIndex(b => b.id === buildingId);
  if (index === -1) return false;
  
  buildingMasters.splice(index, 1);
  return true;
};

export const getBuildingMasterByCode = (code: string): BuildingMaster | undefined => {
  return buildingMasters.find(b => b.buildingCode === code);
};

// Initialize localStorage with default data if empty
export const initializeBuildingMasters = () => {
  try {
    const stored = localStorage.getItem('buildingMasters');
    if (!stored) {
      localStorage.setItem('buildingMasters', JSON.stringify(buildingMasters));
    } else {
      buildingMasters = JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Could not access localStorage, using in-memory storage');
  }
};
