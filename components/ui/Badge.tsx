
import React from 'react';
import { Status, Priority, AssetStatus } from '../../types';

interface BadgeProps {
  type?: Status | Priority | AssetStatus;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'secondary';
  children?: React.ReactNode;
  className?: string;
}

const statusColors: Record<string, string> = {
  // Ticket Statuses
  'Open': 'bg-blue-100 text-status-blue',
  'WIP': 'bg-yellow-100 text-status-yellow',
  'Resolved': 'bg-green-100 text-status-green',
  'Closed': 'bg-slate-100 text-status-gray',
  'Lapsed': 'bg-red-100 text-status-red',

  // Asset Statuses
  'Operational': 'bg-green-100 text-green-800',
  'In Maintenance': 'bg-yellow-100 text-yellow-800',
  'Breakdown': 'bg-red-100 text-red-800',
  'Standby': 'bg-blue-100 text-blue-800',
  'Decommissioned': 'bg-gray-100 text-gray-600',

  // Priorities
  'P1 - Critical': 'bg-red-100 text-status-red',
  'P2 - High': 'bg-orange-100 text-orange-600',
  'P3 - Medium': 'bg-yellow-100 text-status-yellow',
  'P4 - Low': 'bg-blue-100 text-status-blue',
};

const variantColors: Record<string, string> = {
  'info': 'bg-blue-100 text-blue-800',
  'success': 'bg-green-100 text-green-800',
  'warning': 'bg-yellow-100 text-yellow-800',
  'error': 'bg-red-100 text-red-800',
  'secondary': 'bg-slate-100 text-slate-800',
};

export const Badge: React.FC<BadgeProps> = ({ type, variant, children, className }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let content = children || type;

  if (variant) {
    colorClass = variantColors[variant] || variantColors['secondary'];
  } else if (type) {
    colorClass = statusColors[type] || 'bg-gray-100 text-gray-800';
  }

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${colorClass} ${className || ''}`}>
      {content}
    </span>
  );
};

