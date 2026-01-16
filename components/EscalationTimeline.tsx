import React, { useState, useEffect } from 'react';
import type { Ticket, Incident } from '../types';
import { Category } from '../types';
import { findTicketMasterRule } from '../services/ticketMasterService';

interface EscalationTimelineProps {
  ticket?: Ticket;
  incident?: Incident;
  onClose: () => void;
}

interface EscalationLevel {
  level: 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
  name: string;
  responseMinutes: number;
  resolutionMinutes: number;
  assignee: string;
  icon: string;
}

export const EscalationTimeline: React.FC<EscalationTimelineProps> = ({ ticket, incident, onClose }) => {
  const [escalationLevels, setEscalationLevels] = useState<EscalationLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const record = ticket || incident;
  
  // Validate that we have a record to display
  if (!record) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-slate-600">No ticket or incident data available.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-300 rounded hover:bg-slate-400">Close</button>
        </div>
      </div>
    );
  }

  // Load escalation rules from ticket data (preferred) or ticket master API
  useEffect(() => {
    const loadEscalationRules = async () => {
      try {
        console.log('🔍 Loading escalation rules for record:', record);

        // Standard SLA escalation rules from business process
        const SLA_RULES = {
          'L0': { responseTime: 30, resolutionTime: 1440, name: 'L0 Technician' },
          'L1': { responseTime: 120, resolutionTime: 2880, name: 'L1 Technician' },
          'L2': { responseTime: 240, resolutionTime: 4320, name: 'L2 Manager' },
          'L3': { responseTime: 720, resolutionTime: 5160, name: 'L3 Senior Manager' },
          'L4': { responseTime: 1800, resolutionTime: 6600, name: 'L4 Director' },
          'L5': { responseTime: 2160, resolutionTime: 8040, name: 'L5 Executive' },
        };

        // Get any custom assignees from the record
        const recordData = record as any;
        
        // Use SLA rules (from business process flowchart) as the source of truth
        const levels: EscalationLevel[] = [
          {
            level: 'L0',
            name: 'Initial Response',
            responseMinutes: SLA_RULES['L0'].responseTime,
            resolutionMinutes: SLA_RULES['L0'].resolutionTime,
            assignee: recordData.l0Assignee || recordData.reportedBy || 'L0 Technician',
            icon: '📞',
          },
          {
            level: 'L1',
            name: 'First Escalation',
            responseMinutes: SLA_RULES['L1'].responseTime,
            resolutionMinutes: SLA_RULES['L1'].resolutionTime,
            assignee: recordData.l1Assignee || 'L1 Technician',
            icon: '📈',
          },
          {
            level: 'L2',
            name: 'Manager Escalation',
            responseMinutes: SLA_RULES['L2'].responseTime,
            resolutionMinutes: SLA_RULES['L2'].resolutionTime,
            assignee: recordData.l2Assignee || 'L2 Manager',
            icon: '👔',
          },
          {
            level: 'L3',
            name: 'Senior Management',
            responseMinutes: SLA_RULES['L3'].responseTime,
            resolutionMinutes: SLA_RULES['L3'].resolutionTime,
            assignee: recordData.l3Assignee || 'L3 Senior Manager',
            icon: '👑',
          },
          {
            level: 'L4',
            name: 'Director Level',
            responseMinutes: SLA_RULES['L4'].responseTime,
            resolutionMinutes: SLA_RULES['L4'].resolutionTime,
            assignee: recordData.l4Assignee || 'L4 Director',
            icon: '🎯',
          },
          {
            level: 'L5',
            name: 'Executive',
            responseMinutes: SLA_RULES['L5'].responseTime,
            resolutionMinutes: SLA_RULES['L5'].resolutionTime,
            assignee: recordData.l5Assignee || 'L5 Executive',
            icon: '⚡',
          },
        ];
        
        console.log('✅ Escalation levels loaded from SLA rules:', levels);
        setEscalationLevels(levels);
        setLoading(false);
      } catch (error) {
        console.error('💥 Error loading escalation rules:', error);
        setLoading(false);
      }
    };

    if (record) {
      loadEscalationRules();
    }
  }, [record]);

  // Get actual escalation level from ticket/incident
  // For Incident: Default to L0 if not set
  // For Ticket: Use assignedLevel if available
  const actualCurrentLevel = (record as any).assignedLevel || 'L0';

  const getElapsedTimeAtCurrentLevel = () => {
    const recordData = record as any;
    const levelChangedTime = recordData.lastEscalatedAt || recordData.createdAt || recordData.date;
    const createdTime = new Date(recordData.createdAt || recordData.date).getTime();
    const levelChangeTime = new Date(levelChangedTime).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - levelChangeTime) / (1000 * 60)); // minutes at current level
  };

  const getTotalElapsedTime = () => {
    const recordData = record as any;
    const createdTime = new Date(recordData.createdAt || recordData.date).getTime();
    const currentTime = new Date().getTime();
    return Math.floor((currentTime - createdTime) / (1000 * 60)); // total minutes since creation
  };

  const getTimeRemainingForResponse = (level: string) => {
    const levelObj = escalationLevels.find(l => l.level === level);
    if (!levelObj || actualCurrentLevel !== level) return 0;
    const elapsed = getElapsedTimeAtCurrentLevel();
    const timeLeft = levelObj.responseMinutes - elapsed;
    return Math.max(0, timeLeft);
  };

  const currentLevel = actualCurrentLevel;
  const elapsedMinutes = getTotalElapsedTime();
  const elapsedAtCurrentLevel = getElapsedTimeAtCurrentLevel();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <p className="text-slate-600">Loading escalation timeline...</p>
        </div>
      </div>
    );
  }

  if (escalationLevels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Escalation Timeline</h2>
            <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <p className="text-slate-600">Unable to load escalation rules. Please ensure ticket has valid category, subcategory, and issue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Escalation Timeline</h2>
              <p className="text-sm text-slate-600 mt-1">
                {ticket ? `Ticket #${(ticket as any).ticketId}` : `Incident #${(incident as any).incidentId}`} - {(record as any).type || (record as any).category}
              </p>
            </div>
            <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600">✕</button>
          </div>
        </div>

        {/* Current Status */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs uppercase text-slate-600 font-semibold">Current Level</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{currentLevel}</p>
              <p className="text-sm text-slate-700 mt-2">{escalationLevels.find(l => l.level === currentLevel)?.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-600 font-semibold">Elapsed Time</p>
              <p className="text-3xl font-bold text-cyan-600 mt-1">{Math.floor(elapsedMinutes / 60)}h {elapsedMinutes % 60}m</p>
              <p className="text-sm text-slate-700 mt-2">Since ticket creation</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-600 font-semibold">Time at Current Level</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{Math.floor(elapsedAtCurrentLevel / 60)}h {elapsedAtCurrentLevel % 60}m</p>
              <p className="text-sm text-slate-700 mt-2">Since escalation to {currentLevel}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Escalation Progression</h3>
          <p className="text-sm text-slate-600 mb-4">Current Level: <span className="font-bold text-blue-600">{currentLevel}</span></p>
          
          <div className="space-y-4">
            {escalationLevels.map((escLevel, idx) => {
              const isActive = escLevel.level === currentLevel;
              const currentLevelIndex = escalationLevels.findIndex(l => l.level === currentLevel);
              const isPassed = idx < currentLevelIndex;
              const isUpcoming = idx > currentLevelIndex;
              
              return (
                <div key={escLevel.level}>
                  {/* Timeline Item */}
                  <div className={`border-2 rounded-lg p-4 transition-all ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : isPassed 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-slate-300 bg-slate-50'
                  }`}>
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`text-3xl p-2 rounded-lg ${
                        isActive 
                          ? 'bg-blue-100' 
                          : isPassed 
                          ? 'bg-green-100' 
                          : 'bg-slate-100'
                      }`}>
                        {escLevel.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-slate-900">{escLevel.level}: {escLevel.name}</h4>
                          {isActive && <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">🔵 CURRENT LEVEL</span>}
                          {isPassed && <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">✓ ESCALATED</span>}
                          {isUpcoming && <span className="px-2 py-1 bg-slate-400 text-white text-xs font-bold rounded">⏳ PENDING</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <p className="text-slate-600">Response Time</p>
                            <p className="font-semibold text-slate-900">
                              {Math.floor(escLevel.responseMinutes / 60)}h {escLevel.responseMinutes % 60}m
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-600">Resolution Time</p>
                            <p className="font-semibold text-slate-900">
                              {Math.floor(escLevel.resolutionMinutes / 60)}h {escLevel.resolutionMinutes % 60}m
                            </p>
                          </div>
                        </div>

                        <div className="text-sm mb-2">
                          <p className="text-slate-600">Assigned To</p>
                          <p className="font-semibold text-slate-900">{escLevel.assignee}</p>
                        </div>

                        {/* Progress Bar - Only for Active Level */}
                        {isActive && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Time Remaining for Response:</p>
                            <div className="w-full bg-slate-300 rounded-full h-3">
                              <div 
                                className="bg-blue-500 h-3 rounded-full transition-all"
                                style={{ width: `${Math.max(0, (getTimeRemainingForResponse(escLevel.level) / escLevel.responseMinutes) * 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                              {Math.floor(getTimeRemainingForResponse(escLevel.level) / 60)}h {getTimeRemainingForResponse(escLevel.level) % 60}m remaining
                            </p>
                          </div>
                        )}

                        {/* Info for Escalated Levels */}
                        {isPassed && (
                          <div className="mt-2 text-xs text-green-700">
                            ✓ Successfully escalated from this level
                          </div>
                        )}

                        {/* Info for Upcoming Levels */}
                        {isUpcoming && (
                          <div className="mt-2 text-xs text-slate-600">
                            ⏳ Waiting for escalation to this level
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow between items */}
                  {idx < escalationLevels.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className={`text-2xl ${
                        isPassed ? 'text-green-500' : isActive ? 'text-blue-500' : 'text-slate-400'
                      }`}>
                        ↓
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-600">
            This timeline shows the automatic escalation progression. Each level has specific response and resolution targets.
            If current level response time is exceeded, the ticket will automatically escalate to the next level.
          </p>
        </div>
      </div>
    </div>
  );
};
