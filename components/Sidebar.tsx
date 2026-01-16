


import React, { useState } from 'react';
import { ViewType } from '../types';
import type { User } from '../types';
import { userPermissions } from '../data/userData';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  currentUser: User;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
  subItems?: NavItem[];
}

const BagmaneLogo = () => (
  <div className="flex items-center space-x-2">
    <div className="flex flex-col">
      <span className="w-6 h-1.5 bg-yellow-400 rounded-full"></span>
      <span className="w-6 h-1.5 bg-blue-500 rounded-full mt-1"></span>
      <span className="w-6 h-1.5 bg-green-500 rounded-full mt-1"></span>
    </div>
  </div>
);

interface NavItemProps {
  item: NavItem;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  level?: number;
}

const NavItemComponent: React.FC<NavItemProps> = ({ item, currentView, setCurrentView, level = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isSelected = currentView === item.id;

  return (
    <>
      <li>
        <div className="flex items-center">
          <button
            onClick={() => {
              if (hasSubItems) {
                setExpanded(!expanded);
              } else {
                setCurrentView(item.id);
              }
            }}
            className={`flex-1 flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200 whitespace-normal ${isSelected
                ? 'bg-brand-primary text-white'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <span className="w-5 h-5 mr-3 flex-shrink-0">{item.icon}</span>
            <span className="text-left flex-1">{item.label}</span>
          </button>
          {hasSubItems && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={`px-2 py-3 text-slate-400 hover:text-slate-600 transition-transform ${expanded ? 'rotate-90' : ''}`}
            >
              <ChevronRightIcon />
            </button>
          )}
        </div>
      </li>
      {hasSubItems && expanded && (
        <ul className="space-y-1">
          {item.subItems!.map(subItem => (
            <NavItemComponent
              key={subItem.id}
              item={subItem}
              currentView={currentView}
              setCurrentView={setCurrentView}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, currentUser }) => {
  const allNavItems: NavItem[] = [
    { id: ViewType.DASHBOARD, label: 'Dashboard', icon: <HomeIcon /> },
    { id: ViewType.COMPLEX_INFO, label: 'Complex Info Module', icon: <BuildingIcon /> },
    {
      id: ViewType.TICKETS,
      label: 'Helpdesk Module',
      icon: <TicketIcon />,
      subItems: [
        { id: ViewType.TICKETS, label: 'Ticket List', icon: <TicketIcon /> },
        { id: ViewType.TICKET_DASHBOARD, label: 'Analytics Dashboard', icon: <ChartBarIcon /> },
        { id: ViewType.ESCALATION_TIMELINE, label: 'Escalation Timeline', icon: <ChartBarIcon /> },
      ]
    },
    {
      id: ViewType.ASSETS,
      label: 'Asset Module',
      icon: <CubeIcon />,
      subItems: [
        { id: ViewType.ASSET_REGISTRY, label: 'Asset Registry', icon: <DocumentTextIcon /> },
        { id: ViewType.ASSET_DASHBOARD, label: 'Asset Dashboard', icon: <CubeIcon /> },
        { id: ViewType.ASSET_QR_CODES, label: 'QR Codes & Print', icon: <QrCodeIcon /> },
        { id: ViewType.ASSET_OPERATIONAL_AGE, label: 'Operational Age Analysis', icon: <CalendarIcon /> },
      ]
    },
    { id: ViewType.PPM, label: 'Maintenance Module', icon: <CalendarIcon /> },
    {
      id: ViewType.CONTRACTS,
      label: 'Contract & Vendor',
      icon: <DocumentTextIcon />,
      subItems: [
        { id: ViewType.CONTRACTS, label: 'Contracts Dashboard', icon: <DocumentTextIcon /> },
        { id: ViewType.VENDOR_CRM, label: 'Vendor Master', icon: <UsersIcon /> },
      ]
    },
    { id: ViewType.ASSET_VERIFICATION, label: 'Asset Verification', icon: <QrCodeIcon /> },
    { id: ViewType.INCIDENTS, label: 'Incident Module', icon: <ExclamationTriangleIcon /> },
    {
      id: ViewType.WORK_PERMITS,
      label: 'Work Permit Module',
      icon: <ClipboardCheckIcon />,
      subItems: [
        { id: ViewType.WORK_PERMIT_DASHBOARD, label: 'Permits Dashboard', icon: <ClipboardCheckIcon /> },
        { id: ViewType.WORK_PERMIT_APPROVAL, label: 'Approve Permits', icon: <CheckCircleIcon /> },
        { id: ViewType.JSA_MANAGEMENT, label: 'JSA Management', icon: <ShieldCheckIcon /> },
      ]
    },
    { id: ViewType.AUDITS, label: 'Audit Module', icon: <ShieldCheckIcon /> },
    {
      id: ViewType.INVENTORY,
      label: 'Inventory Module',
      icon: <ArchiveBoxIcon />,
      subItems: [
        { id: ViewType.INVENTORY, label: 'Inventory Items', icon: <ArchiveBoxIcon /> },
        { id: ViewType.INVENTORY_DASHBOARD, label: 'Inventory Analytics', icon: <ArrowPathIcon /> },
      ]
    },
    {
      id: ViewType.TASKS,
      label: 'Daily Tasks & Log Sheet',
      icon: <ClipboardListIcon />,
      subItems: [
        { id: ViewType.TASKS_TECHNICAL, label: 'Technical Tasks', icon: <WrenchIcon /> },
        { id: ViewType.TASKS_SOFT_SERVICES, label: 'Soft Services', icon: <BuildingIcon /> },
        { id: ViewType.TASKS_SECURITY, label: 'Security', icon: <ShieldCheckIcon /> },
        { id: ViewType.TASKS_HORTICULTURE, label: 'Horticulture', icon: <SparklesIcon /> },
      ]
    },
    {
      id: ViewType.FEEDBACK,
      label: 'Feedback Module',
      icon: <FaceSmileIcon />,
      subItems: [
        { id: ViewType.CSAT_DASHBOARD, label: 'CSAT Analytics', icon: <FaceSmileIcon /> },
        { id: ViewType.NPS_DASHBOARD, label: 'NPS Analytics', icon: <UsersIcon /> },
      ]
    },
    {
      id: ViewType.TENANT_PORTAL,
      label: 'Client Connect (CRM)',
      icon: <UserIcon />,
      subItems: [
        { id: ViewType.TENANT_PORTAL, label: 'Portal & Tickets', icon: <UserIcon /> },
        { id: ViewType.CLIENT_CONNECT_MEETINGS, label: 'Meeting Scheduler', icon: <UserIcon /> },
      ]
    },
    { id: ViewType.COMPLIANCE, label: 'Compliance Module', icon: <ScaleIcon /> },
    { id: ViewType.ESG, label: 'ESG Dashboard', icon: <GlobeAmericasIcon /> },
    { id: ViewType.TRANSITION, label: 'Transition (HOTO)', icon: <ArrowRightOnRectangleIcon /> },
    { id: ViewType.UTILITY_BILLING, label: 'Utility Billing', icon: <BanknotesIcon /> },
    { id: ViewType.USER_GROUPS, label: 'User Groups', icon: <UsersIcon /> },
  ];

  const navItems = allNavItems.filter(item =>
    currentUser.permissions?.includes(item.id) ||
    item.subItems?.some(sub => currentUser.permissions?.includes(sub.id))
  );

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <BagmaneLogo />
        <h1 className="text-xl font-bold text-slate-800 ml-3 tracking-wide">BAGMANE</h1>
      </div>
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => (
            <NavItemComponent
              key={item.id}
              item={item}
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">&copy; 2025 Gemba Concept Business Analytics Team - POC</p>
      </div>
    </div>
  );
};

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const TicketIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 3h5.25m-5.25-3h.008m-4.5 3h.008m-4.5 3h.008m-4.5-3h.008m-4.5 3h.008M4.5 6h15v12h-15V6z" />
  </svg>
);

const CubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const ChecklistIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75M11.375 12.75L11.375 12.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path d="M9 12.75L11.25 15 15 9.75" />
    <path d="M10.5 6h9" />
    <path d="M10.5 12h9" />
    <path d="M10.5 18h9" />
    <path d="M4.5 6.5h.01" />
    <path d="M4.5 12.5h.01" />
    <path d="M4.5 18.5h.01" />
  </svg>
);

const ClipboardListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM10.5 10.5l3 3 6-6" />
  </svg>
);

const ArchiveBoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const ExclamationTriangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QrCodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75zM16.5 19.5h.75v.75h-.75v-.75z" />
  </svg>
);

const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 1.75.98 1.75 1.963 0 1.14-.925 2.134-2.134 2.275C16.66 9.42 14.41 9.75 12 9.75c-2.41 0-4.66-.33-6.366-.542-1.21-.141-2.134-1.135-2.134-2.275 0-.983.74-1.82 1.75-1.963m13.5 0a48.42 48.42 0 00-6.75-.47" />
  </svg>
);

const BanknotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const GlobeAmericasIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

const ChatBubbleLeftRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
  </svg>
);

const ArrowRightOnRectangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75a6 6 0 11-12 0 6 6 0 0112 0zM12 12.75h.008v.008H12v-.008zM15 12.75h.008v.008H15v-.008zM9 12.75h.008v.008H9v-.008z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 6.75c0-.621.504-1.125 1.125-1.125h2.25C13.496 5.625 14 6.129 14 6.75v13.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V6.75zm6.75-3.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v16.5c0 .621-.504 1.125-1.125 1.125h-2.25c-.621 0-1.125-.504-1.125-1.125V3z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09l-.813 2.846zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L12.75 5.25l.786-.259a3.375 3.375 0 002.455-2.456L15.75 1.5l.259 1.035a3.375 3.375 0 002.456 2.456l1.034.258-.259 1.035a3.375 3.375 0 00-2.456 2.456zM16.894 16.035l-.259 1.035L16.375 16l.259-1.035a3.375 3.375 0 012.456-2.456l1.034-.259-.259-1.035a3.375 3.375 0 00-2.456-2.456l-1.035-.259.259 1.035a3.375 3.375 0 012.456 2.456z" />
  </svg>
);

const FaceSmileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 07-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ArrowPathIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h9m-9 3h9m-9 3h9M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
  </svg>
);
