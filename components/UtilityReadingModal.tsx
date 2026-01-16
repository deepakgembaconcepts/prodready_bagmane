
import React, { useState } from 'react';
import type { UtilityReading } from '../types';

interface UtilityReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reading: Omit<UtilityReading, 'id' | 'readingId' | 'consumption'>) => void;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const TENANTS = ['Google', 'Amazon', 'Microsoft', 'Oracle', 'Samsung', 'Intel', 'Apple', 'Meta'];
const UTILITY_TYPES: ('Electricity' | 'Water' | 'Diesel' | 'Gas' | 'Biogas')[] = ['Electricity', 'Water', 'Diesel', 'Gas', 'Biogas'];
const METER_LOCATIONS = ['Tower A - Floor 1', 'Tower A - Basement', 'Tower B - Ground', 'Tower C - Roof', 'Clubhouse', 'Pump House'];

export const UtilityReadingModal: React.FC<UtilityReadingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [utilityType, setUtilityType] = useState<typeof UTILITY_TYPES[number]>('Electricity');
  const [tenantName, setTenantName] = useState(TENANTS[0]);
  const [meterId, setMeterId] = useState('');
  const [meterLocation, setMeterLocation] = useState(METER_LOCATIONS[0]);
  const [meterSerialNumber, setMeterSerialNumber] = useState('');
  const [previousReading, setPreviousReading] = useState(0);
  const [currentReading, setCurrentReading] = useState(0);
  const [readingDate, setReadingDate] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState<number | ''>('');
  const [demand, setDemand] = useState<number | ''>(''); // for electrical
  const [powerFactor, setPowerFactor] = useState<number | ''>(''); // for electrical
  const [remarks, setRemarks] = useState('');
  const [readingTakenBy, setReadingTakenBy] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');

  if (!isOpen) return null;

  const getUnitForUtility = (type: typeof UTILITY_TYPES[number]) => {
    switch (type) {
      case 'Electricity': return 'kWh';
      case 'Water': return 'KL';
      case 'Diesel': return 'Liters';
      case 'Gas': return 'Cubic meters';
      case 'Biogas': return 'Cubic meters';
      default: return 'Units';
    }
  };

  const unit = getUnitForUtility(utilityType);
  const consumption = Math.max(0, currentReading - previousReading);
  const amount = ratePerUnit !== '' ? consumption * Number(ratePerUnit) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      utilityType,
      tenantName,
      meterId,
      previousReading,
      currentReading,
      readingDate: new Date(readingDate),
      unit,
      meterLocation: meterLocation || undefined,
      meterSerialNumber: meterSerialNumber || undefined,
      billingMonth: billingMonth || undefined,
      ratePerUnit: ratePerUnit !== '' ? Number(ratePerUnit) : undefined,
      amount: amount > 0 ? amount : undefined,
      demand: demand !== '' ? Number(demand) : undefined,
      powerFactor: powerFactor !== '' ? Number(powerFactor) : undefined,
      remarks: remarks || undefined,
      readingTakenBy: readingTakenBy || undefined,
      verifiedBy: verifiedBy || undefined,
    });
    // Reset
    setMeterId('');
    setCurrentReading(0);
    setPreviousReading(0);
    setRemarks('');
    setReadingTakenBy('');
    setVerifiedBy('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Record Meter Reading</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Utility Type</label>
                    <select value={utilityType} onChange={e => setUtilityType(e.target.value as any)} className={formInputStyle} required>
                        {UTILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label className={formLabelStyle}>Tenant / Division</label>
                    <select value={tenantName} onChange={e => setTenantName(e.target.value)} className={formInputStyle} required>
                        {TENANTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Meter ID</label>
                    <input type="text" value={meterId} onChange={e => setMeterId(e.target.value)} className={formInputStyle} required placeholder="MTR-XXXX" />
                </div>
                <div>
                    <label className={formLabelStyle}>Meter Serial Number</label>
                    <input type="text" value={meterSerialNumber} onChange={e => setMeterSerialNumber(e.target.value)} className={formInputStyle} placeholder="SN-XXXX" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Meter Location</label>
                    <select value={meterLocation} onChange={e => setMeterLocation(e.target.value)} className={formInputStyle}>
                        {METER_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                </div>
                <div>
                    <label className={formLabelStyle}>Reading Date</label>
                    <input type="date" value={readingDate} onChange={e => setReadingDate(e.target.value)} className={formInputStyle} required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Previous Reading ({unit})</label>
                    <input type="number" value={previousReading} onChange={e => setPreviousReading(Number(e.target.value))} className={formInputStyle} required min="0" step="0.01" />
                </div>
                <div>
                    <label className={formLabelStyle}>Current Reading ({unit})</label>
                    <input type="number" value={currentReading} onChange={e => setCurrentReading(Number(e.target.value))} className={formInputStyle} required min="0" step="0.01" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Billing Month</label>
                    <input type="month" value={billingMonth} onChange={e => setBillingMonth(e.target.value)} className={formInputStyle} />
                </div>
                <div>
                    <label className={formLabelStyle}>Rate per Unit (₹)</label>
                    <input type="number" value={ratePerUnit} onChange={e => setRatePerUnit(e.target.value === '' ? '' : Number(e.target.value))} className={formInputStyle} min="0" step="0.01" placeholder="0.00" />
                </div>
            </div>

            {utilityType === 'Electricity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={formLabelStyle}>Demand (kW)</label>
                        <input type="number" value={demand} onChange={e => setDemand(e.target.value === '' ? '' : Number(e.target.value))} className={formInputStyle} min="0" step="0.1" />
                    </div>
                    <div>
                        <label className={formLabelStyle}>Power Factor</label>
                        <input type="number" value={powerFactor} onChange={e => setPowerFactor(e.target.value === '' ? '' : Number(e.target.value))} className={formInputStyle} min="0" max="1" step="0.01" placeholder="0.95" />
                    </div>
                </div>
            )}
            
            <div className="p-4 bg-blue-50 rounded border border-blue-200 space-y-2">
                <p className="text-sm text-slate-700"><strong>Calculated Consumption:</strong> <span className="font-bold text-blue-900">{consumption.toFixed(2)} {unit}</span></p>
                {ratePerUnit !== '' && amount > 0 && (
                    <p className="text-sm text-slate-700"><strong>Calculated Amount:</strong> <span className="font-bold text-green-700">₹{amount.toFixed(2)}</span></p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Reading Taken By</label>
                    <input type="text" value={readingTakenBy} onChange={e => setReadingTakenBy(e.target.value)} className={formInputStyle} placeholder="Name of technician" />
                </div>
                <div>
                    <label className={formLabelStyle}>Verified By</label>
                    <input type="text" value={verifiedBy} onChange={e => setVerifiedBy(e.target.value)} className={formInputStyle} placeholder="Supervisor name" />
                </div>
            </div>

            <div>
                <label className={formLabelStyle}>Remarks / Notes</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className={formInputStyle} rows={2} placeholder="Any issues or observations..." />
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Save Reading</button>
          </div>
        </form>
      </div>
    </div>
  );
};