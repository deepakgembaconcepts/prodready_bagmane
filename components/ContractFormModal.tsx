
import React, { useState, useEffect } from 'react';
import type { Contract, Vendor } from '../types';
import { useMockData } from '../hooks/useMockData';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contract: Omit<Contract, 'id' | 'contractId'>) => void;
}

interface ContractYear {
  startDate: string;
  endDate: string;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

export const ContractFormModal: React.FC<ContractFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { vendors } = useMockData();
  
  const [title, setTitle] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [type, setType] = useState<'AMC' | 'One-Time' | 'Warranty' | 'Lease'>('AMC');
  const [value, setValue] = useState(0);
  const [contractYears, setContractYears] = useState<ContractYear[]>([
    { startDate: '', endDate: '' }
  ]);

  // Update start date: auto-fill end date to 365 days later, link renewal chain
  const updateContractYear = (index: number, startDate: string) => {
    if (!startDate) return;
    
    const newYears = [...contractYears];
    const start = new Date(startDate);
    const maxEnd = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    newYears[index].startDate = startDate;
    newYears[index].endDate = maxEnd.toISOString().split('T')[0];
    
    // Link renewal chain: next year's start = current year's end
    if (index + 1 < newYears.length) {
      newYears[index + 1].startDate = newYears[index].endDate;
      const nextStart = new Date(newYears[index].endDate);
      const nextEnd = new Date(nextStart.getTime() + 365 * 24 * 60 * 60 * 1000);
      newYears[index + 1].endDate = nextEnd.toISOString().split('T')[0];
    }
    
    setContractYears(newYears);
  };

  // Update end date manually with validation (≤ 365 days from start)
  const updateEndDate = (index: number, endDate: string) => {
    if (!endDate) return;
    
    const newYears = [...contractYears];
    const start = new Date(newYears[index].startDate);
    const end = new Date(endDate);
    const maxEnd = new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000);
    
    // Clamp to max 365 days
    if (end > maxEnd) {
      newYears[index].endDate = maxEnd.toISOString().split('T')[0];
    } else {
      newYears[index].endDate = endDate;
    }
    
    // Link renewal chain: next year's start = current year's end
    if (index + 1 < newYears.length) {
      newYears[index + 1].startDate = newYears[index].endDate;
      const nextStart = new Date(newYears[index].endDate);
      const nextEnd = new Date(nextStart.getTime() + 365 * 24 * 60 * 60 * 1000);
      newYears[index + 1].endDate = nextEnd.toISOString().split('T')[0];
    }
    
    setContractYears(newYears);
  };

  // Calculate days between start and end to show duration
  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get max allowed end date (start + 365 days)
  const getMaxEndDate = (start: string): string => {
    if (!start) return '';
    const startDate = new Date(start);
    const maxEnd = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    return maxEnd.toISOString().split('T')[0];
  };

  // Check if end date exceeds 365 days
  const isExceeded = (start: string, end: string): boolean => {
    if (!start || !end) return false;
    const days = calculateDays(start, end);
    return days > 365;
  };

  const addYear = () => {
    if (contractYears.length > 0) {
      const lastYear = contractYears[contractYears.length - 1];
      if (lastYear.endDate) {
        const nextStart = lastYear.endDate;
        const nextEnd = new Date(nextStart);
        nextEnd.setFullYear(new Date(nextStart).getFullYear() + 1);
        
        setContractYears([...contractYears, {
          startDate: nextStart,
          endDate: nextEnd.toISOString().split('T')[0]
        }]);
      }
    }
  };

  const removeYear = (index: number) => {
    if (contractYears.length > 1) {
      setContractYears(contractYears.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedVendor = vendors.find(v => v.id.toString() === vendorId);
    if (!selectedVendor || !contractYears[0].startDate || !contractYears[0].endDate) return;

    onSubmit({
      title,
      vendorName: selectedVendor.name,
      vendorId: selectedVendor.vendorId,
      type,
      value,
      startDate: new Date(contractYears[0].startDate),
      endDate: new Date(contractYears[contractYears.length - 1].endDate),
      status: 'Active'
    });
    // Reset
    setTitle('');
    setValue(0);
    setContractYears([{ startDate: '', endDate: '' }]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Create New Contract</h3>
          </div>
          <div className="p-6 space-y-4">
            
            <div>
                <label className={formLabelStyle}>Contract Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputStyle} required placeholder="e.g., Annual HVAC Maintenance" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Vendor</label>
                    <select value={vendorId} onChange={e => setVendorId(e.target.value)} className={formInputStyle} required>
                        <option value="">Select Vendor</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={formLabelStyle}>Contract Type</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className={formInputStyle} required>
                        <option value="AMC">AMC</option>
                        <option value="One-Time">One-Time</option>
                        <option value="Warranty">Warranty</option>
                        <option value="Lease">Lease</option>
                    </select>
                </div>
            </div>

             <div>
                <label className={formLabelStyle}>Contract Value (INR)</label>
                <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} className={formInputStyle} required min="0" />
            </div>

            {/* Contract Years Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className={formLabelStyle}>Contract Period(s)</label>
                <button
                  type="button"
                  onClick={addYear}
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                >
                  + Add Year
                </button>
              </div>

              {contractYears.map((year, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-slate-700">Year {index + 1}</h4>
                    {contractYears.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeYear(index)}
                        className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={formLabelStyle}>Start Date</label>
                      <input 
                        type="date" 
                        value={year.startDate} 
                        onChange={e => updateContractYear(index, e.target.value)}
                        className={formInputStyle} 
                        required 
                      />
                      {index > 0 && (
                        <p className="text-xs text-green-600 mt-1 font-medium">🔗 Renewal: linked from Year {index}</p>
                      )}
                    </div>
                    <div>
                      <label className={formLabelStyle}>End Date</label>
                      <input 
                        type="date" 
                        value={year.endDate} 
                        onChange={e => updateEndDate(index, e.target.value)}
                        max={getMaxEndDate(year.startDate)}
                        className={formInputStyle} 
                        required 
                      />
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Max 365 days</span>
                        <span className={`text-xs font-semibold flex items-center gap-1 ${
                          isExceeded(year.startDate, year.endDate) 
                            ? 'text-red-600' 
                            : calculateDays(year.startDate, year.endDate) === 365
                            ? 'text-green-600'
                            : 'text-blue-600'
                        }`}>
                          {calculateDays(year.startDate, year.endDate)}d
                          {isExceeded(year.startDate, year.endDate) && '⚠'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Create Contract</button>
          </div>
        </form>
      </div>
    </div>
  );
};
