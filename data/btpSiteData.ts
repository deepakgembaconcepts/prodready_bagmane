/**
 * BTP Site Details - Bagmane Parin Building Data
 * Source: BTP Site Details.xlsx
 */

export interface SiteBasicInfo {
  siteName: string;
  siteCode: string;
  cluster: string;
  address: string;
  country: string;
  state: string;
  region: string;
  siteType: string;
  climaticZone: string;
  sector: string;
  entityOwner: string;
}

export interface BuildingInfo {
  buildingName: string;
  buildingType: string;
  greenCertification: string;
  totalConstructionArea: string;
  totalSaleableArea: string;
  totalLandscapingArea: string;
  facadeArea: string;
  constructionStartDate: number;
  completionDate: number;
  handoverStartDate: number;
  handoverEndDate: number;
}

export interface FloorDetails {
  building: string;
  status: string;
  floor: string;
  floorAreaSqft: number;
  fireNOCArea: string;
}

export interface OperationalDetails {
  connectionType: string;
  htMeters: number;
  ltMeters: number;
  ammeters: number;
  voltmeters: number;
  tariffType: string;
  serviceProvider: string;
  connectedLoad: number;
  sanctionLoad: number;
  contractDemand: number;
  maximumDemand: number;
  billingDemand: number;
  stpMethodology: string;
  stpCapacity: number;
}

export interface WaterTank {
  name: string;
  location: string;
  capacityKL: number;
  sizeCuFt?: number;
}

export interface TenantInfo {
  clientName: string;
  clientCommonName: string;
  clientAgreementCost?: number;
  agreementNo?: string;
  noOfEmployees: number;
  noOfOutSourceStaff: number;
  totalEmployees: number;
  parkingAsPerAgreement: number;
  freeParking: number;
  paidParking: number;
}

export interface SiteOrganogram {
  clusterHead: string;
  complexHead: string;
  buildingManager: string;
  shiftManagers: string[];
  clusterTechnicalSME: string;
  clusterSoftSME: string;
  clusterQHSESME: string;
  clusterHortiSME: string;
  clusterSecuritySME: string;
  clusterTransitionSME: string;
  clusterHVACSME: string;
  clusterElectricalSME: string;
}

export interface SiteData {
  siteBasicInfo: SiteBasicInfo;
  buildingInfo: BuildingInfo;
  floorDetails: FloorDetails[];
  operationalDetails: OperationalDetails[];
  waterTanks: WaterTank[];
  tenants: TenantInfo[];
  organogram: SiteOrganogram;
}

// BTP Parin Site Data
export const BTP_PARIN_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Parin',
    siteCode: 'Parin',
    cluster: 'India',
    address: 'M/s Bagmane Developers Pvt. Ltd.\r\nCV Raman Nagar, Bangalore - 560093',
    country: 'India',
    state: 'Karnataka',
    region: 'South',
    siteType: 'Multi Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'BDPL',
  },
  buildingInfo: {
    buildingName: 'Parin',
    buildingType: 'REIT',
    greenCertification: 'LEED-Platinum',
    totalConstructionArea: '44520.716 Sq. mtrs.',
    totalSaleableArea: '44520.716 Sq. mtrs.',
    totalLandscapingArea: '6500 sq.ft',
    facadeArea: '112003 sq.ft',
    constructionStartDate: 2006,
    completionDate: 2007,
    handoverStartDate: 2007,
    handoverEndDate: 2007,
  },
  floorDetails: [
    { building: 'Parin', status: 'Leased', floor: 'Ground Floor', floorAreaSqft: 33187.5, fireNOCArea: '1,491.17 Sq. mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '1st floor', floorAreaSqft: 30392.44, fireNOCArea: '448.31 Sq. mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '2nd floor', floorAreaSqft: 32199.27, fireNOCArea: '1,432.29 Sq. mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '3rd floor', floorAreaSqft: 32199.27, fireNOCArea: '1,362.50 Sq. mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '4th floor', floorAreaSqft: 32199.27, fireNOCArea: '62.05 Sq. mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '5th floor', floorAreaSqft: 32199.27, fireNOCArea: '12,319.56 Sq. Mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '6th floor', floorAreaSqft: 32199.27, fireNOCArea: '10,040.18 Sq. Mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '7th floor', floorAreaSqft: 32199.27, fireNOCArea: '11,379.50 Sq. Mtrs.' },
    { building: 'Parin', status: 'Leased', floor: '8th floor', floorAreaSqft: 32199.27, fireNOCArea: '12,168.35 Sq. Mtrs.' },
    { building: 'Parin', status: 'Leased', floor: 'Terrace', floorAreaSqft: 31628.46, fireNOCArea: '2,092.55 Sq. Mtrs.' },
  ],
  operationalDetails: [
    {
      connectionType: 'HT - Parin A Block',
      htMeters: 2,
      ltMeters: 52,
      ammeters: 26,
      voltmeters: 14,
      tariffType: '1 HT2B',
      serviceProvider: 'BESCOM',
      connectedLoad: 2400,
      sanctionLoad: 2400,
      contractDemand: 2400,
      maximumDemand: 539,
      billingDemand: 2160,
      stpMethodology: 'MBR',
      stpCapacity: 200,
    },
    {
      connectionType: 'HT - Parin B Block',
      htMeters: 7,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: '1 HT2B',
      serviceProvider: 'BESCOM',
      connectedLoad: 7499,
      sanctionLoad: 7499,
      contractDemand: 7499,
      maximumDemand: 5108,
      billingDemand: 6749,
      stpMethodology: '',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Fire Water tank-1 (A block)', location: 'Ground', capacityKL: 260, sizeCuFt: 9181.796 },
    { name: 'Fire Water tank-2 (B block)', location: 'Ground', capacityKL: 260, sizeCuFt: 9181.796 },
    { name: 'Raw Water tank-1 (A block)', location: 'Ground', capacityKL: 50, sizeCuFt: 1765.73 },
    { name: 'Raw Water tank-2 (B block)', location: 'Ground', capacityKL: 50, sizeCuFt: 1765.73 },
    { name: 'Treated Water tank-1 (A block)', location: 'Ground', capacityKL: 50, sizeCuFt: 1765.73 },
    { name: 'Treated Water tank-2 (B block)', location: 'Ground', capacityKL: 50, sizeCuFt: 1765.73 },
    { name: 'Fire Water tank-1', location: 'Terrace', capacityKL: 50, sizeCuFt: 1765.73 },
    { name: 'Fire Water tank-2', location: 'Terrace', capacityKL: 50, sizeCuFt: 1765.73 },
    { name: 'Domestic Treated Water tank - 1', location: 'Terrace', capacityKL: 30, sizeCuFt: 1059.44 },
    { name: 'Domestic Treated Water tank - 2', location: 'Terrace', capacityKL: 30, sizeCuFt: 1059.44 },
    { name: 'STP-Flushing-1', location: 'Terrace', capacityKL: 30, sizeCuFt: 1059.44 },
    { name: 'STP-Flushing-2', location: 'Terrace', capacityKL: 30, sizeCuFt: 1059.44 },
    { name: 'STP Raw Water Tank', location: 'STP', capacityKL: 58, sizeCuFt: 2048.25 },
    { name: 'STP MBR tank', location: 'STP', capacityKL: 49, sizeCuFt: 1730.42 },
    { name: 'STP Anoxic tank', location: 'STP', capacityKL: 52, sizeCuFt: 1836.36 },
    { name: 'STP Aeration tank', location: 'STP', capacityKL: 143, sizeCuFt: 5049.99 },
    { name: 'STP Sludge Holding tank', location: 'STP', capacityKL: 22, sizeCuFt: 776.92 },
    { name: 'STP Final tank', location: 'STP', capacityKL: 200, sizeCuFt: 7062.92 },
  ],
  tenants: [
    {
      clientName: 'Volvo',
      clientCommonName: 'Volvo',
      noOfEmployees: 1790,
      noOfOutSourceStaff: 40,
      totalEmployees: 1830,
      parkingAsPerAgreement: 303,
      freeParking: 0,
      paidParking: 303,
    },
    {
      clientName: 'Dell',
      clientCommonName: 'Dell',
      noOfEmployees: 0,
      noOfOutSourceStaff: 0,
      totalEmployees: 0,
      parkingAsPerAgreement: 0,
      freeParking: 0,
      paidParking: 0,
    },
  ],
  organogram: {
    clusterHead: 'Manjunath KN',
    complexHead: 'Subramani S',
    buildingManager: 'Ramesh Paul S',
    shiftManagers: ['Rajshekar A S', 'Raghu B T', 'Saravanan R M'],
    clusterTechnicalSME: 'Rajshekar A S',
    clusterSoftSME: 'Venkatesh',
    clusterQHSESME: 'Deepak Mulley',
    clusterHortiSME: 'Suresh',
    clusterSecuritySME: 'Karunakaran',
    clusterTransitionSME: 'Prasad BS',
    clusterHVACSME: 'Rajashekar AS',
    clusterElectricalSME: 'Rajashekar AS',
  },
};

// Add additional buildings from BTP file
export const BTP_ADDITIONAL_BUILDINGS = [
  {
    buildingName: 'Bagmane Laurel',
    buildingCode: 'Laurel',
    buildingType: 'Commercial Office',
    greenCertification: 'LEED-Gold',
    totalConstructionArea: '70029.64 Sq. mtrs.',
    totalSaleableArea: '71943.02 Sq. mtrs.',
    status: 'Active' as const,
    completionYear: 2008,
    address: 'Bagmane Tech Park, CV Ramana Nagar, Bangalore-560093',
    totalArea: 70029.64,
    manager: 'TBD',
    floors: 8,
  },
  {
    buildingName: 'Laurel 1',
    buildingCode: 'Laurel 1',
    buildingType: 'Commercial Office',
    greenCertification: 'LEED-Gold',
    totalConstructionArea: '0 Sq. mtrs.',
    totalSaleableArea: '0 Sq. mtrs.',
    status: 'Active' as const,
    completionYear: 0,
    address: 'Bagmane Tech Park, Bangalore',
    totalArea: 0,
    manager: 'TBD',
    floors: 0,
  },
  {
    buildingName: 'Tridib',
    buildingCode: 'Tridib',
    buildingType: 'Commercial Office',
    greenCertification: 'N/A',
    totalConstructionArea: '63652.40 Sq. mtrs.',
    totalSaleableArea: '567991 Sq. ft.',
    status: 'Active' as const,
    completionYear: 2009,
    address: 'Bagmane Tech Park, CV Raman Nagar, Bangalore-560093',
    totalArea: 63652.40,
    manager: 'TBD',
    floors: 6,
  },
  {
    buildingName: 'Crown',
    buildingCode: 'Crown',
    buildingType: 'Commercial Office',
    greenCertification: 'LEED',
    totalConstructionArea: '290709.13 Sq. mtrs.',
    totalSaleableArea: '290709.13 Sq. mtrs.',
    status: 'Active' as const,
    completionYear: 2006,
    address: 'CV Raman Nagar, Bangalore - 560093',
    totalArea: 290709.13,
    manager: 'TBD',
    floors: 6,
  },
  {
    buildingName: 'Quay',
    buildingCode: 'Quay',
    buildingType: 'Commercial Office',
    greenCertification: 'LEED-Gold',
    totalConstructionArea: '850192.17 Sq. mtrs.',
    totalSaleableArea: '61263 Sq. mtrs.',
    status: 'Active' as const,
    completionYear: 2020,
    address: 'Laurel B Block, Bagmane Tech Park, CV Raman Nagar, Bangalore – 560093',
    totalArea: 850192.17,
    manager: 'TBD',
    floors: 6,
  },
  {
    buildingName: 'Lakeview',
    buildingCode: 'Lakeview',
    buildingType: 'Commercial Office',
    greenCertification: 'LEED-Platinum',
    totalConstructionArea: '53242.85 Sq. mtrs.',
    totalSaleableArea: '50454.57 Sq. mtrs.',
    status: 'Active' as const,
    completionYear: 0,
    address: 'Bagmane Tech Park, CV Raman Nagar, Bangalore',
    totalArea: 53242.85,
    manager: 'TBD',
    floors: 6,
  },
  {
    buildingName: 'Olympia',
    buildingCode: 'Olympia',
    buildingType: 'Commercial Office',
    greenCertification: 'TBD',
    totalConstructionArea: '330333 Sq feet',
    totalSaleableArea: '324042 sq feet',
    status: 'Active' as const,
    completionYear: 2003,
    address: 'Khata No66-1, Bagmane Tech Park, CV Raman Nagar, Bangalore',
    totalArea: 330333,
    manager: 'TBD',
    floors: 8,
  },
  {
    buildingName: 'Commerz-1',
    buildingCode: 'Commerc-1',
    buildingType: 'Retail',
    greenCertification: 'LEED-Gold',
    totalConstructionArea: '21252.95 Sq. mtrs.',
    totalSaleableArea: '228764.7 Sq. ft.',
    status: 'Active' as const,
    completionYear: 2006,
    address: 'Commerz-I Building (Retail-I), Bagmane Tech Park, Bangalore',
    totalArea: 21252.95,
    manager: 'TBD',
    floors: 3,
  },
  {
    buildingName: 'Commerz-2',
    buildingCode: 'Commerc-2',
    buildingType: 'Retail',
    greenCertification: 'LEED-Platinum',
    totalConstructionArea: '220326.48 Sq. mtrs.',
    totalSaleableArea: '220617 Sq. ft.',
    status: 'Active' as const,
    completionYear: 2010,
    address: 'Commerz-2 Building, Bagmane Tech Park, Bangalore',
    totalArea: 220326.48,
    manager: 'TBD',
    floors: 6,
  },
];

// Laurel Building - LEED-Platinum, 70029.64 Sq. mtrs.
export const BTP_LAUREL_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Laurel',
    siteCode: 'Laurel',
    cluster: 'India',
    address: 'Bagmane Tech Park, CV Ramana Nagar, Bangalore-560093',
    country: 'India',
    state: 'Karnataka',
    region: 'East',
    siteType: 'Multi-Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane Developers Pvt. Ltd.',
  },
  buildingInfo: {
    buildingName: 'LAUREL',
    buildingType: 'REIT',
    greenCertification: 'LEED-Gold',
    totalConstructionArea: '70029.64 Sq. mtrs. (753792.77 sft)',
    totalSaleableArea: '71943.02 Sq. mtrs. (774388.22 sft)',
    totalLandscapingArea: '24000 sq.ft',
    facadeArea: '99897 sq.ft',
    constructionStartDate: 2005,
    completionDate: 2008,
    handoverStartDate: 2008,
    handoverEndDate: 2008,
  },
  floorDetails: [
    { building: 'Laurel', status: 'Leased', floor: 'Utility Block Ground Floor', floorAreaSqft: 0, fireNOCArea: 'N/A' },
  ],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [
    { clientName: 'Mphasis', clientCommonName: 'Mphasis', noOfEmployees: 0, noOfOutSourceStaff: 0, totalEmployees: 0, parkingAsPerAgreement: 0, freeParking: 0, paidParking: 0 },
    { clientName: 'Opentext', clientCommonName: 'Opentext', noOfEmployees: 0, noOfOutSourceStaff: 0, totalEmployees: 0, parkingAsPerAgreement: 0, freeParking: 0, paidParking: 0 },
    { clientName: 'Infineon', clientCommonName: 'Infineon', noOfEmployees: 0, noOfOutSourceStaff: 0, totalEmployees: 0, parkingAsPerAgreement: 0, freeParking: 0, paidParking: 0 },
  ],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

// Tridib Building - 63652.40 Sq. mtrs.
export const BTP_TRIDIB_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Tridib',
    siteCode: 'Tridib',
    cluster: 'India',
    address: 'Bagmane Tech Park, CV Raman Nagar, Bangalore-560093',
    country: 'India',
    state: 'Karnataka',
    region: 'East',
    siteType: 'Multi-Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane Developers Pvt Ltd',
  },
  buildingInfo: {
    buildingName: 'Tridib',
    buildingType: 'REIT',
    greenCertification: 'N/A',
    totalConstructionArea: '63652.40 Sq. mtrs. (685148.73 sft)',
    totalSaleableArea: '567991 Sq. ft.',
    totalLandscapingArea: '14414.31 sq.ft',
    facadeArea: '177636 sq.ft',
    constructionStartDate: 2006,
    completionDate: 2009,
    handoverStartDate: 2009,
    handoverEndDate: 2009,
  },
  floorDetails: [
    { building: 'Tridib', status: 'Leased', floor: 'Ground Floor A Block', floorAreaSqft: 33431, fireNOCArea: '6320 Sq. Mtrs.' },
  ],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

// Crown Building - LEED, 290709.13 Sq. mtrs.
export const BTP_CROWN_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Crown',
    siteCode: 'BTP',
    cluster: 'India',
    address: 'CV Raman Nagar, Bangalore - 560093',
    country: 'India',
    state: 'Karnataka',
    region: 'East',
    siteType: 'Single Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane developers Private Limited (BRPL)',
  },
  buildingInfo: {
    buildingName: 'Crown',
    buildingType: 'REIT',
    greenCertification: 'LEED',
    totalConstructionArea: '290709.13 Sq. mtrs.',
    totalSaleableArea: '290709.13 Sq. mtrs.',
    totalLandscapingArea: '15096.28 sq.ft',
    facadeArea: '148706.21 sq.ft',
    constructionStartDate: 2004,
    completionDate: 2006,
    handoverStartDate: 2007,
    handoverEndDate: 2007,
  },
  floorDetails: [
    { building: 'Crown', status: 'Leased', floor: 'Ground Floor', floorAreaSqft: 25643.71, fireNOCArea: '4338.10 Sq.mts' },
  ],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

// Quay Building - LEED-Gold, 850192.17 Sq. mtrs.
export const BTP_QUAY_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Quay',
    siteCode: 'Quay',
    cluster: 'India',
    address: 'Laurel B Block, Bagmane Tech Park, CV Raman Nagar, Bangalore – 560093',
    country: 'India',
    state: 'Karnataka',
    region: 'South',
    siteType: 'Multi Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane Quay Private Limited (BQPL)',
  },
  buildingInfo: {
    buildingName: 'Quay',
    buildingType: 'REIT',
    greenCertification: 'LEED-Gold',
    totalConstructionArea: '850192.17 Sq. mtrs.',
    totalSaleableArea: '61263 Sq. mtrs.',
    totalLandscapingArea: '15923.08 sq.ft',
    facadeArea: '1050289 sq.ft',
    constructionStartDate: 2018,
    completionDate: 2020,
    handoverStartDate: 2020,
    handoverEndDate: 2021,
  },
  floorDetails: [
    { building: 'Quay', status: 'Leased', floor: 'Ground Floor', floorAreaSqft: 25350, fireNOCArea: '4254 Sq. Mtrs.' },
  ],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

// Lakeview Building - LEED-Platinum, 53242.85 Sq. mtrs.
export const BTP_LAKEVIEW_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Lakeview',
    siteCode: 'BTP',
    cluster: 'India',
    address: 'Bagmane Tech Park, CV Raman Nagar, Bangalore',
    country: 'India',
    state: 'Karnataka',
    region: 'South',
    siteType: 'Multi Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane Developers Pvt. Ltd.',
  },
  buildingInfo: {
    buildingName: 'Lakeview',
    buildingType: 'REIT',
    greenCertification: 'LEED-Platinum',
    totalConstructionArea: '53242.85 Sq. mtrs.',
    totalSaleableArea: '50454.57 Sq. mtrs.',
    totalLandscapingArea: 'TBD',
    facadeArea: 'TBD',
    constructionStartDate: 0,
    completionDate: 0,
    handoverStartDate: 0,
    handoverEndDate: 0,
  },
  floorDetails: [
    { building: 'Lakeview', status: 'Leased', floor: 'Ground Floor', floorAreaSqft: 38232, fireNOCArea: 'TBD' },
  ],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [
    { clientName: 'Alstom', clientCommonName: 'Alstom', noOfEmployees: 0, noOfOutSourceStaff: 0, totalEmployees: 0, parkingAsPerAgreement: 0, freeParking: 0, paidParking: 0 },
    { clientName: 'Boeing', clientCommonName: 'Boeing', noOfEmployees: 0, noOfOutSourceStaff: 0, totalEmployees: 0, parkingAsPerAgreement: 0, freeParking: 0, paidParking: 0 },
  ],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

// Olympia Building - 330333 Sq feet
export const BTP_OLYMPIA_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Olympia',
    siteCode: 'Olympia',
    cluster: 'India',
    address: 'Khata No66-1, Bagmane Tech Park, CV Raman Nagar, Bangalore',
    country: 'India',
    state: 'Karnataka',
    region: 'South',
    siteType: 'Multi Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane Developers Pvt. Ltd.',
  },
  buildingInfo: {
    buildingName: 'Olympia',
    buildingType: 'REIT',
    greenCertification: 'TBD',
    totalConstructionArea: '330333 Sq feet',
    totalSaleableArea: '324042 sq feet',
    totalLandscapingArea: 'TBD',
    facadeArea: 'TBD',
    constructionStartDate: 2003,
    completionDate: 2003,
    handoverStartDate: 2003,
    handoverEndDate: 2003,
  },
  floorDetails: [],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

// Commerz-1 Building - LEED-Gold, 21252.95 Sq. mtrs.
export const BTP_COMMERZ1_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Commerz-1',
    siteCode: 'Commerz',
    cluster: 'India',
    address: 'Commerz-I Building (Retail-I), Bagmane Tech Park, Bangalore',
    country: 'India',
    state: 'Karnataka',
    region: 'South',
    siteType: 'Multi Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane Developers Pvt Ltd',
  },
  buildingInfo: {
    buildingName: 'Commerz-1',
    buildingType: 'Retail',
    greenCertification: 'LEED-Gold',
    totalConstructionArea: '21252.95 Sq. mtrs.',
    totalSaleableArea: '228764.7 Sq. ft.',
    totalLandscapingArea: 'TBD',
    facadeArea: 'TBD',
    constructionStartDate: 2006,
    completionDate: 2006,
    handoverStartDate: 2006,
    handoverEndDate: 2006,
  },
  floorDetails: [],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [
    { clientName: 'HDFC Bank', clientCommonName: 'HDFC Bank', noOfEmployees: 0, noOfOutSourceStaff: 0, totalEmployees: 0, parkingAsPerAgreement: 0, freeParking: 0, paidParking: 0 },
  ],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

// Commerz-2 Building - LEED-Platinum, 220326.48 Sq. mtrs.
export const BTP_COMMERZ2_SITE_DATA: SiteData = {
  siteBasicInfo: {
    siteName: 'Bagmane Commerz-2',
    siteCode: 'Commerz 2',
    cluster: 'India',
    address: 'Commerz-2 Building, Bagmane Tech Park, Bangalore',
    country: 'India',
    state: 'Karnataka',
    region: 'South',
    siteType: 'Single Tenant',
    climaticZone: 'Moderate',
    sector: 'Office',
    entityOwner: 'Bagmane Developers Pvt Ltd',
  },
  buildingInfo: {
    buildingName: 'Commerz-2',
    buildingType: 'Retail',
    greenCertification: 'LEED-Platinum',
    totalConstructionArea: '220326.48 Sq. mtrs.',
    totalSaleableArea: '220617 Sq. ft.',
    totalLandscapingArea: 'TBD',
    facadeArea: 'TBD',
    constructionStartDate: 2010,
    completionDate: 2010,
    handoverStartDate: 2010,
    handoverEndDate: 2010,
  },
  floorDetails: [],
  operationalDetails: [
    {
      connectionType: 'HT Connection',
      htMeters: 0,
      ltMeters: 0,
      ammeters: 0,
      voltmeters: 0,
      tariffType: 'N/A',
      serviceProvider: 'N/A',
      connectedLoad: 0,
      sanctionLoad: 0,
      contractDemand: 0,
      maximumDemand: 0,
      billingDemand: 0,
      stpMethodology: 'N/A',
      stpCapacity: 0,
    },
  ],
  waterTanks: [
    { name: 'Water Tank 1', location: 'Ground', capacityKL: 0, sizeCuFt: 0 },
  ],
  tenants: [
    { clientName: 'Informatica', clientCommonName: 'Informatica', noOfEmployees: 0, noOfOutSourceStaff: 0, totalEmployees: 0, parkingAsPerAgreement: 0, freeParking: 0, paidParking: 0 },
  ],
  organogram: {
    clusterHead: 'TBD',
    complexHead: 'TBD',
    buildingManager: 'TBD',
    shiftManagers: [],
    clusterTechnicalSME: 'TBD',
    clusterSoftSME: 'TBD',
    clusterQHSESME: 'TBD',
    clusterHortiSME: 'TBD',
    clusterSecuritySME: 'TBD',
    clusterTransitionSME: 'TBD',
    clusterHVACSME: 'TBD',
    clusterElectricalSME: 'TBD',
  },
};

export const BTP_SITES = [
  BTP_PARIN_SITE_DATA,
  BTP_LAUREL_SITE_DATA,
  BTP_TRIDIB_SITE_DATA,
  BTP_CROWN_SITE_DATA,
  BTP_QUAY_SITE_DATA,
  BTP_LAKEVIEW_SITE_DATA,
  BTP_OLYMPIA_SITE_DATA,
  BTP_COMMERZ1_SITE_DATA,
  BTP_COMMERZ2_SITE_DATA,
];

export const getBTPSiteByCode = (siteCode: string): SiteData | undefined => {
  return BTP_SITES.find(site => site.siteBasicInfo.siteCode === siteCode);
};

// Map building codes to site data - returns detailed BTP data for buildings with complete information
export const getBTPSiteDataByBuildingCode = (buildingCode: string): SiteData | null => {
  switch (buildingCode) {
    case 'Parin':
      return BTP_PARIN_SITE_DATA;
    case 'Laurel':
      return BTP_LAUREL_SITE_DATA;
    case 'Tridib':
      return BTP_TRIDIB_SITE_DATA;
    case 'Crown':
      return BTP_CROWN_SITE_DATA;
    case 'Quay':
      return BTP_QUAY_SITE_DATA;
    case 'Lakeview':
      return BTP_LAKEVIEW_SITE_DATA;
    case 'Olympia':
      return BTP_OLYMPIA_SITE_DATA;
    case 'Commerc-1':
      return BTP_COMMERZ1_SITE_DATA;
    case 'Commerz-2':
      return BTP_COMMERZ2_SITE_DATA;
    default:
      // For other buildings (parking details, Laurel 1), return null
      return null;
  }
};
