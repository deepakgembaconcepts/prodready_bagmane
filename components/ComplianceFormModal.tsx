
import React, { useState } from 'react';
import type { ComplianceItem } from '../types';

interface ComplianceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<ComplianceItem, 'id' | 'complianceId'>) => void;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const COMPLIANCE_TYPES = ['Legal', 'Statutory', 'Insurance', 'Regulatory', 'Internal Policy'] as const;
const CRITICALITY_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;

export const ComplianceFormModal: React.FC<ComplianceFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [complianceType, setComplianceType] = useState<typeof COMPLIANCE_TYPES[number]>('Statutory');
  const [status, setStatus] = useState<'Compliant' | 'Expiring Soon' | 'Non-Compliant' | 'Expired'>('Compliant');
  const [criticality, setCriticality] = useState<typeof CRITICALITY_LEVELS[number]>('High');
  const [documentUrl, setDocumentUrl] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [renewalCost, setRenewalCost] = useState<number | ''>('');
  const [renewalVendor, setRenewalVendor] = useState('');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [approvedBy, setApprovedBy] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expiry = new Date(expiryDate);
    const renewal = new Date(expiry);
    renewal.setDate(renewal.getDate() - 30);

    onSubmit({
      title,
      authority,
      licenseNumber,
      issueDate: new Date(issueDate),
      expiryDate: expiry,
      status,
      renewalDate: renewal,
      complianceType,
      criticality,
      documentUrl: documentUrl || undefined,
      responsiblePerson: responsiblePerson || undefined,
      renewalCost: renewalCost !== '' ? Number(renewalCost) : undefined,
      renewalVendor: renewalVendor || undefined,
      approvalRequired,
      approvedBy: approvedBy || undefined,
      notes: notes || undefined,
    });
    // Reset
    setTitle('');
    setLicenseNumber('');
    setDocumentUrl('');
    setResponsiblePerson('');
    setRenewalVendor('');
    setApprovedBy('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Add Statutory Compliance</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            <div>
                <label className={formLabelStyle}>Regulation / License Name</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputStyle} required placeholder="e.g., Fire NOC Renewal" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Compliance Type</label>
                    <select value={complianceType} onChange={e => setComplianceType(e.target.value as any)} className={formInputStyle} required>
                        {COMPLIANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className={formLabelStyle}>Criticality Level</label>
                    <select value={criticality} onChange={e => setCriticality(e.target.value as any)} className={formInputStyle}>
                        {CRITICALITY_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Issuing Authority</label>
                    <input type="text" value={authority} onChange={e => setAuthority(e.target.value)} className={formInputStyle} required placeholder="e.g., Municipal Corp" />
                </div>
                <div>
                    <label className={formLabelStyle}>License Number</label>
                    <input type="text" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} className={formInputStyle} required placeholder="LIC-XXXX" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Issue Date</label>
                    <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className={formInputStyle} required />
                </div>
                <div>
                    <label className={formLabelStyle}>Expiry Date</label>
                    <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={formInputStyle} required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)} className={formInputStyle}>
                        <option value="Compliant">Compliant</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Non-Compliant">Non-Compliant</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
                <div>
                    <label className={formLabelStyle}>Responsible Person</label>
                    <input type="text" value={responsiblePerson} onChange={e => setResponsiblePerson(e.target.value)} className={formInputStyle} placeholder="Name of responsible person" />
                </div>
            </div>

            <div>
                <label className={formLabelStyle}>Document URL</label>
                <input type="text" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} className={formInputStyle} placeholder="Link to license/certificate" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Renewal Cost (INR)</label>
                    <input type="number" value={renewalCost} onChange={e => setRenewalCost(e.target.value === '' ? '' : Number(e.target.value))} className={formInputStyle} min="0" placeholder="0" />
                </div>
                <div>
                    <label className={formLabelStyle}>Renewal Vendor</label>
                    <input type="text" value={renewalVendor} onChange={e => setRenewalVendor(e.target.value)} className={formInputStyle} placeholder="Vendor name for renewal" />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={approvalRequired}
                    onChange={e => setApprovalRequired(e.target.checked)}
                    className="w-4 h-4"
                    id="approval-required"
                />
                <label htmlFor="approval-required" className="text-sm font-semibold text-slate-700">Approval Required</label>
            </div>

            {approvalRequired && (
                <div>
                    <label className={formLabelStyle}>Approved By</label>
                    <input type="text" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} className={formInputStyle} placeholder="Approver name" />
                </div>
            )}

            <div>
                <label className={formLabelStyle}>Notes / Remarks</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className={formInputStyle} rows={3} placeholder="Any additional notes..." />
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Add Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};
