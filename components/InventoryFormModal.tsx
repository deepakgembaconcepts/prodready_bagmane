
import React, { useState } from 'react';
import type { InventoryItem } from '../types';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<InventoryItem, 'id' | 'itemId'>) => void;
  vendors?: Array<{ id: string; name: string; }>;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const CATEGORIES = ['HVAC', 'Electrical', 'Plumbing', 'Civil', 'Housekeeping', 'IT', 'Security'];

export const InventoryFormModal: React.FC<InventoryFormModalProps> = ({ isOpen, onClose, onSubmit, vendors = [] }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('Pcs');
  const [minLevel, setMinLevel] = useState(5);
  const [unitPrice, setUnitPrice] = useState(0);
  const [location, setLocation] = useState('Central Store');
  const [vendorId, setVendorId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      category,
      quantity,
      unit,
      minLevel,
      unitPrice,
      location,
      vendorId: vendorId || undefined,
      lastRestocked: new Date()
    } as any);
    // Reset
    setName('');
    setQuantity(0);
    setUnitPrice(0);
    setVendorId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Add Inventory Item</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            <div>
                <label className={formLabelStyle}>Item Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={formInputStyle} required placeholder="e.g., LED Bulb 9W" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className={formInputStyle} required>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                 <div>
                    <label className={formLabelStyle}>Storage Location</label>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={formInputStyle} required placeholder="e.g., A-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Quantity</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className={formInputStyle} required min="0" />
                </div>
                 <div>
                    <label className={formLabelStyle}>Unit of Measure</label>
                    <input type="text" value={unit} onChange={e => setUnit(e.target.value)} className={formInputStyle} required placeholder="e.g., Box, Pcs, Ltr" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={formLabelStyle}>Min. Stock Level</label>
                    <input type="number" value={minLevel} onChange={e => setMinLevel(Number(e.target.value))} className={formInputStyle} required min="0" />
                </div>
                 <div>
                    <label className={formLabelStyle}>Unit Price (₹)</label>
                    <input type="number" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} className={formInputStyle} required min="0" />
                </div>
            </div>

            <div>
                <label className={formLabelStyle}>Vendor (Optional)</label>
                <select value={vendorId} onChange={e => setVendorId(e.target.value)} className={formInputStyle}>
                    <option value="">-- Select Vendor --</option>
                    {vendors.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Link this item to a vendor for procurement tracking</p>
            </div>

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
};
