
import React, { useState } from 'react';
import type { Incident } from '../types';
import { useMockData } from '../hooks/useMockData';

interface IncidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (incident: Omit<Incident, 'id' | 'incidentId'>) => void;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const INCIDENT_TYPES = ['Fire', 'Safety', 'Security', 'Technical', 'Environment'] as const;
const SEVERITIES = ['Minor', 'Major', 'Critical'] as const;

export const IncidentFormModal: React.FC<IncidentFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<typeof INCIDENT_TYPES[number]>('Safety');
  const [severity, setSeverity] = useState<typeof SEVERITIES[number]>('Minor');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reportedBy, setReportedBy] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incidentDate = new Date(`${date}T${time}`);
    
    onSubmit({
      title,
      type,
      severity,
      location,
      description,
      date: incidentDate,
      reportedBy,
      status: 'Open',
    });
    // Reset
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Report Incident</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            <div>
                <label className={formLabelStyle}>Incident Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputStyle} required placeholder="e.g., Water Leakage in Server Room" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className={formInputStyle} required>
                        {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={formLabelStyle}>Severity</label>
                    <select value={severity} onChange={e => setSeverity(e.target.value as any)} className={formInputStyle} required>
                         {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={formInputStyle} required placeholder="e.g., Tower B, 4th Floor" />
                </div>
                 <div>
                    <label className={formLabelStyle}>Reported By</label>
                    <input type="text" value={reportedBy} onChange={e => setReportedBy(e.target.value)} className={formInputStyle} required placeholder="Name" />
                </div>
            </div>

             <div>
                <label className={formLabelStyle}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={formInputStyle} required placeholder="Describe what happened..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className={formLabelStyle}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className={formInputStyle} required />
                </div>
                 <div>
                    <label className={formLabelStyle}>Time</label>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className={formInputStyle} required />
                </div>
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Submit Incident</button>
          </div>
        </form>
      </div>
    </div>
  );
};
