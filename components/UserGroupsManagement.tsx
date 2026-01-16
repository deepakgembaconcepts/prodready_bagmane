import React, { useState } from 'react';
import { USER_GROUPS, GROUP_STATISTICS } from '../data/userGroups';
import type { UserGroup } from '../data/userGroups';

interface UserGroupsManagementProps {
  onSelectGroup?: (group: UserGroup) => void;
}

export const UserGroupsManagement: React.FC<UserGroupsManagementProps> = ({ onSelectGroup }) => {
  const [selectedLevel, setSelectedLevel] = useState<UserGroup['level'] | 'All'>('All');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const filteredGroups = selectedLevel === 'All' 
    ? USER_GROUPS 
    : USER_GROUPS.filter(g => g.level === selectedLevel);

  const levelColors: Record<UserGroup['level'], string> = {
    Executive: 'bg-purple-100 border-purple-300',
    'Senior Management': 'bg-blue-100 border-blue-300',
    Management: 'bg-cyan-100 border-cyan-300',
    'Technical Lead': 'bg-orange-100 border-orange-300',
    Technical: 'bg-green-100 border-green-300',
    Support: 'bg-gray-100 border-gray-300',
  };

  const levelBadgeColors: Record<UserGroup['level'], string> = {
    Executive: 'bg-purple-600 text-white',
    'Senior Management': 'bg-blue-600 text-white',
    Management: 'bg-cyan-600 text-white',
    'Technical Lead': 'bg-orange-600 text-white',
    Technical: 'bg-green-600 text-white',
    Support: 'bg-gray-600 text-white',
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">User Groups Management</h1>
        <p className="text-slate-600">Manage 21 organizational groups and their permissions</p>
      </div>

      {/* Statistics */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-3 gap-4 border-b border-slate-200">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Groups</p>
          <p className="text-2xl font-bold text-purple-600">{GROUP_STATISTICS.total}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Executive</p>
          <p className="text-2xl font-bold text-blue-600">{GROUP_STATISTICS.byLevel.Executive}</p>
        </div>
        <div className="bg-cyan-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Management</p>
          <p className="text-2xl font-bold text-cyan-600">{GROUP_STATISTICS.byLevel.Management}</p>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Tech Leads</p>
          <p className="text-2xl font-bold text-orange-600">{GROUP_STATISTICS.byLevel['Technical Lead']}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Technical</p>
          <p className="text-2xl font-bold text-green-600">{GROUP_STATISTICS.byLevel.Technical}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Senior Mgmt</p>
          <p className="text-2xl font-bold text-gray-600">{GROUP_STATISTICS.byLevel['Senior Management']}</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap gap-2">
        {(['All', 'Executive', 'Senior Management', 'Management', 'Technical Lead', 'Technical'] as const).map(level => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedLevel === level
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-3">
          {filteredGroups.map(group => (
            <div
              key={group.id}
              className={`border-2 rounded-lg p-4 transition-all cursor-pointer ${levelColors[group.level]}`}
              onClick={() => {
                setExpandedGroup(expandedGroup === group.id ? null : group.id);
                if (onSelectGroup) onSelectGroup(group);
              }}
            >
              {/* Group Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{group.icon()}</span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{group.name}</h3>
                      <p className="text-sm text-slate-600">{group.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${levelBadgeColors[group.level]}`}>
                      {group.level}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {group.permissions.length} modules
                    </span>
                  </div>
                </div>
                <div className="text-2xl text-slate-400">
                  {expandedGroup === group.id ? '▼' : '▶'}
                </div>
              </div>

              {/* Expanded Permissions */}
              {expandedGroup === group.id && (
                <div className="mt-4 pt-4 border-t-2 border-current border-opacity-20">
                  <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">
                    Permissions ({group.permissions.length}):
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.permissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-blue-500">✓</span>
                        <span>{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <p>Showing {filteredGroups.length} of {USER_GROUPS.length} groups</p>
      </div>
    </div>
  );
};
