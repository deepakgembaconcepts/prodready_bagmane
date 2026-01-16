
import React, { useState, useMemo, useEffect } from 'react';
import type { Ticket } from '../types';
import { Status, Priority } from '../types';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { generateRCAWithGemini } from '../services/geminiService';
import { getEscalationRule } from '../services/escalationService';
import { EscalationTimeline } from './EscalationTimeline';
import { isSLABreached, calculateSLAStatus, getNextEscalationLevel } from '../services/slaService';

interface TicketListProps {
  tickets: Ticket[];
  onUpdateTicket: (ticket: Ticket) => void;
  onConvertTicket: (ticket: Ticket) => void;
}

type SortConfig = {
  key: keyof Ticket;
  direction: 'ascending' | 'descending';
} | null;

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const TicketList: React.FC<TicketListProps> = ({ tickets, onUpdateTicket, onConvertTicket }) => {
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
  const [loadingRCA, setLoadingRCA] = useState<number | null>(null);
  const [selectedTicketForTimeline, setSelectedTicketForTimeline] = useState<Ticket | null>(null);

  // Auto escalation based on time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tickets.forEach(ticket => {
        if (ticket.status === Status.Closed || ticket.status === Status.Resolved) return;
        const hoursElapsed = (now.getTime() - ticket.createdAt.getTime()) / (1000 * 60 * 60);
        let shouldEscalate = false;
        let newLevel: Ticket['assignedLevel'] = ticket.assignedLevel;
        if (ticket.assignedLevel === 'L0' && hoursElapsed >= 4) {
          newLevel = 'L1';
          shouldEscalate = true;
        } else if (ticket.assignedLevel === 'L1' && hoursElapsed >= 8) {
          newLevel = 'L2';
          shouldEscalate = true;
        } else if (ticket.assignedLevel === 'L2' && hoursElapsed >= 16) {
          newLevel = 'L3';
          shouldEscalate = true;
        }
        if (shouldEscalate && newLevel !== ticket.assignedLevel) {
          onUpdateTicket({ ...ticket, assignedLevel: newLevel, priority: ticket.priority === Priority.P4 ? Priority.P3 : ticket.priority });
        }
      });
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tickets, onUpdateTicket]);

  const handleGenerateRCA = async (ticket: Ticket) => {
    if (!ticket.description) return;
    setLoadingRCA(ticket.id);
    try {
      const rcaText = await generateRCAWithGemini(ticket.description);
      onUpdateTicket({ ...ticket, rootCauseAnalysis: rcaText });
    } catch (error) {
      console.error("Failed to generate RCA", error);
      onUpdateTicket({ ...ticket, rootCauseAnalysis: "Error generating RCA." });
    } finally {
      setLoadingRCA(null);
    }
  };

  const handleEscalate = (ticket: Ticket) => {
      let nextLevel: Ticket['assignedLevel'] = ticket.assignedLevel;
      
      // Escalation Logic Cycle
      if (ticket.assignedLevel === 'L0') nextLevel = 'L1';
      else if (ticket.assignedLevel === 'L1') nextLevel = 'L2';
      else if (ticket.assignedLevel === 'L2') nextLevel = 'L3';
      else if (ticket.assignedLevel === 'L3') nextLevel = 'L4';
      
      if (nextLevel !== ticket.assignedLevel) {
          onUpdateTicket({ ...ticket, assignedLevel: nextLevel, priority: Priority.P2 });
          // No alert here, relying on UI update to show change
      }
  };

  // Helper to check for SLA Breach (now uses escalation rules from slaService)
  const checkSlaBreached = (ticket: Ticket): boolean => {
      return isSLABreached(ticket);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const statusMatch = filter.status ? ticket.status === filter.status : true;
      const priorityMatch = filter.priority ? ticket.priority === filter.priority : true;
      const searchMatch = filter.search
        ? ticket.ticketId.toLowerCase().includes(filter.search.toLowerCase()) ||
          ticket.description.toLowerCase().includes(filter.search.toLowerCase()) ||
          ticket.createdBy.toLowerCase().includes(filter.search.toLowerCase())
        : true;
      return statusMatch && priorityMatch && searchMatch;
    });
  }, [tickets, filter]);

  const sortedTickets = useMemo(() => {
    let sortableItems = [...filteredTickets];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredTickets, sortConfig]);
  
  const requestSort = (key: keyof Ticket) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Ticket) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  return (
    <Card>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search Tickets, Users..."
            className={filterInputStyle}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          />
          <select
            className={filterInputStyle}
            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className={filterInputStyle}
            onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
          >
            <option value="">All Priorities</option>
            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('ticketId')}>Ticket ID {getSortIndicator('ticketId')}</th>
                <th scope="col" className="px-6 py-3">Type / Issue</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</th>
                <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort('priority')}>Priority {getSortIndicator('priority')}</th>
                <th scope="col" className="px-6 py-3">Level</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTickets.map(ticket => {
                  const breached = checkSlaBreached(ticket);
                  return (
                    <tr key={ticket.id} className={`bg-white border-b hover:bg-slate-50 ${breached ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                      <td className="px-6 py-4 font-medium text-slate-900">
                          {ticket.ticketId}
                          {breached && <span className="ml-2 text-xs text-red-600 font-bold border border-red-200 px-1 rounded bg-white">⚠ BREACH</span>}
                      </td>
                      <td className="px-6 py-4 text-xs">
                          <div className="font-semibold">{ticket.ticketType || 'Reactive'}</div>
                          <div className="text-slate-500">{ticket.issueType || 'Standard'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{ticket.category} / {ticket.subcategory}</td>
                      <td className="px-6 py-4">
                        <select
                          value={ticket.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as Status;
                            // Enforce workflow: Open -> WIP -> Resolved -> Closed
                            if (ticket.status === Status.Open && newStatus === Status.Resolved) return;
                            if (ticket.status === Status.WIP && newStatus === Status.Open) return;
                            if (ticket.status === Status.Resolved && (newStatus === Status.Open || newStatus === Status.WIP)) return;
                            onUpdateTicket({ ...ticket, status: newStatus });
                          }}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          {ticket.status === Status.Open && (
                            <>
                              <option value={Status.Open}>Open</option>
                              <option value={Status.WIP}>WIP</option>
                            </>
                          )}
                          {ticket.status === Status.WIP && (
                            <>
                              <option value={Status.WIP}>WIP</option>
                              <option value={Status.Resolved}>Resolved</option>
                            </>
                          )}
                          {ticket.status === Status.Resolved && (
                            <>
                              <option value={Status.Resolved}>Resolved</option>
                              <option value={Status.Closed}>Closed</option>
                            </>
                          )}
                          {ticket.status === Status.Closed && (
                            <option value={Status.Closed}>Closed</option>
                          )}
                        </select>
                      </td>
                      <td className="px-6 py-4"><Badge type={ticket.priority} /></td>
                      <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded transition-colors ${
                              ticket.assignedLevel === 'L0' ? 'bg-blue-100 text-blue-800' :
                              ticket.assignedLevel === 'L1' ? 'bg-yellow-100 text-yellow-800' :
                              ticket.assignedLevel === 'L2' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                              {ticket.assignedLevel}
                          </span>
                      </td>
                      <td className="px-6 py-4 space-y-2">
                         {/* Timeline Button */}
                         <button
                             onClick={() => setSelectedTicketForTimeline(ticket)}
                             className="block w-full text-center text-xs border border-blue-300 text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                             title="View escalation timeline"
                         >
                             📈 Escalation Timeline
                         </button>

                         {/* RCA Button */}
                         {ticket.status === Status.Resolved && !ticket.rootCauseAnalysis && (
                           <button 
                             onClick={() => handleGenerateRCA(ticket)}
                             disabled={loadingRCA === ticket.id}
                             className="block w-full text-center text-xs bg-brand-secondary text-white px-2 py-1 rounded hover:bg-brand-primary disabled:bg-slate-300 mb-1"
                           >
                             {loadingRCA === ticket.id ? 'Generating...' : 'Generate RCA'}
                           </button>
                         )}
                         {ticket.rootCauseAnalysis && <p className="text-xs text-slate-600 mb-1">RCA Generated</p>}

                         {/* Create Task Button */}
                         {(ticket.status === Status.Open || ticket.status === Status.WIP) && (
                            <button
                                onClick={() => onConvertTicket(ticket)}
                                className="block w-full text-center text-xs border border-brand-primary text-brand-primary px-2 py-1 rounded hover:bg-brand-primary hover:text-white transition-colors"
                            >
                                Create Task
                            </button>
                         )}

                         {/* Escalation Button - Visual Cycle */}
                         {(ticket.status === Status.Open || ticket.status === Status.WIP) && ticket.assignedLevel !== 'L4' && (
                             <button
                                onClick={() => handleEscalate(ticket)}
                                className="block w-full text-center text-xs text-red-600 font-semibold hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-2 py-1 rounded transition-colors mt-1"
                                title="Escalate to next level"
                             >
                                 Escalate ↑
                             </button>
                         )}
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>

        {/* Escalation Timeline Modal */}
        {selectedTicketForTimeline && (
          <EscalationTimeline 
            ticket={selectedTicketForTimeline} 
            onClose={() => setSelectedTicketForTimeline(null)} 
          />
        )}
      </CardContent>
    </Card>
  );
};
