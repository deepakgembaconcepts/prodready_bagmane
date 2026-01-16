import React, { useMemo } from 'react';
import type { Ticket } from '../types';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { SLA_MATRIX } from '../services/slaMatrixService';

interface EscalationTimelineProps {
  tickets: Ticket[];
}

export const EscalationTimelineView: React.FC<EscalationTimelineProps> = ({ tickets }) => {
  // Filter only open tickets
  const openTickets = useMemo(() => {
    return tickets.filter(t => t.status === 'Open' || t.status === 'WIP');
  }, [tickets]);

  // Calculate escalation status for each ticket
  const ticketEscalations = useMemo(() => {
    return openTickets.map(ticket => {
      const now = new Date();
      const elapsedMs = now.getTime() - ticket.createdAt.getTime();
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      const elapsedMins = (elapsedMs / (1000 * 60)) % 60;

      // Get current escalation level based on elapsed time
      let currentLevel = 'L0';
      if (elapsedHours >= 24) currentLevel = 'L5';
      else if (elapsedHours >= 16) currentLevel = 'L4';
      else if (elapsedHours >= 8) currentLevel = 'L3';
      else if (elapsedHours >= 4) currentLevel = 'L2';
      else if (elapsedHours >= 1) currentLevel = 'L1';

      // Get SLA info for current level
      const slaInfo = SLA_MATRIX.find(s => s.level === currentLevel);
      const responseTarget = slaInfo?.responseTimeMins || 30;
      const resolutionTarget = slaInfo?.resolutionTimeMins || 1440;

      // Calculate if SLA is breached
      const isResponseBreached = elapsedMins > responseTarget;
      const isResolutionBreached = elapsedHours * 60 > resolutionTarget;

      // Determine status
      let status: 'breached' | 'at-risk' | 'on-track' = 'on-track';
      if (isResolutionBreached) status = 'breached';
      else if (elapsedHours * 60 > resolutionTarget * 0.75) status = 'at-risk';

      // Time remaining to next escalation
      let timeToNextEscalation = 0;
      const levelThresholds = { L0: 1, L1: 4, L2: 8, L3: 16, L4: 24, L5: Infinity };
      const currentThreshold = levelThresholds[currentLevel as keyof typeof levelThresholds] || 24;
      timeToNextEscalation = currentThreshold - elapsedHours;

      return {
        ticket,
        elapsedHours,
        elapsedMins,
        currentLevel,
        responseTarget,
        resolutionTarget,
        isResponseBreached,
        isResolutionBreached,
        status,
        timeToNextEscalation,
        progressPercent: Math.min((elapsedHours / (resolutionTarget / 60)) * 100, 100),
      };
    });
  }, [openTickets]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    return {
      totalOpen: ticketEscalations.length,
      breached: ticketEscalations.filter(t => t.status === 'breached').length,
      atRisk: ticketEscalations.filter(t => t.status === 'at-risk').length,
      onTrack: ticketEscalations.filter(t => t.status === 'on-track').length,
    };
  }, [ticketEscalations]);

  const getStatusColor = (status: 'breached' | 'at-risk' | 'on-track') => {
    switch (status) {
      case 'breached':
        return 'bg-red-50 border-red-200';
      case 'at-risk':
        return 'bg-yellow-50 border-yellow-200';
      case 'on-track':
        return 'bg-green-50 border-green-200';
    }
  };

  const getStatusBadgeColor = (status: 'breached' | 'at-risk' | 'on-track') => {
    switch (status) {
      case 'breached':
        return 'bg-red-100 text-red-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-track':
        return 'bg-green-100 text-green-800';
    }
  };

  const formatTimeRemaining = (hours: number) => {
    if (hours < 0) return 'Escalated';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Escalation Timeline</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600 mb-1">Total Open</div>
            <div className="text-3xl font-bold text-blue-900">{kpis.totalOpen}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm font-medium text-red-600 mb-1">Escalation Triggered</div>
            <div className="text-3xl font-bold text-red-900">{kpis.breached}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-600 mb-1">At Risk (&lt;2h)</div>
            <div className="text-3xl font-bold text-yellow-900">{kpis.atRisk}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm font-medium text-green-600 mb-1">On Track</div>
            <div className="text-3xl font-bold text-green-900">{kpis.onTrack}</div>
          </div>
        </div>

        {/* Escalation Levels Reference */}
        <div className="mb-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="font-semibold text-slate-900 mb-4">Escalation Levels Reference</h3>
          <div className="grid grid-cols-3 gap-3">
            {SLA_MATRIX.map(level => (
              <div key={level.level} className="bg-white border border-slate-200 rounded p-3">
                <div className="font-semibold text-slate-900 text-sm">{level.level}</div>
                <div className="text-xs text-slate-600 mt-1">Response: {level.responseTimeMins}min</div>
                <div className="text-xs text-slate-600">Resolution: {level.resolutionTimeMins}min</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Timeline */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 mb-4">Open Tickets Timeline</h3>
          {ticketEscalations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No open tickets</div>
          ) : (
            ticketEscalations.map(escalation => (
              <div
                key={escalation.ticket.id}
                className={`border-2 rounded-lg p-4 ${getStatusColor(escalation.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {escalation.ticket.ticketId} - {escalation.ticket.description.substring(0, 50)}...
                    </h4>
                    <p className="text-sm text-slate-600">{escalation.ticket.technicianName}</p>
                  </div>
                  <Badge className={getStatusBadgeColor(escalation.status)}>
                    {escalation.status === 'breached' ? 'ESCALATION TRIGGERED' : 
                     escalation.status === 'at-risk' ? 'AT RISK' : 'ON TRACK'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-semibold text-slate-900">Current Level:</span>
                    <span className="ml-2 text-slate-700">{escalation.currentLevel}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Elapsed:</span>
                    <span className="ml-2 text-slate-700">{Math.floor(escalation.elapsedHours)}h {Math.round(escalation.elapsedMins)}m</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Response Target:</span>
                    <span className="ml-2 text-slate-700">{escalation.responseTarget}min</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-slate-900">Time to Next Escalation:</span>
                    <span className="text-slate-700">{formatTimeRemaining(escalation.timeToNextEscalation)}</span>
                  </div>
                  <div className="w-full bg-slate-300 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        escalation.status === 'breached' ? 'bg-red-500' :
                        escalation.status === 'at-risk' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${escalation.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-600">
                  Resolution Target: {escalation.resolutionTarget}min
                </div>
              </div>
            ))
          )}
        </div>

        {/* Status Legend */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Status Legend</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-slate-700">Escalation Triggered - Response time exceeded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-slate-700">At Risk - Response time approaching limit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-slate-700">On Track - Within escalation timeline</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
