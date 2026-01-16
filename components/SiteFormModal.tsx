
import React, { useState } from 'react';
import type { Site } from '../types';

interface SiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (site: Omit<Site, 'id' | 'buildings'>) => void;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

export const SiteFormModal: React.FC<SiteFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      region,
      city,
    });
    // Reset
    setName('');
    setRegion('');
    setCity('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Add New Site</h3>
          </div>
          <div className="p-6 space-y-4">
            
            <div>
                <label className={formLabelStyle}>Site / Campus Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required placeholder="e.g., Bagmane Constellation" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Region</label>
                    <select value={region} onChange={e => setRegion(e.target.value)} className={formInputStyle} required>
                        <option value="">Select Region</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                    </select>
                </div>
                 <div>
                    <label className={formLabelStyle}>City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} className={formInputStyle} required placeholder="e.g., Bangalore" />
                </div>
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Create Site</button>
          </div>
        </form>
      </div>
    </div>
  );
};
