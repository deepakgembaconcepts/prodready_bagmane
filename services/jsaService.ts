// Job Safety Analysis (JSA) Service
// Manages JSA creation, approval, and linking to work permits
// Based on BDPL OCP 03 F-08 JSA Format

export interface JSAHazard {
    id: string;
    description: string; // Hazard & Consequence column
    potentialInjury: string;
    severity: 1 | 2 | 3; // 1=Low, 2=Medium, 3=High/Critical
    likelihood: 1 | 2 | 3; // 1=Low, 2=Medium, 3=High
    riskScore: number; // severity × likelihood
}

export interface JSAControlMeasure {
    id: string;
    hazardId: string;
    measure: string; // Control Measures column
    responsible: string; // Responsible person/team
}

export interface JSASignature {
    name: string;
    designation: string;
    date: Date;
}

export interface JSAApprovalRecord {
    approvedBy: string;
    approvalDate: Date;
    approvalComments: string;
    approvalLevel: 'L1' | 'L2' | 'L3';
}

export interface JSA {
    id: string;
    jsaId: string; // BDPL Document number (e.g., BDPL OCP 03 F-08)
    
    // Header Section
    jobTitle: string; // Job/Activity to be performed
    jobDescription: string;
    workLocation: string; // Location
    department: string;
    emergencyContactNumber?: string;
    
    // Preparation & Validity
    createdBy: string; // JSA Prepared by
    createdDate: Date;
    validFrom: Date;
    validUntil: Date;
    
    // Main Content (Two-column layout: Hazard & Consequence | Control Measures)
    hazards: JSAHazard[];
    controlMeasures: JSAControlMeasure[];
    
    // PPE Requirements
    requiredPPE: {
        equipment: string;
        specification?: string;
        isRequired: boolean;
    }[];

    // Emergency & Special Procedures
    emergencyProcedures: string;
    isolationProcedures?: string;
    medicalEmergencyPlan?: string;
    gasTestRequired?: boolean;
    
    // Sign-off Section (BDPL Format - Name, Designation, Date rows)
    preparedBySignature?: JSASignature;
    checkedBySignature?: JSASignature;
    approvedBySignature?: JSASignature;
    
    // Approval Workflow
    status: 'Draft' | 'Submitted' | 'L1 Approved' | 'L2 Approved' | 'Approved' | 'Rejected';
    l1Approval?: JSAApprovalRecord;
    l2Approval?: JSAApprovalRecord;
    l3Approval?: JSAApprovalRecord;
    rejectionReason?: string;
    
    // Tracking & Linking
    revisionNumber: number;
    isActive: boolean;
    linkedPermits: string[]; // Work Permit IDs
}

export interface JSADashboardMetrics {
    totalJSAs: number;
    draftJSAs: number;
    submittedJSAs: number;
    approvedJSAs: number;
    rejectedJSAs: number;
    pendingL1Approval: number;
    pendingL2Approval: number;
    pendingL3Approval: number;
    expiringIn30Days: number;
    expiredJSAs: number;
}

// Mock JSA Data - BDPL Format Compliant
const mockJSAs: JSA[] = [
    {
        id: 'jsa-001',
        jsaId: 'BDPL-OCP-03-F08-001',
        jobTitle: 'Hot Work - Welding',
        jobDescription: 'Structural steel welding on building frame for Floors 5-7',
        workLocation: 'Building A - Ground Floor Workshop',
        department: 'Civil Works',
        emergencyContactNumber: '+91-9876543210',
        createdBy: 'Rajesh Kumar',
        createdDate: new Date('2025-12-01'),
        validFrom: new Date('2025-12-01'),
        validUntil: new Date('2026-03-01'),
        
        // Two-column layout: Hazard & Consequence | Control Measures
        hazards: [
            {
                id: 'haz-001',
                description: 'Arc flash and thermal burns from electric arc',
                potentialInjury: 'Severe burns, eye damage, temporary blindness',
                severity: 3,
                likelihood: 3,
                riskScore: 9
            },
            {
                id: 'haz-002',
                description: 'Metal fumes and smoke inhalation',
                potentialInjury: 'Respiratory irritation, metal fume fever',
                severity: 2,
                likelihood: 3,
                riskScore: 6
            },
            {
                id: 'haz-003',
                description: 'Contact with hot workpiece',
                potentialInjury: 'Thermal burns to hands and body',
                severity: 3,
                likelihood: 2,
                riskScore: 6
            }
        ],
        
        controlMeasures: [
            {
                id: 'cm-001',
                hazardId: 'haz-001',
                measure: 'Use certified welding helmet with 11 shade lens; Wear flame-resistant clothing and leather apron',
                responsible: 'Welder'
            },
            {
                id: 'cm-002',
                hazardId: 'haz-001',
                measure: 'Inspect PPE before use; Replace damaged helmets immediately',
                responsible: 'Site Supervisor'
            },
            {
                id: 'cm-003',
                hazardId: 'haz-002',
                measure: 'Ensure workshop has proper ventilation; Use exhaust hood if available',
                responsible: 'Site Supervisor'
            },
            {
                id: 'cm-004',
                hazardId: 'haz-002',
                measure: 'Provide respiratory protection (N95 masks) for prolonged exposure',
                responsible: 'Site Safety Officer'
            },
            {
                id: 'cm-005',
                hazardId: 'haz-003',
                measure: 'Use heat-resistant gloves; Keep water bucket nearby for cooling',
                responsible: 'Welder'
            }
        ],
        
        requiredPPE: [
            { equipment: 'Welding Helmet', specification: '11 shade lens', isRequired: true },
            { equipment: 'Safety Goggles', specification: 'Backup protection', isRequired: true },
            { equipment: 'Leather Gloves', specification: 'Heat-resistant', isRequired: true },
            { equipment: 'Safety Shoes', specification: 'Steel-toed', isRequired: true },
            { equipment: 'Flame-Resistant Apron', specification: 'Full body protection', isRequired: true },
            { equipment: 'Respirator', specification: 'N95 or better', isRequired: false }
        ],
        
        emergencyProcedures: 'In case of injury: Stop work immediately. Contact Emergency: 100 or 9876543210. First aid available at Site Office. Severe burns: Transfer to nearest hospital (Bagmane Medical Center - 2 km away).',
        isolationProcedures: 'Switch off welding machine at main power. Lock-out electrical panel. Check for residual voltage before maintenance.',
        medicalEmergencyPlan: 'First aid kit with burn treatment supplies maintained at site. Emergency contact: Site Medical Officer. Transfer to hospital for severe injuries.',
        gasTestRequired: false,
        
        preparedBySignature: {
            name: 'Rajesh Kumar',
            designation: 'Safety Officer',
            date: new Date('2025-12-01')
        },
        checkedBySignature: {
            name: 'Priya Singh',
            designation: 'HSE Manager',
            date: new Date('2025-12-02')
        },
        
        status: 'Approved',
        l1Approval: {
            approvedBy: 'Priya Singh',
            approvalDate: new Date('2025-12-02'),
            approvalComments: 'Hazard analysis adequate. Risk scoring appropriate.',
            approvalLevel: 'L1'
        },
        l2Approval: {
            approvedBy: 'Vikram Patel',
            approvalDate: new Date('2025-12-03'),
            approvalComments: 'Control measures verified. Emergency procedures adequate.',
            approvalLevel: 'L2'
        },
        l3Approval: {
            approvedBy: 'Anil Kumar',
            approvalDate: new Date('2025-12-04'),
            approvalComments: 'Final approval granted. JSA ready for use.',
            approvalLevel: 'L3'
        },
        
        revisionNumber: 1,
        isActive: true,
        linkedPermits: []
    },
    {
        id: 'jsa-002',
        jsaId: 'BDPL-OCP-03-F08-002',
        jobTitle: 'Height Work - Facade Cleaning',
        jobDescription: 'Cleaning exterior glass facade at height above 10m using suspended platform',
        workLocation: 'Building B - East Facade',
        department: 'Housekeeping',
        emergencyContactNumber: '+91-9876543211',
        createdBy: 'Amit Kumar',
        createdDate: new Date('2025-12-05'),
        validFrom: new Date('2025-12-05'),
        validUntil: new Date('2026-03-05'),
        
        hazards: [
            {
                id: 'haz-003',
                description: 'Fall from height (>10m) due to slipping or harness failure',
                potentialInjury: 'Serious injury, death',
                severity: 3,
                likelihood: 2,
                riskScore: 6
            },
            {
                id: 'haz-004',
                description: 'Tools/materials dropped from height',
                potentialInjury: 'Head injury, crush injuries to people below',
                severity: 3,
                likelihood: 2,
                riskScore: 6
            },
            {
                id: 'haz-005',
                description: 'Exposure to weather (rain, wind, sun)',
                potentialInjury: 'Slipping, exhaustion, dehydration',
                severity: 2,
                likelihood: 2,
                riskScore: 4
            }
        ],
        
        controlMeasures: [
            {
                id: 'cm-006',
                hazardId: 'haz-003',
                measure: 'Use certified safety harness (min 1.5m lanyard). Double lanyard for transitions.',
                responsible: 'Height Work Supervisor'
            },
            {
                id: 'cm-007',
                hazardId: 'haz-003',
                measure: 'Erect safety nets below working area. Inspect harness daily.',
                responsible: 'Height Work Team'
            },
            {
                id: 'cm-008',
                hazardId: 'haz-004',
                measure: 'Use tool bags with tether. No loose tools. Area cordoned off.',
                responsible: 'Work Team Lead'
            },
            {
                id: 'cm-009',
                hazardId: 'haz-005',
                measure: 'Provide shaded rest areas. Water bottles. Weather monitoring.',
                responsible: 'Site Supervisor'
            }
        ],
        
        requiredPPE: [
            { equipment: 'Safety Harness', specification: 'Class II certified, max 1.5m lanyard', isRequired: true },
            { equipment: 'Safety Helmet', specification: 'Type-I with chin strap', isRequired: true },
            { equipment: 'Safety Goggles', specification: 'Polycarbonate lens', isRequired: true },
            { equipment: 'Safety Gloves', specification: 'Cut-resistant', isRequired: true },
            { equipment: 'Safety Shoes', specification: 'Steel-toed, non-slip sole', isRequired: true }
        ],
        
        emergencyProcedures: 'Rescue harness and rope always ready. Rescue team on-site. Emergency call: 100. Nearest hospital: City Medical Center (1.5 km).',
        isolationProcedures: 'Area below cordoned with warning signs. No pedestrian access. Barriers visible from 50m away.',
        medicalEmergencyPlan: 'Rescue trained personnel on-site. Spinal injury protocol. Hospital pre-alert for trauma cases.',
        gasTestRequired: false,
        
        preparedBySignature: {
            name: 'Amit Kumar',
            designation: 'Safety Officer',
            date: new Date('2025-12-05')
        },
        checkedBySignature: {
            name: 'Arun Singh',
            designation: 'HSE Manager',
            date: new Date('2025-12-05')
        },
        
        status: 'L1 Approved',
        l1Approval: {
            approvedBy: 'Arun Singh',
            approvalDate: new Date('2025-12-05'),
            approvalComments: 'Rescue plan verified. Harness certification checked. Ready for L2 review.',
            approvalLevel: 'L1'
        },
        
        revisionNumber: 1,
        isActive: true,
        linkedPermits: []
    },
    
    {
        id: 'jsa-003',
        jsaId: 'BDPL-OCP-03-F08-003',
        jobTitle: 'Confined Space Entry - Tank Inspection',
        jobDescription: 'Internal inspection and cleaning of storage tank (8m deep, 4m diameter)',
        workLocation: 'Building C - Basement Equipment Room',
        department: 'Maintenance',
        emergencyContactNumber: '+91-9876543212',
        createdBy: 'Suresh Gupta',
        createdDate: new Date('2025-12-10'),
        validFrom: new Date('2025-12-10'),
        validUntil: new Date('2026-01-10'),
        
        hazards: [
            {
                id: 'haz-006',
                description: 'Toxic gas accumulation (H2S, Methane, CO2)',
                potentialInjury: 'Poisoning, unconsciousness, death',
                severity: 3,
                likelihood: 3,
                riskScore: 9
            },
            {
                id: 'haz-007',
                description: 'Oxygen deficiency below 19.5%',
                potentialInjury: 'Loss of consciousness, brain damage, death',
                severity: 3,
                likelihood: 2,
                riskScore: 6
            },
            {
                id: 'haz-008',
                description: 'Fall inside confined space',
                potentialInjury: 'Serious injury, drowning if water present',
                severity: 3,
                likelihood: 2,
                riskScore: 6
            }
        ],
        
        controlMeasures: [
            {
                id: 'cm-010',
                hazardId: 'haz-006',
                measure: 'Perform multi-gas test (O2, H2S, LEL) before entry. Results must show safe levels.',
                responsible: 'Certified Gas Test Operator'
            },
            {
                id: 'cm-011',
                hazardId: 'haz-006',
                measure: 'Continuous air sampling during work. Stop immediately if levels rise.',
                responsible: 'Permit Issuer'
            },
            {
                id: 'cm-012',
                hazardId: 'haz-007',
                measure: 'Mechanical ventilation (blowers) throughout duration. SCBA on standby.',
                responsible: 'Site Supervisor'
            },
            {
                id: 'cm-013',
                hazardId: 'haz-008',
                measure: 'Entry harness and retrieval system. Safety watch outside space always.',
                responsible: 'Rescue Team Lead'
            }
        ],
        
        requiredPPE: [
            { equipment: 'SCBA Respirator', specification: 'Self-contained breathing apparatus', isRequired: true },
            { equipment: 'Entry Harness', specification: 'Class II retrieval harness', isRequired: true },
            { equipment: 'Safety Helmet', specification: 'With lamp attachment', isRequired: true },
            { equipment: 'Safety Goggles', specification: 'Anti-fog', isRequired: true },
            { equipment: 'Chemical-resistant Gloves', specification: 'Nitrile or better', isRequired: true },
            { equipment: 'Safety Boots', specification: 'Non-slip, chemical-resistant', isRequired: true }
        ],
        
        emergencyProcedures: 'Rescue trained team (min 2 persons) outside space. Emergency call: 100 + company emergency: +91-1234567890. Oxygen resuscitation kit available.',
        isolationProcedures: 'All energy sources locked and tagged. Nozzles capped. Warning signs posted at entry.',
        medicalEmergencyPlan: 'Oxygen therapy on-site. Poison antidote (Amyl Nitrite) available. Emergency transport to hospital with hyperbaric chamber.',
        gasTestRequired: true,
        
        preparedBySignature: {
            name: 'Suresh Gupta',
            designation: 'Safety Officer',
            date: new Date('2025-12-10')
        },
        
        status: 'Draft',
        rejectionReason: undefined,
        
        revisionNumber: 1,
        isActive: false,
        linkedPermits: []
    },
    
    {
        id: 'jsa-004',
        jsaId: 'BDPL-OCP-03-F08-004',
        jobTitle: 'Excavation Work - Utility Trenching',
        jobDescription: 'Ground excavation for water line installation - depth 2-3m, length 150m',
        workLocation: 'Site Area - West Zone, Plot B',
        department: 'Civil Works',
        emergencyContactNumber: '+91-9876543213',
        createdBy: 'Vikram Singh',
        createdDate: new Date('2025-12-08'),
        validFrom: new Date('2025-12-08'),
        validUntil: new Date('2026-02-08'),
        
        hazards: [
            {
                id: 'haz-009',
                description: 'Trench collapse due to unsupported walls',
                potentialInjury: 'Crush injuries, burial, death',
                severity: 3,
                likelihood: 2,
                riskScore: 6
            },
            {
                id: 'haz-010',
                description: 'Striking underground utilities (electric, gas, water)',
                potentialInjury: 'Electrocution, explosion, flooding',
                severity: 3,
                likelihood: 2,
                riskScore: 6
            },
            {
                id: 'haz-011',
                description: 'Falling into trench',
                potentialInjury: 'Fractures, internal injuries',
                severity: 2,
                likelihood: 2,
                riskScore: 4
            }
        ],
        
        controlMeasures: [
            {
                id: 'cm-014',
                hazardId: 'haz-009',
                measure: 'Install shoring system for depths >1.2m. Design by engineer. Daily inspection.',
                responsible: 'Excavation Supervisor'
            },
            {
                id: 'cm-015',
                hazardId: 'haz-010',
                measure: 'Utility location survey before excavation. Mark positions clearly.',
                responsible: 'Site Supervisor'
            },
            {
                id: 'cm-016',
                hazardId: 'haz-010',
                measure: 'Manual hand-digging within 0.5m of marked utilities.',
                responsible: 'Excavation Team'
            },
            {
                id: 'cm-017',
                hazardId: 'haz-011',
                measure: 'Install ramps or ladders for access. Guardrails at trench edges.',
                responsible: 'Site Supervisor'
            }
        ],
        
        requiredPPE: [
            { equipment: 'Safety Helmet', specification: 'Type-I', isRequired: true },
            { equipment: 'Safety Shoes', specification: 'Steel-toed, slip-resistant', isRequired: true },
            { equipment: 'High Visibility Vest', specification: 'EN471 compliant', isRequired: true },
            { equipment: 'Safety Gloves', specification: 'Work gloves', isRequired: true },
            { equipment: 'Earplugs', specification: 'NRR 20dB', isRequired: false }
        ],
        
        emergencyProcedures: 'Stop all work immediately if utilities struck. Evacuate area if gas/electricity detected. Contact utility provider and emergency services.',
        isolationProcedures: 'Traffic control barriers at least 30m away. Warning lights at night. No work in heavy rain.',
        medicalEmergencyPlan: 'First aid for crush injuries. Immediate hospital transport. Rescue equipment on-site.',
        gasTestRequired: false,
        
        preparedBySignature: {
            name: 'Vikram Singh',
            designation: 'Site Engineer',
            date: new Date('2025-12-08')
        },
        
        status: 'Rejected',
        rejectionReason: 'Shoring plan incomplete. Requires structural engineering certification. Resubmit with updated design drawings and soil test report.',
        
        revisionNumber: 1,
        isActive: false,
        linkedPermits: []
    }
];

// JSA Service Methods
export const JSAService = {
    // Create new JSA
    async createJSA(jsaData: Omit<JSA, 'id' | 'jsaId' | 'createdDate' | 'status' | 'revisionNumber' | 'linkedPermits'>): Promise<JSA> {
        const id = `jsa-${Date.now()}`;
        const jsaId = `JSA-2025-${String(mockJSAs.length + 1).padStart(3, '0')}`;
        
        const newJSA: JSA = {
            ...jsaData,
            id,
            jsaId,
            createdDate: new Date(),
            status: 'Draft',
            revisionNumber: 1,
            linkedPermits: []
        };
        
        mockJSAs.push(newJSA);
        return newJSA;
    },

    // Get all JSAs
    async getAllJSAs(): Promise<JSA[]> {
        return mockJSAs;
    },

    // Get JSA by ID
    async getJSAById(id: string): Promise<JSA | null> {
        return mockJSAs.find(jsa => jsa.id === id) || null;
    },

    // Get active JSAs (for Work Permit selection)
    async getActiveJSAs(): Promise<JSA[]> {
        // Return JSAs that are approved and can be linked to work permits
        return mockJSAs.filter(jsa => 
            (jsa.status === 'Approved' || jsa.status === 'L2 Approved' || jsa.status === 'L1 Approved') &&
            new Date(jsa.validUntil) >= new Date() // Not expired
        );
    },

    // Get JSAs pending approval
    async getJSAsPendingApproval(level: 'L1' | 'L2' | 'L3'): Promise<JSA[]> {
        return mockJSAs.filter(jsa => {
            if (level === 'L1') return jsa.status === 'Submitted';
            if (level === 'L2') return jsa.status === 'L1 Approved' && !jsa.l2Approval;
            if (level === 'L3') return jsa.status === 'L2 Approved' && !jsa.l3Approval;
            return false;
        });
    },

    // Approve JSA at L1
    async approveJSAL1(jsaId: string, approvedBy: string, comments: string): Promise<JSA> {
        const jsa = mockJSAs.find(j => j.id === jsaId);
        if (!jsa) throw new Error('JSA not found');

        jsa.status = 'L1 Approved';
        jsa.l1Approval = {
            approvedBy,
            approvalDate: new Date(),
            approvalComments: comments,
            approvalLevel: 'L1'
        };

        return jsa;
    },

    // Approve JSA at L2
    async approveJSAL2(jsaId: string, approvedBy: string, comments: string): Promise<JSA> {
        const jsa = mockJSAs.find(j => j.id === jsaId);
        if (!jsa) throw new Error('JSA not found');

        jsa.status = 'L2 Approved';
        jsa.l2Approval = {
            approvedBy,
            approvalDate: new Date(),
            approvalComments: comments,
            approvalLevel: 'L2'
        };

        return jsa;
    },

    // Approve JSA at L3 (Final approval)
    async approveJSAL3(jsaId: string, approvedBy: string, comments: string): Promise<JSA> {
        const jsa = mockJSAs.find(j => j.id === jsaId);
        if (!jsa) throw new Error('JSA not found');

        jsa.status = 'Approved';
        jsa.l3Approval = {
            approvedBy,
            approvalDate: new Date(),
            approvalComments: comments,
            approvalLevel: 'L3'
        };
        jsa.isActive = true;

        return jsa;
    },

    // Reject JSA
    async rejectJSA(jsaId: string, rejectionReason: string): Promise<JSA> {
        const jsa = mockJSAs.find(j => j.id === jsaId);
        if (!jsa) throw new Error('JSA not found');

        jsa.status = 'Rejected';
        jsa.rejectionReason = rejectionReason;
        jsa.isActive = false;

        return jsa;
    },

    // Update JSA (for revisions)
    async updateJSA(jsaId: string, updates: Partial<JSA>): Promise<JSA> {
        const jsa = mockJSAs.find(j => j.id === jsaId);
        if (!jsa) throw new Error('JSA not found');

        // If updating rejected JSA, increment revision
        if (jsa.status === 'Rejected') {
            jsa.revisionNumber += 1;
            jsa.status = 'Submitted';
            jsa.l1Approval = undefined;
            jsa.l2Approval = undefined;
            jsa.l3Approval = undefined;
        }

        return { ...jsa, ...updates };
    },

    // Link JSA to work permit
    async linkToPermit(jsaId: string, permitId: string): Promise<JSA> {
        const jsa = mockJSAs.find(j => j.id === jsaId);
        if (!jsa) throw new Error('JSA not found');

        if (!jsa.linkedPermits.includes(permitId)) {
            jsa.linkedPermits.push(permitId);
        }

        return jsa;
    },

    // Get dashboard metrics
    async getDashboardMetrics(): Promise<JSADashboardMetrics> {
        const now = new Date();
        const expiring30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return {
            totalJSAs: mockJSAs.length,
            draftJSAs: mockJSAs.filter(j => j.status === 'Draft').length,
            submittedJSAs: mockJSAs.filter(j => j.status === 'Submitted').length,
            approvedJSAs: mockJSAs.filter(j => j.status === 'Approved').length,
            rejectedJSAs: mockJSAs.filter(j => j.status === 'Rejected').length,
            pendingL1Approval: mockJSAs.filter(j => j.status === 'Submitted').length,
            pendingL2Approval: mockJSAs.filter(j => j.status === 'L1 Approved' && !j.l2Approval).length,
            pendingL3Approval: mockJSAs.filter(j => j.status === 'L2 Approved' && !j.l3Approval).length,
            expiringIn30Days: mockJSAs.filter(j => 
                j.isActive && 
                new Date(j.validUntil) <= expiring30Days && 
                new Date(j.validUntil) >= now
            ).length,
            expiredJSAs: mockJSAs.filter(j => new Date(j.validUntil) < now).length
        };
    },

    // Get all JSAs synchronously (for initial state)
    getAllJSAsSync(): JSA[] {
        return mockJSAs;
    }
};
