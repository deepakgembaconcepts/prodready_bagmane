
import React from 'react';
import type { User } from '../types';

interface HeaderProps {
  title: string;
  onAction?: () => void;
  actionLabel?: string;
  currentUser: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onAction, actionLabel, currentUser, onLogout }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold text-slate-800">{title}</h2>
      <div className="flex items-center space-x-4">
        {actionLabel && onAction && (
          <button 
            onClick={onAction}
            className="flex items-center bg-brand-primary hover:bg-brand-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
          >
            <PlusIcon />
            <span className="ml-2">{actionLabel}</span>
          </button>
        )}
        <div className="flex items-center space-x-3">
            <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
            </div>
            <button onClick={onLogout} title="Logout" className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                <LogoutIcon />
            </button>
        </div>
      </div>
    </div>
  );
};

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);