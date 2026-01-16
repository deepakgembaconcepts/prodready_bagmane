
import { useAuth } from './context/AuthContext';
import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useApiData } from './hooks/useApiData';
import type { Ticket, User, Asset, Task, Site, Vendor, Contract, InventoryItem, WorkPermit, Incident, Audit, ComplianceItem, UtilityReading } from './types';
import { ViewType, AssetCategory, AssetStatus, Category, Status, Priority } from './types';

import { AssetFormModal } from './components/AssetFormModal';
import { TaskFormModal } from './components/TaskFormModal';
import { SiteFormModal } from './components/SiteFormModal';
import { VendorFormModal } from './components/VendorFormModal';
import { ContractFormModal } from './components/ContractFormModal';
import { InventoryFormModal } from './components/InventoryFormModal';
import { WorkPermitFormModal } from './components/WorkPermitFormModal';
import { IncidentFormModal } from './components/IncidentFormModal';
import { AuditFormModal } from './components/AuditFormModal';
import { ComplianceFormModal } from './components/ComplianceFormModal';
import { UtilityReadingModal } from './components/UtilityReadingModal';
import { Login } from './components/Login';
import { HelpDeskFormModal } from './components/HelpDeskFormModal';
import { JSAFormBDPL } from './components/JSAFormBDPL';
import type { JSA } from './services/jsaService';

// Lazy load components to split chunks
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const TicketList = React.lazy(() => import('./components/TicketList').then(module => ({ default: module.TicketList })));
const TicketDashboard = React.lazy(() => import('./components/TicketDashboard').then(module => ({ default: module.TicketDashboard })));
const AssetList = React.lazy(() => import('./components/AssetList').then(module => ({ default: module.AssetList })));
const AssetRegistry = React.lazy(() => import('./components/AssetRegistry').then(module => ({ default: module.AssetRegistry })));
const AssetDashboard = React.lazy(() => import('./components/AssetDashboard').then(module => ({ default: module.AssetDashboard })));
const SiteManagement = React.lazy(() => import('./components/SiteManagement').then(module => ({ default: module.SiteManagement }))); // Not used in switch but good to lazy load if used later
const SiteHierarchy = React.lazy(() => import('./components/SiteHierarchy').then(module => ({ default: module.SiteHierarchy })));
const TaskBoard = React.lazy(() => import('./components/TaskBoard').then(module => ({ default: module.TaskBoard })));
const PPMManagement = React.lazy(() => import('./components/PPMManagement').then(module => ({ default: module.PPMManagement })));
const UserGroupsManagement = React.lazy(() => import('./components/UserGroupsManagement').then(module => ({ default: module.UserGroupsManagement })));
const VendorList = React.lazy(() => import('./components/VendorList').then(module => ({ default: module.VendorList })));
const ContractList = React.lazy(() => import('./components/ContractList').then(module => ({ default: module.ContractList })));
const TenantPortal = React.lazy(() => import('./components/TenantPortal').then(module => ({ default: module.TenantPortal })));
const InventoryList = React.lazy(() => import('./components/InventoryList').then(module => ({ default: module.InventoryList })));
const WorkPermitList = React.lazy(() => import('./components/WorkPermitList').then(module => ({ default: module.WorkPermitList })));
// JSAList not currently in switch, but imported
const IncidentList = React.lazy(() => import('./components/IncidentList').then(module => ({ default: module.IncidentList })));
const AuditList = React.lazy(() => import('./components/AuditList').then(module => ({ default: module.AuditList })));
const ComplianceList = React.lazy(() => import('./components/ComplianceList').then(module => ({ default: module.ComplianceList })));
const AssetVerification = React.lazy(() => import('./components/AssetVerification').then(module => ({ default: module.AssetVerification })));
const UtilityBilling = React.lazy(() => import('./components/UtilityBilling').then(module => ({ default: module.UtilityBilling })));
const ESGDashboard = React.lazy(() => import('./components/ESGDashboard').then(module => ({ default: module.ESGDashboard })));
const FeedbackDashboard = React.lazy(() => import('./components/FeedbackDashboard').then(module => ({ default: module.FeedbackDashboard })));
const TransitionDashboard = React.lazy(() => import('./components/TransitionDashboard').then(module => ({ default: module.TransitionDashboard })));
const CSATModule = React.lazy(() => import('./components/CSATModule').then(module => ({ default: module.CSATModule })));
const NPSModule = React.lazy(() => import('./components/NPSModule').then(module => ({ default: module.NPSModule })));
const TaskSubModule = React.lazy(() => import('./components/TaskSubModule').then(module => ({ default: module.TaskSubModule })));
const AssetQRCodes = React.lazy(() => import('./components/AssetQRCodes').then(module => ({ default: module.AssetQRCodes })));
const AssetOperationalAge = React.lazy(() => import('./components/AssetOperationalAge').then(module => ({ default: module.AssetOperationalAge })));
const CSATDashboard = React.lazy(() => import('./components/CSATDashboard').then(module => ({ default: module.CSATDashboard })));
const NPSDashboard = React.lazy(() => import('./components/NPSDashboard').then(module => ({ default: module.NPSDashboard })));
const WorkPermitDashboard = React.lazy(() => import('./components/WorkPermitDashboard').then(module => ({ default: module.WorkPermitDashboard })));
const InventoryDashboard = React.lazy(() => import('./components/InventoryDashboard').then(module => ({ default: module.InventoryDashboard })));
const ClientConnectMeetingScheduler = React.lazy(() => import('./components/ClientConnectMeetingScheduler').then(module => ({ default: module.ClientConnectMeetingScheduler })));
const HelpDeskDashboard = React.lazy(() => import('./components/HelpDeskDashboard').then(module => ({ default: module.HelpDeskDashboard })));
const EscalationTimelineView = React.lazy(() => import('./components/EscalationTimelineView').then(module => ({ default: module.EscalationTimelineView })));
const JSADashboard = React.lazy(() => import('./components/JSADashboard').then(module => ({ default: module.JSADashboard })));
const WorkPermitApprovalDashboard = React.lazy(() => import('./components/WorkPermitApprovalDashboard').then(module => ({ default: module.WorkPermitApprovalDashboard })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const App: React.FC = () => {
  const { user: currentUser, logout } = useAuth();

  const {
    tickets, setTickets, addTicket,
    assets, addAsset, updateAssetVerification, updateAssetStatus,
    sites, addSite,
    tasks, addTask, updateTaskStatus,
    vendors, addVendor,
    contracts, addContract,
    inventory, addInventoryItem,
    permits, addWorkPermit,
    incidents, setIncidents, addIncident,
    audits, addAudit,
    compliances, addComplianceItem,
    utilityReadings, addUtilityReading,
    utilityBills, esgMetrics,
    csatResponses, setCsatResponses, npsResponses, setNpsResponses,
    transitionProjects, addSnagToProject, updateProjectProgress,
    announcements,
    messages,
    meetings
  } = useApiData();
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);

  // Set default view based on role
  useEffect(() => {
    if (currentUser && currentUser.permissions && currentUser.permissions.length > 0) {
      // Only set if we are on dashboard (default) to avoid overriding navigation
      // Actually, let's keep it simple: if user logs in, we might want to default to their first permission.
      // But for now, Dashboard is fine if they have it.
      if (!currentUser.permissions.includes(currentView)) {
        setCurrentView(currentUser.permissions[0]);
      }
    }
  }, [currentUser]);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isWorkPermitModalOpen, setIsWorkPermitModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [isUtilityModalOpen, setIsUtilityModalOpen] = useState(false);
  const [isJSAModalOpen, setIsJSAModalOpen] = useState(false);

  // JSA Management
  const [jsas, setJsas] = useState<JSA[]>([
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
      hazards: [],
      controlMeasures: [],
      requiredPPE: [],
      emergencyProcedures: 'Emergency procedures here',
      status: 'Approved',
      l1Approval: { approvedBy: 'Priya Singh', approvalDate: new Date('2025-12-02'), approvalComments: 'Approved', approvalLevel: 'L1' },
      l2Approval: { approvedBy: 'Vikram Patel', approvalDate: new Date('2025-12-03'), approvalComments: 'Approved', approvalLevel: 'L2' },
      l3Approval: { approvedBy: 'Anil Kumar', approvalDate: new Date('2025-12-04'), approvalComments: 'Approved', approvalLevel: 'L3' },
      revisionNumber: 1,
      isActive: true,
      linkedPermits: []
    }
  ]);

  // Work Permit Approval Management
  const [isWorkPermitApprovalOpen, setIsWorkPermitApprovalOpen] = useState(false);
  const [selectedPermitForApproval, setSelectedPermitForApproval] = useState<WorkPermit | null>(null);

  const handleApprovePermit = (permitId: string) => {
    const updatedPermits = permits.map(permit =>
      String(permit.id) === permitId
        ? { ...permit, status: 'Approved' as const, approvedDate: new Date() }
        : permit
    );
    // Update permits in mock data - note: this uses the reference from useMockData
    // In a real app, this would update backend
    (permits as any[]).splice(0, permits.length, ...updatedPermits);
    setToast({ message: 'Work Permit approved successfully.', type: 'success' });
    setSelectedPermitForApproval(null);
  };

  const handleRejectPermit = (permitId: string, reason: string) => {
    const updatedPermits = permits.map(permit =>
      String(permit.id) === permitId
        ? { ...permit, status: 'Rejected' as const, rejectionReason: reason, rejectedDate: new Date() }
        : permit
    );
    (permits as any[]).splice(0, permits.length, ...updatedPermits);
    setToast({ message: 'Work Permit rejected.', type: 'info' });
    setSelectedPermitForApproval(null);
  };

  // State to hold a ticket when converting to a task
  const [ticketToConvert, setTicketToConvert] = useState<Ticket | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const stats = useMemo(() => {
    return tickets.reduce((acc, ticket) => {
      acc.total++;
      if (ticket.status === 'Open') acc.open++;
      if (ticket.status === 'WIP') acc.wip++;
      if (ticket.status === 'Closed') acc.closed++;
      if (ticket.status === 'Lapsed') acc.lapsed++;
      return acc;
    }, { total: 0, open: 0, wip: 0, closed: 0, lapsed: 0 });
  }, [tickets]);

  const handleCreateTicket = (newTicket: Omit<Ticket, 'id' | 'ticketId' | 'createdAt' | 'runningTAT'>) => {
    addTicket(newTicket);
    setIsTicketModalOpen(false);
    setToast({ message: 'Ticket created successfully.', type: 'success' });
  };

  const handleCreateAsset = (newAsset: Omit<Asset, 'id' | 'assetId' | 'nextMaintenanceDate'>) => {
    addAsset(newAsset);
    setIsAssetModalOpen(false);
    setToast({ message: 'Asset added to registry.', type: 'success' });
  }

  const handleEditAsset = (asset: Asset) => {
    // For now, show a message - edit functionality can be extended later
    setToast({ message: `Edit asset: ${asset.name}`, type: 'info' });
  }

  const handleDeleteAsset = (assetId: number) => {
    // In a real app, this would call an API to delete
    const assetToDelete = assets.find(a => a.id === assetId);
    if (assetToDelete) {
      setToast({ message: `Deleted asset: ${assetToDelete.name}`, type: 'success' });
    }
  }

  const handleUpdateAssetForPPM = (assetId: number, updates: Partial<Asset>) => {
    const updatedAssets = assets.map(asset =>
      asset.id === assetId ? { ...asset, ...updates } : asset
    );
    // Since we can't directly update state from useMockData, we'll need to update indirectly
    // For now, we'll show a success message
    setToast({ message: 'PPM work simulated and scheduled.', type: 'success' });
  }

  const handleCreateTask = (newTask: Omit<Task, 'id' | 'taskId'>) => {
    addTask(newTask);
    setIsTaskModalOpen(false);
    setTicketToConvert(null); // Clear selected ticket after task creation
    setToast({ message: 'Task assigned.', type: 'success' });
  }

  const handleConvertTicketToTask = (ticket: Ticket) => {
    setTicketToConvert(ticket);
    setIsTaskModalOpen(true);
  }

  const handleCreateSite = (newSite: Omit<Site, 'id' | 'buildings'>) => {
    addSite(newSite);
    setIsSiteModalOpen(false);
    setToast({ message: 'Site added.', type: 'success' });
  }

  const handleCreateVendor = (newVendor: Omit<Vendor, 'id' | 'vendorId'>) => {
    addVendor(newVendor);
    setIsVendorModalOpen(false);
    setToast({ message: 'Vendor onboarded.', type: 'success' });
  }

  const handleCreateContract = (newContract: Omit<Contract, 'id' | 'contractId'>) => {
    addContract(newContract);
    setIsContractModalOpen(false);
    setToast({ message: 'Contract created.', type: 'success' });
  }

  const handleCreateInventoryItem = (newItem: Omit<InventoryItem, 'id' | 'itemId'>) => {
    addInventoryItem(newItem);
    setIsInventoryModalOpen(false);
    setToast({ message: 'Item added to inventory.', type: 'success' });
  }

  const handleCreateWorkPermit = (newPermit: Omit<WorkPermit, 'id' | 'permitId'>) => {
    addWorkPermit(newPermit);
    setIsWorkPermitModalOpen(false);
    setToast({ message: 'Work permit request submitted.', type: 'success' });
  }

  const handleCreateJSA = (newJSA: JSA) => {
    // Update status to Submitted after creation
    const jsaToAdd = { ...newJSA, status: 'Submitted' as const };
    setJsas([...jsas, jsaToAdd]);
    setIsJSAModalOpen(false);
    setToast({ message: 'JSA submitted for approval.', type: 'success' });
  }

  const handleCreateIncident = (newIncident: Omit<Incident, 'id' | 'incidentId'>) => {
    addIncident(newIncident);
    setIsIncidentModalOpen(false);
    setToast({ message: 'Incident reported.', type: 'success' });
  }

  const handleCreateAudit = (newAudit: Omit<Audit, 'id' | 'auditId'>) => {
    addAudit(newAudit);
    setIsAuditModalOpen(false);
    setToast({ message: 'Audit scheduled.', type: 'success' });
  }

  const handleCreateCompliance = (newCompliance: Omit<ComplianceItem, 'id' | 'complianceId'>) => {
    addComplianceItem(newCompliance);
    setIsComplianceModalOpen(false);
    setToast({ message: 'Compliance record added.', type: 'success' });
  }

  const handleCreateUtilityReading = (newReading: Omit<UtilityReading, 'id' | 'readingId' | 'consumption'>) => {
    addUtilityReading(newReading);
    setIsUtilityModalOpen(false);
    setToast({ message: 'Meter reading recorded.', type: 'success' });
  }

  const updateTicket = (updatedTicket: Ticket) => {
    setTickets(prevTickets => prevTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setToast({ message: 'Ticket updated.', type: 'success' });
  };

  const updateIncident = (updatedIncident: Incident) => {
    setIncidents(prevIncidents => prevIncidents.map(i => i.id === updatedIncident.id ? updatedIncident : i));
    setToast({ message: 'Incident updated.', type: 'success' });
  }

  const handleAssetStatusUpdate = (assetId: number, status: 'Operational' | 'In Maintenance' | 'Breakdown' | 'Standby' | 'Decommissioned') => {
    // Update the asset status in the registry
    updateAssetStatus(assetId, status);

    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      // Auto-create ticket for problematic statuses
      if (status === 'Breakdown' || status === 'In Maintenance') {
        const ticketDescription = `AUTO-GENERATED: Asset Status Change Alert.\nAsset: ${asset.name} (${asset.assetId})\nNew Status: ${status}\nLocation: ${asset.building}, ${asset.location}\nPrevious Status: ${asset.status}`;

        addTicket({
          createdBy: 'System (Asset Monitor)',
          contactEmail: 'compliance@bagmane.com',
          category: Category.Technical,
          subcategory: 'Asset Management',
          status: Status.Open,
          assignedLevel: 'L1',
          technicianName: 'Unassigned',
          priority: status === 'Breakdown' ? Priority.P1 : Priority.P2,
          description: ticketDescription,
          building: asset.building
        }).then((newTicket) => {
          setToast({
            message: `Asset status updated to ${status}. Ticket #${newTicket.ticketId} created.`,
            type: 'warning'
          });
        });

      } else {
        setToast({ message: `Asset status updated to ${status}.`, type: 'success' });
      }
    }
  };

  // Bulk Upload Logic (Mocked)
  const handleBulkUploadSites = (file: File) => {
    const timestamp = new Date().toLocaleTimeString();
    const newSite: Omit<Site, 'id' | 'buildings'> = {
      name: `Imported Campus - ${timestamp}`,
      region: 'South',
      city: 'Hyderabad'
    };

    // Simulate adding a site with a predefined building structure
    addSite(newSite);
    setToast({ message: `Successfully processed ${file.name}.`, type: 'success' });
  };

  const handleBulkUploadAssets = (file: File) => {
    const timestamp = new Date().toLocaleTimeString();
    // Simulate adding a few assets
    for (let i = 1; i <= 3; i++) {
      addAsset({
        name: `Bulk Imported HVAC Unit ${timestamp} - 0${i}`,
        category: AssetCategory.HVAC,
        status: AssetStatus.Operational,
        building: 'Tower A',
        location: 'Basement 1',
        cost: 50000,
        purchaseDate: new Date(),
        warrantyExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        serialNumber: `BLK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      });
    }
    setToast({ message: `Successfully processed ${file.name}. Added 3 new assets.`, type: 'success' });
  };


  const handleDashboardDrillDown = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard tickets={tickets} assets={assets} compliances={compliances} stats={stats} onDrillDown={handleDashboardDrillDown} />;
      case ViewType.COMPLEX_INFO:
        return <SiteHierarchy />;
      case ViewType.TICKETS:
        return <TicketList tickets={tickets} onUpdateTicket={updateTicket} onConvertTicket={handleConvertTicketToTask} />;
      case ViewType.HELPDESK_DASHBOARD:
        return <HelpDeskDashboard tickets={tickets} />;
      case ViewType.ESCALATION_TIMELINE:
        return <EscalationTimelineView tickets={tickets} />;
      case ViewType.ASSETS:
        return <AssetList assets={assets} contracts={contracts} onBulkUpload={handleBulkUploadAssets} />;
      case ViewType.ASSET_REGISTRY:
        return (
          <AssetRegistry
            assets={assets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
            onAdd={(newAsset) => {
              const assetToAdd: Omit<Asset, 'id' | 'assetId' | 'nextMaintenanceDate'> = {
                ...newAsset,
              };
              addAsset(assetToAdd);
              setToast({ message: 'Asset added to registry.', type: 'success' });
            }}
          />
        );
      case ViewType.ASSET_DASHBOARD:
        return <AssetDashboard assets={assets} />;
      case ViewType.ASSET_QR_CODES:
        return <AssetQRCodes assets={assets} />;
      case ViewType.ASSET_OPERATIONAL_AGE:
        return <AssetOperationalAge assets={assets} />;
      case ViewType.PPM:
        return <PPMManagement assets={assets} onUpdateAsset={handleUpdateAssetForPPM} />;
      case ViewType.CONTRACTS:
        return <ContractList contracts={contracts} />;
      case ViewType.ASSET_VERIFICATION:
        return <AssetVerification assets={assets} onUpdateAssetStatus={handleAssetStatusUpdate} />;
      case ViewType.INCIDENTS:
        return <IncidentList incidents={incidents} onUpdateIncident={updateIncident} />;
      case ViewType.WORK_PERMITS:
        return <WorkPermitList permits={permits} />;
      case ViewType.JSA_MANAGEMENT:
        return <JSADashboard jsas={jsas} />;
      case ViewType.AUDITS:
        return <AuditList audits={audits} />;
      case ViewType.INVENTORY:
        return <InventoryList inventory={inventory} />;
      case ViewType.TASKS:
        return <TaskBoard tasks={tasks} onStatusChange={updateTaskStatus} onAddTask={addTask} currentUser={currentUser!} />;
      case ViewType.TASKS_TECHNICAL:
        return <TaskSubModule tasks={tasks} onStatusChange={updateTaskStatus} onAddTask={addTask} currentUser={currentUser!} category={Category.Technical} title="Technical Tasks" />;
      case ViewType.TASKS_SOFT_SERVICES:
        return <TaskSubModule tasks={tasks} onStatusChange={updateTaskStatus} onAddTask={addTask} currentUser={currentUser!} category={Category.SoftServices} title="Soft Services Tasks" />;
      case ViewType.TASKS_SECURITY:
        return <TaskSubModule tasks={tasks} onStatusChange={updateTaskStatus} onAddTask={addTask} currentUser={currentUser!} category={Category.Security} title="Security Tasks" />;
      case ViewType.TASKS_HORTICULTURE:
        return <TaskSubModule tasks={tasks} onStatusChange={updateTaskStatus} onAddTask={addTask} currentUser={currentUser!} category={Category.Horticulture} title="Horticulture Tasks" />;
      case ViewType.FEEDBACK:
        return <FeedbackDashboard csatResponses={csatResponses} npsResponses={npsResponses} />;
      case ViewType.CSAT_MODULE:
        return <CSATModule onResponseSubmitted={(response) => setCsatResponses([...csatResponses, response])} />;
      case ViewType.CSAT_DASHBOARD:
        return <CSATDashboard csatResponses={csatResponses} />;
      case ViewType.NPS_MODULE:
        return <NPSModule onResponseSubmitted={(response) => setNpsResponses([...npsResponses, response])} />;
      case ViewType.NPS_DASHBOARD:
        return <NPSDashboard npsResponses={npsResponses} />;
      case ViewType.WORK_PERMIT_DASHBOARD:
        return <WorkPermitDashboard permits={permits} />;
      case ViewType.WORK_PERMIT_APPROVAL:
        return (
          <WorkPermitApprovalDashboard
            permits={permits}
            onApprove={handleApprovePermit}
            onReject={handleRejectPermit}
          />
        );
      case ViewType.STOCK_TRANSFER_DASHBOARD:
        return <InventoryDashboard inventory={inventory} />;
      case ViewType.INVENTORY_DASHBOARD:
        return <InventoryDashboard inventory={inventory} />;
      case ViewType.TICKET_DASHBOARD:
        return <TicketDashboard tickets={tickets} />;
      case ViewType.CLIENT_CONNECT_MEETINGS:
        return <ClientConnectMeetingScheduler meetings={meetings} currentUser={currentUser?.name} />;
      case ViewType.TENANT_PORTAL:
        return (
          <TenantPortal
            tickets={tickets}
            currentUser={currentUser!}
            onUpdateTicket={updateTicket}
            onCreateTicket={() => setIsTicketModalOpen(true)}
            announcements={announcements}
            messages={messages}
            meetings={meetings}
          />
        );
      case ViewType.VENDOR_CRM:
        return <VendorList vendors={vendors} />;
      case ViewType.COMPLIANCE:
        return <ComplianceList compliances={compliances} />;
      case ViewType.ESG:
        return <ESGDashboard data={esgMetrics} />;
      case ViewType.TRANSITION:
        return <TransitionDashboard
          projects={transitionProjects}
          onAddSnag={addSnagToProject}
          onUpdateProgress={updateProjectProgress}
        />;
      case ViewType.UTILITY_BILLING:
        return <UtilityBilling readings={utilityReadings} bills={utilityBills} />;
      case ViewType.USER_GROUPS:
        return <UserGroupsManagement onSelectGroup={() => { }} />;
      default:
        return <Dashboard tickets={tickets} assets={assets} compliances={compliances} stats={stats} onDrillDown={handleDashboardDrillDown} />;
    }
  }

  const getHeaderTitle = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return "Command Center Dashboard";
      case ViewType.COMPLEX_INFO:
        return "Complex Info Module";
      case ViewType.TICKETS:
        return "Helpdesk Module";
      case ViewType.HELPDESK_DASHBOARD:
        return "Helpdesk Analytics Dashboard";
      case ViewType.ESCALATION_TIMELINE:
        return "Escalation Timeline";
      case ViewType.ASSETS:
        return "Asset Module";
      case ViewType.PPM:
        return "Maintenance Module";
      case ViewType.CONTRACTS:
        return "Contract Module";
      case ViewType.ASSET_VERIFICATION:
        return "Asset Verification Module";
      case ViewType.INCIDENTS:
        return "Incident Module";
      case ViewType.WORK_PERMITS:
        return "Work Permit Module";
      case ViewType.AUDITS:
        return "Audit Module";
      case ViewType.INVENTORY:
        return "Inventory Module";
      case ViewType.TASKS:
        return "Daily task/ Log Sheet Module (HK/Security/Technical)";
      case ViewType.FEEDBACK:
        return "Feedback Module (C-Sat)";
      case ViewType.CSAT_MODULE:
        return "CSAT Survey Automation";
      case ViewType.CSAT_DASHBOARD:
        return "CSAT Analytics Dashboard";
      case ViewType.NPS_MODULE:
        return "NPS Survey Management";
      case ViewType.NPS_DASHBOARD:
        return "NPS Analytics Dashboard";
      case ViewType.WORK_PERMIT_DASHBOARD:
        return "Work Permit Dashboard";
      case ViewType.STOCK_TRANSFER_DASHBOARD:
        return "Stock Transfer Dashboard";
      case ViewType.INVENTORY_DASHBOARD:
        return "Inventory Analytics Dashboard";
      case ViewType.TICKET_DASHBOARD:
        return "Ticket Management Dashboard";
      case ViewType.CLIENT_CONNECT_MEETINGS:
        return "Client Connect - Meeting Scheduler & MOM";
      case ViewType.JSA_MANAGEMENT:
        return "JSA Management";
      case ViewType.TENANT_PORTAL:
        return "Client Connect Module (CRM)";
      case ViewType.VENDOR_CRM:
        return "Vendor Master List";
      case ViewType.COMPLIANCE:
        return "Compliance Module";
      case ViewType.ESG:
        return "ESG (Integration with EGS Application)";
      case ViewType.TRANSITION:
        return "Transition Module (HOTO)";
      case ViewType.UTILITY_BILLING:
        return "Utility Billing";
      case ViewType.USER_GROUPS:
        return "User Groups Management";
      default:
        return "Dashboard";
    }
  }

  const getActionConfig = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
      case ViewType.TICKETS:
        return { label: 'Create Ticket', action: () => setIsTicketModalOpen(true) };
      case ViewType.TENANT_PORTAL:
        return { label: 'Create Ticket', action: () => setIsTicketModalOpen(true) };
      case ViewType.ASSETS:
        return { label: 'Add Asset', action: () => setIsAssetModalOpen(true) };
      case ViewType.TASKS:
        return { label: 'Assign Task', action: () => setIsTaskModalOpen(true) };
      case ViewType.VENDOR_CRM:
        return { label: 'Add Vendor', action: () => setIsVendorModalOpen(true) };
      case ViewType.CONTRACTS:
        return { label: 'Add Contract', action: () => setIsContractModalOpen(true) };
      case ViewType.INVENTORY:
        return { label: 'Add Item', action: () => setIsInventoryModalOpen(true) };
      case ViewType.WORK_PERMITS:
        return { label: 'Create Permit', action: () => setIsWorkPermitModalOpen(true) };
      case ViewType.WORK_PERMIT_DASHBOARD:
        return { label: 'Create Permit', action: () => setIsWorkPermitModalOpen(true) };
      case ViewType.WORK_PERMIT_APPROVAL:
        return { label: 'Review Permits', action: () => setCurrentView(ViewType.WORK_PERMIT_APPROVAL) };
      case ViewType.JSA_MANAGEMENT:
        return { label: 'Create JSA', action: () => setIsJSAModalOpen(true) };
      case ViewType.STOCK_TRANSFER_DASHBOARD:
        return { label: 'View Analytics', action: () => setCurrentView(ViewType.INVENTORY_DASHBOARD) };
      case ViewType.INVENTORY_DASHBOARD:
        return { label: 'Manage Inventory', action: () => setCurrentView(ViewType.INVENTORY) };
      case ViewType.CSAT_DASHBOARD:
      case ViewType.NPS_DASHBOARD:
        return { label: 'View Analytics', action: () => { } };
      case ViewType.INCIDENTS:
        return { label: 'Report Incident', action: () => setIsIncidentModalOpen(true) };
      case ViewType.AUDITS:
        return { label: 'Schedule Audit', action: () => setIsAuditModalOpen(true) };
      case ViewType.COMPLIANCE:
        return { label: 'Add License', action: () => setIsComplianceModalOpen(true) };
      case ViewType.UTILITY_BILLING:
        return { label: 'Record Reading', action: () => setIsUtilityModalOpen(true) };
      default:
        return { label: undefined, action: undefined };
    }
  }

  const actionConfig = getActionConfig();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans relative">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <div className="container mx-auto px-6 py-8">
            <Header
              title={getHeaderTitle()}
              onAction={actionConfig.action}
              actionLabel={actionConfig.label}
              currentUser={currentUser}
              onLogout={logout}
            />
            <Suspense fallback={<LoadingSpinner />}>
              {renderContent()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in-up z-50 flex items-center ${toast.type === 'success' ? 'bg-green-600' :
          toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <HelpDeskFormModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
      <AssetFormModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSubmit={handleCreateAsset}
        contracts={contracts}
      />
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setTicketToConvert(null); }}
        onSubmit={handleCreateTask}
        linkedTicket={ticketToConvert}
      />
      <SiteFormModal
        isOpen={isSiteModalOpen}
        onClose={() => setIsSiteModalOpen(false)}
        onSubmit={handleCreateSite}
      />
      <VendorFormModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        onSubmit={handleCreateVendor}
      />
      <ContractFormModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onSubmit={handleCreateContract}
      />
      <InventoryFormModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onSubmit={handleCreateInventoryItem}
      />
      <WorkPermitFormModal
        isOpen={isWorkPermitModalOpen}
        onClose={() => setIsWorkPermitModalOpen(false)}
        onSubmit={handleCreateWorkPermit}
      />
      <IncidentFormModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSubmit={handleCreateIncident}
      />
      <AuditFormModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        onSubmit={handleCreateAudit}
      />
      <ComplianceFormModal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        onSubmit={handleCreateCompliance}
      />
      <UtilityReadingModal
        isOpen={isUtilityModalOpen}
        onClose={() => setIsUtilityModalOpen(false)}
        onSubmit={handleCreateUtilityReading}
      />
      <JSAFormBDPL
        isOpen={isJSAModalOpen}
        onClose={() => setIsJSAModalOpen(false)}
        onSubmit={handleCreateJSA}
      />
    </div>
  );
};

export default App;
