
import React, { useState } from 'react';
import type { Audit } from '../types';

interface AuditFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (audit: Omit<Audit, 'id' | 'auditId'>) => void;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const AUDIT_TYPES = ['Safety', 'Hygiene', 'Security', 'Statutory', 'Process', 'Internal', 'External'] as const;
const BUILDINGS = ['Tower A', 'Tower B', 'Tower C', 'Clubhouse', 'All'];

export const AuditFormModal: React.FC<AuditFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<typeof AUDIT_TYPES[number]>('Safety');
  const [auditor, setAuditor] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [status, setStatus] = useState<'Scheduled' | 'In Progress' | 'Completed'>('Scheduled');
  const [scope, setScope] = useState('');
  const [criteria, setCriteria] = useState('');
  const [buildingsCovered, setBuildingsCovered] = useState<string[]>([]);
  const [score, setScore] = useState<number | ''>('');
  const [findingsCount, setFindingsCount] = useState<number>(0);
  const [internalAuditReport, setInternalAuditReport] = useState('');

  if (!isOpen) return null;

  const handleBuildingToggle = (building: string) => {
    setBuildingsCovered(prev =>
      prev.includes(building)
        ? prev.filter(b => b !== building)
        : [...prev, building]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      type,
      auditor,
      scheduledDate: new Date(scheduledDate),
      status,
      scope: scope || undefined,
      criteria: criteria || undefined,
      buildingCovered: buildingsCovered.length > 0 ? buildingsCovered : undefined,
      score: score !== '' ? Number(score) : undefined,
      findingsCount,
      internalAuditReport: internalAuditReport || undefined,
    });
    // Reset
    setTitle('');
    setAuditor('');
    setScope('');
    setCriteria('');
    setBuildingsCovered([]);
    setScore('');
    setFindingsCount(0);
    setInternalAuditReport('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Schedule Audit</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            <div>
                <label className={formLabelStyle}>Audit Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputStyle} required placeholder="e.g., Q3 Fire Safety Audit" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Audit Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className={formInputStyle} required>
                        {AUDIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className={formLabelStyle}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className={formInputStyle}>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Scheduled Date</label>
                    <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className={formInputStyle} required />
                </div>
                <div>
                    <label className={formLabelStyle}>Auditor / Agency Name</label>
                    <input type="text" value={auditor} onChange={e => setAuditor(e.target.value)} className={formInputStyle} required placeholder="e.g., Internal Quality Team" />
                </div>
            </div>

            <div>
                <label className={formLabelStyle}>Scope of Audit</label>
                <textarea value={scope} onChange={e => setScope(e.target.value)} className={formInputStyle} rows={2} placeholder="Describe the scope and objectives..." />
            </div>

            <div>
                <label className={formLabelStyle}>Audit Criteria</label>
                <textarea value={criteria} onChange={e => setCriteria(e.target.value)} className={formInputStyle} rows={2} placeholder="Reference standards, regulations, etc." />
            </div>

            <div>
                <label className={formLabelStyle}>Buildings Covered</label>
                <div className="flex flex-wrap gap-3 mt-2">
                    {BUILDINGS.map(building => (
                        <label key={building} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={buildingsCovered.includes(building)}
                                onChange={() => handleBuildingToggle(building)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm text-slate-700">{building}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Audit Score (0-100)</label>
                    <input type="number" value={score} onChange={e => setScore(e.target.value === '' ? '' : Number(e.target.value))} className={formInputStyle} min="0" max="100" placeholder="75" />
                </div>
                <div>
                    <label className={formLabelStyle}>Number of Findings</label>
                    <input type="number" value={findingsCount} onChange={e => setFindingsCount(Number(e.target.value))} className={formInputStyle} min="0" />
                </div>
            </div>

            <div>
                <label className={formLabelStyle}>Internal Audit Report URL</label>
                <input type="text" value={internalAuditReport} onChange={e => setInternalAuditReport(e.target.value)} className={formInputStyle} placeholder="Link to report document" />
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Schedule Audit</button>
          </div>
        </form>
      </div>
    </div>
  );
};
