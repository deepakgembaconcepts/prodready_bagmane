
import React, { useState } from 'react';
import type { Vendor } from '../types';

interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendor: Omit<Vendor, 'id' | 'vendorId'>) => void;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

export const VendorFormModal: React.FC<VendorFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('HVAC');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [contractExpiry, setContractExpiry] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      serviceCategory,
      contactPerson,
      email,
      phone,
      rating: 5.0, // Default start rating
      status: 'Active',
      contractExpiry: new Date(contractExpiry)
    });
    // Reset
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Onboard New Vendor</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
                <label className={formLabelStyle}>Vendor Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required placeholder="e.g., Global Facility Services" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Service Category</label>
                    <select value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} className={formInputStyle} required>
                        <option value="HVAC">HVAC</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Security">Security</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Civil">Civil</option>
                    </select>
                </div>
                 <div>
                    <label className={formLabelStyle}>Contact Person</label>
                    <input type="text" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className={formInputStyle} required placeholder="Name" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className={formLabelStyle}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={formInputStyle} required placeholder="email@example.com" />
                </div>
                 <div>
                    <label className={formLabelStyle}>Phone</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={formInputStyle} required placeholder="9876543210" />
                </div>
            </div>
             <div>
                <label className={formLabelStyle}>Contract Expiry Date</label>
                <input type="date" value={contractExpiry} onChange={e => setContractExpiry(e.target.value)} className={formInputStyle} required />
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Save Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
};
