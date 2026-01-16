
import React, { useState, useMemo } from 'react';
import type { Incident, Ticket } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { generateRCAWithGemini } from '../services/geminiService';
import { EscalationTimeline } from './EscalationTimeline';

interface IncidentListProps {
    incidents: Incident[];
    onUpdateIncident: (incident: Incident) => void;
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const IncidentList: React.FC<IncidentListProps> = ({ incidents, onUpdateIncident }) => {
    const [filter, setFilter] = useState({ search: '', status: '', severity: '' });
    const [loadingRCA, setLoadingRCA] = useState<number | null>(null);
    const [selectedIncidentForTimeline, setSelectedIncidentForTimeline] = useState<Incident | null>(null);

    const filteredIncidents = useMemo(() => {
        return incidents.filter(i => {
            const matchesSearch = i.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                                  i.incidentId.toLowerCase().includes(filter.search.toLowerCase()) ||
                                  i.location.toLowerCase().includes(filter.search.toLowerCase());
            const matchesStatus = filter.status === '' || i.status === filter.status;
            const matchesSeverity = filter.severity === '' || i.severity === filter.severity;
            return matchesSearch && matchesStatus && matchesSeverity;
        });
    }, [incidents, filter]);

    const handleGenerateRCA = async (incident: Incident) => {
        if (!incident.description) return;
        setLoadingRCA(incident.id);
        try {
            const rcaText = await generateRCAWithGemini(incident.description);
            onUpdateIncident({ ...incident, rca: rcaText });
        } catch (error) {
            console.error("Failed to generate RCA", error);
        } finally {
            setLoadingRCA(null);
        }
    };

    const getSeverityBadge = (severity: string) => {
        const colors = {
            'Critical': 'bg-red-600 text-white',
            'Major': 'bg-orange-500 text-white',
            'Minor': 'bg-blue-100 text-blue-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[severity as keyof typeof colors]}`}>{severity}</span>;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800">Incident Registry</h3>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <input 
                        type="text" 
                        placeholder="Search Incidents..." 
                        className={filterInputStyle}
                        value={filter.search}
                        onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    />
                     <select 
                        className={filterInputStyle}
                        value={filter.severity}
                        onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
                    >
                        <option value="">All Severities</option>
                        <option value="Critical">Critical</option>
                        <option value="Major">Major</option>
                        <option value="Minor">Minor</option>
                    </select>
                    <select 
                        className={filterInputStyle}
                        value={filter.status}
                        onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>

                <div className="space-y-4">
                    {filteredIncidents.map(incident => (
                        <div key={incident.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <span className="font-mono text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">{incident.incidentId}</span>
                                    {getSeverityBadge(incident.severity)}
                                    <h4 className="font-bold text-slate-800">{incident.title}</h4>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${incident.status === 'Open' ? 'bg-red-50 text-red-600' : incident.status === 'Investigating' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                                    {incident.status}
                                </span>
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-3">{incident.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-500 mb-3">
                                <div>
                                    <span className="block font-semibold text-slate-700">Type</span>
                                    {incident.type}
                                </div>
                                <div>
                                    <span className="block font-semibold text-slate-700">Location</span>
                                    {incident.location}
                                </div>
                                <div>
                                    <span className="block font-semibold text-slate-700">Impact Level</span>
                                    {incident.severity === 'Critical' ? <span className="text-red-600 font-bold">🔴 {incident.severity}</span> : incident.severity === 'Major' ? <span className="text-orange-600 font-bold">🟠 {incident.severity}</span> : <span className="text-blue-600 font-bold">🔵 {incident.severity}</span>}
                                </div>
                                <div>
                                    <span className="block font-semibold text-slate-700">Reported</span>
                                    {incident.date.toLocaleDateString()}
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded border border-slate-100 mt-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Root Cause Analysis (RCA)</span>
                                    {!incident.rca && (
                                        <button 
                                            onClick={() => handleGenerateRCA(incident)}
                                            disabled={loadingRCA === incident.id}
                                            className="text-xs bg-brand-secondary text-white px-3 py-1 rounded hover:bg-brand-primary disabled:opacity-50 transition-colors"
                                        >
                                            {loadingRCA === incident.id ? 'Analyzing...' : 'Generate with AI'}
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 italic">
                                    {incident.rca || "No RCA available yet. Generate one using AI or enter manually."}
                                </p>
                            </div>

                            {/* Timeline Button */}
                            <button
                                onClick={() => setSelectedIncidentForTimeline(incident)}
                                className="w-full mt-3 text-xs border border-blue-300 text-blue-600 px-2 py-2 rounded hover:bg-blue-50 transition-colors"
                                title="View escalation timeline"
                            >
                                📈 Escalation Timeline
                            </button>
                        </div>
                    ))}
                    {filteredIncidents.length === 0 && (
                        <div className="text-center py-8 text-slate-400">No incidents found matching criteria.</div>
                    )}
                </div>

                {/* Escalation Timeline Modal */}
                {selectedIncidentForTimeline && (
                    <EscalationTimeline 
                        incident={selectedIncidentForTimeline} 
                        onClose={() => setSelectedIncidentForTimeline(null)} 
                    />
                )}
            </CardContent>
        </Card>
    );
};
