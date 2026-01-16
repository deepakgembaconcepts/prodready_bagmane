import React, { useState, useEffect } from 'react';
import { BuildingMaster } from '../data/buildingMasters';

interface BuildingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (building: BuildingMaster) => void;
  initialData?: BuildingMaster;
}

export const BuildingFormModal: React.FC<BuildingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditing = !!initialData?.id;
  
  const [formData, setFormData] = useState<Partial<BuildingMaster>>(
    initialData || {
      name: '',
      buildingCode: '',
      type: 'Commercial',
      greenCertification: '',
      constructionArea: 0,
      saleableArea: 0,
      completionYear: new Date().getFullYear(),
      address: '',
      totalArea: 0,
      status: 'Active',
      manager: '',
      contactNumber: '',
      floors: [],
    }
  );

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        buildingCode: '',
        type: 'Commercial',
        greenCertification: '',
        constructionArea: 0,
        saleableArea: 0,
        completionYear: new Date().getFullYear(),
        address: '',
        totalArea: 0,
        status: 'Active',
        manager: '',
        contactNumber: '',
        floors: [],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.buildingCode || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    const building: BuildingMaster = {
      id: formData.id || `bld-${Date.now()}`,
      name: formData.name,
      buildingCode: formData.buildingCode,
      type: formData.type || 'Commercial',
      greenCertification: formData.greenCertification,
      constructionArea: formData.constructionArea || 0,
      saleableArea: formData.saleableArea || 0,
      completionYear: formData.completionYear || new Date().getFullYear(),
      address: formData.address,
      totalArea: formData.totalArea || 0,
      status: formData.status as 'Active' | 'Under Construction' | 'Planned' | 'Decommissioned',
      manager: formData.manager || '',
      contactNumber: formData.contactNumber,
      floors: formData.floors || [],
    };

    onSubmit(building);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">
            {isEditing ? 'Edit Building' : 'Add New Building'}
          </h2>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Building Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bagmane Parin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Building Code *
                </label>
                <input
                  type="text"
                  value={formData.buildingCode || ''}
                  onChange={(e) => setFormData({ ...formData, buildingCode: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Parin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., CV Raman Nagar, Bangalore"
              />
            </div>
          </div>

          {/* Building Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Building Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Building Type
                </label>
                <select
                  value={formData.type || 'Commercial'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Commercial">Commercial</option>
                  <option value="REIT">REIT</option>
                  <option value="Office">Office</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Mixed Use">Mixed Use</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status || 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Planned">Planned</option>
                  <option value="Decommissioned">Decommissioned</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Green Certification
                </label>
                <input
                  type="text"
                  value={formData.greenCertification || ''}
                  onChange={(e) => setFormData({ ...formData, greenCertification: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LEED-Platinum"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Completion Year
                </label>
                <input
                  type="number"
                  value={formData.completionYear || new Date().getFullYear()}
                  onChange={(e) => setFormData({ ...formData, completionYear: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Area Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Area Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Total Area (Sq.ft)
                </label>
                <input
                  type="number"
                  value={formData.totalArea || 0}
                  onChange={(e) => setFormData({ ...formData, totalArea: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Construction Area (Sq.m)
                </label>
                <input
                  type="number"
                  value={formData.constructionArea || 0}
                  onChange={(e) => setFormData({ ...formData, constructionArea: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Saleable Area (Sq.m)
                </label>
                <input
                  type="number"
                  value={formData.saleableArea || 0}
                  onChange={(e) => setFormData({ ...formData, saleableArea: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Management Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Management Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Building Manager
                </label>
                <input
                  type="text"
                  value={formData.manager || ''}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Ramesh Paul S"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber || ''}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91-80-XXXX-XXXX"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              {isEditing ? 'Update Building' : 'Add Building'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
