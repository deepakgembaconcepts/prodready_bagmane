
import React, { useState } from 'react';
import type { Asset, Contract } from '../types';
import { AssetCategory, AssetStatus } from '../types';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (asset: Omit<Asset, 'id' | 'assetId' | 'nextMaintenanceDate'>) => void;
  contracts: Contract[];
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

export const AssetFormModal: React.FC<AssetFormModalProps> = ({ isOpen, onClose, onSubmit, contracts }) => {
  // Basic Information
  const [campus, setCampus] = useState('BSOC');
  const [building, setBuilding] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>(AssetCategory.HVAC);
  const [subCategory, setSubCategory] = useState('');
  const [assetType, setAssetType] = useState('');
  const [serviceType, setServiceType] = useState('Technical');
  
  // Hierarchy
  const [parentAssetCode, setParentAssetCode] = useState('');
  const [childAssetDetails, setChildAssetDetails] = useState('');
  
  // Location
  const [wing, setWing] = useState('');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [location, setLocation] = useState('');
  
  // Asset Properties
  const [status, setStatus] = useState<AssetStatus>(AssetStatus.Operational);
  const [critical, setCritical] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [uom, setUom] = useState('');
  
  // Maintenance
  const [maintenancePolicy, setMaintenancePolicy] = useState('');
  const [surfaceType, setSurfaceType] = useState('');
  
  // Ownership
  const [assetOwner, setAssetOwner] = useState('Bagmane');
  const [clientQRCode, setClientQRCode] = useState('');
  const [clientAssetCode, setClientAssetCode] = useState('');
  const [fmPartnerCode, setFmPartnerCode] = useState('');
  const [companyAssetCode, setCompanyAssetCode] = useState('');
  const [alternatePartNumber, setAlternatePartNumber] = useState('');
  
  // Dates
  const [purchaseDate, setPurchaseDate] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [lifeOfEquipment, setLifeOfEquipment] = useState<number | ''>('');
  const [endOfLife, setEndOfLife] = useState('');
  const [overhaulDate, setOverhaulDate] = useState('');
  
  // Installation & Handover
  const [oem, setOem] = useState('');
  const [installedBy, setInstalledBy] = useState('');
  const [warrantyApplicable, setWarrantyApplicable] = useState(false);
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [handoverIndicatedDate, setHandoverIndicatedDate] = useState('');
  const [handoverActualDate, setHandoverActualDate] = useState('');
  
  // Insurance
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insuranceAgent, setInsuranceAgent] = useState('');
  const [insuranceDate, setInsuranceDate] = useState('');
  
  // Financial
  const [cost, setCost] = useState<number>(0);
  const [depreciationRate, setDepreciationRate] = useState<number | ''>('');
  const [replacementCost, setReplacementCost] = useState<number | ''>('');
  
  // Additional
  const [remarks, setRemarks] = useState('');
  const [contractId, setContractId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate next maintenance date (1 month from now by default)
    const nextMaint = new Date();
    nextMaint.setMonth(nextMaint.getMonth() + 1);

    onSubmit({
      name,
      category,
      status,
      building,
      location,
      cost,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      nextMaintenanceDate: nextMaint,
      serialNumber,
      contractId: contractId || undefined,
      
      // Extended fields
      campus,
      subCategory,
      assetType,
      serviceType,
      parentAssetCode,
      childAssetDetails,
      wing,
      floor,
      room,
      critical,
      quantity,
      make,
      model,
      capacity,
      uom,
      maintenancePolicy,
      surfaceType,
      assetOwner,
      clientQRCode,
      clientAssetCode,
      fmPartnerCode,
      companyAssetCode,
      alternatePartNumber,
      installDate: installDate ? new Date(installDate) : undefined,
      lifeOfEquipment: lifeOfEquipment ? Number(lifeOfEquipment) : undefined,
      endOfLife: endOfLife ? new Date(endOfLife) : undefined,
      overhaulDate: overhaulDate ? new Date(overhaulDate) : undefined,
      oem,
      installedBy,
      warrantyApplicable,
      handoverIndicatedDate: handoverIndicatedDate ? new Date(handoverIndicatedDate) : undefined,
      handoverActualDate: handoverActualDate ? new Date(handoverActualDate) : undefined,
      insuranceCompany,
      insuranceAgent,
      insuranceDate: insuranceDate ? new Date(insuranceDate) : undefined,
      depreciationRate: depreciationRate ? Number(depreciationRate) : undefined,
      replacementCost: replacementCost ? Number(replacementCost) : undefined,
      remarks,
    });
    
    // Reset form
    setName('');
    setSerialNumber('');
    setContractId('');
    onClose();
  };

  const activeContracts = contracts.filter(c => c.status === 'Active');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 my-8">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b sticky top-0 bg-white">
            <h3 className="text-xl font-semibold text-slate-800">Add New Asset</h3>
            <p className="text-xs text-slate-500 mt-1">Fields marked with * are required</p>
          </div>
          
          <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            
            {/* BASIC INFORMATION */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Basic Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Campus</label>
                  <input type="text" value={campus} onChange={e => setCampus(e.target.value)} className={formInputStyle} placeholder="e.g., BSOC" />
                </div>
                <div>
                  <label className={formLabelStyle}>Building *</label>
                  <input type="text" value={building} onChange={e => setBuilding(e.target.value)} className={formInputStyle} required placeholder="e.g., Helium" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Asset Name (Max 120 chars) *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} maxLength={120} className={formInputStyle} required placeholder="e.g., Terrace Pressurization panel" />
                </div>
                <div>
                  <label className={formLabelStyle}>Category *</label>
                  <select value={category} onChange={e => setCategory(e.target.value as AssetCategory)} className={formInputStyle} required>
                    {Object.values(AssetCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Sub Category</label>
                  <input type="text" value={subCategory} onChange={e => setSubCategory(e.target.value)} className={formInputStyle} placeholder="e.g., Ventilation" />
                </div>
                <div>
                  <label className={formLabelStyle}>Asset Type *</label>
                  <input type="text" value={assetType} onChange={e => setAssetType(e.target.value)} className={formInputStyle} required placeholder="e.g., Pressurization Fan" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Service Type *</label>
                  <select value={serviceType} onChange={e => setServiceType(e.target.value)} className={formInputStyle} required>
                    <option value="Technical">Technical</option>
                    <option value="Soft Services">Soft Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={formLabelStyle}>Status *</label>
                  <select value={status} onChange={e => setStatus(e.target.value as AssetStatus)} className={formInputStyle} required>
                    {Object.values(AssetStatus).map(stat => <option key={stat} value={stat}>{stat}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* HIERARCHY */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Asset Hierarchy</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Parent Asset Code (Max 20 chars)</label>
                  <input type="text" value={parentAssetCode} onChange={e => setParentAssetCode(e.target.value)} maxLength={20} className={formInputStyle} placeholder="e.g., BSOCHEWTFACTP1" />
                </div>
                <div>
                  <label className={formLabelStyle}>Child Asset Details (Max 120 chars)</label>
                  <input type="text" value={childAssetDetails} onChange={e => setChildAssetDetails(e.target.value)} maxLength={120} className={formInputStyle} placeholder="e.g., Circuit Breakers, Busbars" />
                </div>
              </div>
            </div>

            {/* LOCATION DETAILS */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Location Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Wing</label>
                  <input type="text" value={wing} onChange={e => setWing(e.target.value)} className={formInputStyle} placeholder="e.g., West, East" />
                </div>
                <div>
                  <label className={formLabelStyle}>Floor *</label>
                  <input type="text" value={floor} onChange={e => setFloor(e.target.value)} className={formInputStyle} required placeholder="e.g., Terrace, Ground Floor" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Room *</label>
                  <input type="text" value={room} onChange={e => setRoom(e.target.value)} className={formInputStyle} required placeholder="e.g., LT Room, Terrace" />
                </div>
                <div>
                  <label className={formLabelStyle}>Location / Specific Area</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={formInputStyle} placeholder="e.g., Basement 1" />
                </div>
              </div>
            </div>

            {/* ASSET PROPERTIES */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Asset Properties</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Critical</label>
                  <select value={critical ? 'yes' : 'no'} onChange={e => setCritical(e.target.value === 'yes')} className={formInputStyle}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className={formLabelStyle}>Quantity (Max 6 chars)</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className={formInputStyle} placeholder="1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Make/Manufacturer (Max 64 chars)</label>
                  <input type="text" value={make} onChange={e => setMake(e.target.value)} maxLength={64} className={formInputStyle} placeholder="e.g., Pace Switchgears Pvt. Ltd." />
                </div>
                <div>
                  <label className={formLabelStyle}>Model (Max 25 chars)</label>
                  <input type="text" value={model} onChange={e => setModel(e.target.value)} maxLength={25} className={formInputStyle} placeholder="e.g., NA, MODEL123" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Serial No. (Max 25 chars) *</label>
                  <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} maxLength={25} className={formInputStyle} required placeholder="e.g., PSPL_P92_0322_12GA" />
                </div>
                <div>
                  <label className={formLabelStyle}>Capacity (Max 10 chars)</label>
                  <input type="text" value={capacity} onChange={e => setCapacity(e.target.value)} maxLength={10} className={formInputStyle} placeholder="e.g., 400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>UOM (Unit of Measure) *</label>
                  <input type="text" value={uom} onChange={e => setUom(e.target.value)} className={formInputStyle} required placeholder="e.g., AMPS, WATTS, Liters" />
                </div>
                <div>
                  <label className={formLabelStyle}>Maintenance Policy</label>
                  <select value={maintenancePolicy} onChange={e => setMaintenancePolicy(e.target.value)} className={formInputStyle}>
                    <option value="">Select...</option>
                    <option value="Schedule planned">Schedule planned</option>
                    <option value="Reactive">Reactive</option>
                    <option value="Preventive">Preventive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className={formLabelStyle}>Surface Type</label>
                <input type="text" value={surfaceType} onChange={e => setSurfaceType(e.target.value)} className={formInputStyle} placeholder="e.g., NA, Metal, Concrete" />
              </div>
            </div>

            {/* OWNERSHIP & QR CODES */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Ownership & Codes</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Asset Owner</label>
                  <input type="text" value={assetOwner} onChange={e => setAssetOwner(e.target.value)} className={formInputStyle} placeholder="e.g., Bagmane" />
                </div>
                <div>
                  <label className={formLabelStyle}>Client QR Code (Max 64 chars)</label>
                  <input type="text" value={clientQRCode} onChange={e => setClientQRCode(e.target.value)} maxLength={64} className={formInputStyle} placeholder="QR Code" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Client Asset Code (Max 64 chars)</label>
                  <input type="text" value={clientAssetCode} onChange={e => setClientAssetCode(e.target.value)} maxLength={64} className={formInputStyle} placeholder="Asset Code" />
                </div>
                <div>
                  <label className={formLabelStyle}>FM Partner Code (Max 64 chars)</label>
                  <input type="text" value={fmPartnerCode} onChange={e => setFmPartnerCode(e.target.value)} maxLength={64} className={formInputStyle} placeholder="Partner Code" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Company Asset Code (Max 64 chars)</label>
                  <input type="text" value={companyAssetCode} onChange={e => setCompanyAssetCode(e.target.value)} maxLength={64} className={formInputStyle} placeholder="Company Code" />
                </div>
                <div>
                  <label className={formLabelStyle}>Alternate Part Number (Max 64 chars)</label>
                  <input type="text" value={alternatePartNumber} onChange={e => setAlternatePartNumber(e.target.value)} maxLength={64} className={formInputStyle} placeholder="Part Number" />
                </div>
              </div>
            </div>

            {/* DATES */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Dates</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Date Of Purchase (dd-mm-yyyy)</label>
                  <input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className={formInputStyle} />
                </div>
                <div>
                  <label className={formLabelStyle}>Date Of Installation (dd-mm-yyyy)</label>
                  <input type="date" value={installDate} onChange={e => setInstallDate(e.target.value)} className={formInputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Life Of Equipment (Years) (Max 3)</label>
                  <input type="number" value={lifeOfEquipment} onChange={e => setLifeOfEquipment(e.target.value === '' ? '' : Number(e.target.value))} max="999" className={formInputStyle} placeholder="e.g., 15" />
                </div>
                <div>
                  <label className={formLabelStyle}>End Of Life (dd-mm-yyyy)</label>
                  <input type="date" value={endOfLife} onChange={e => setEndOfLife(e.target.value)} className={formInputStyle} />
                </div>
              </div>

              <div className="mt-4">
                <label className={formLabelStyle}>Date Of Overhaul (dd-mm-yyyy)</label>
                <input type="date" value={overhaulDate} onChange={e => setOverhaulDate(e.target.value)} className={formInputStyle} />
              </div>
            </div>

            {/* INSTALLATION & WARRANTY */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Installation & Warranty</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>OEM (Max 120 chars)</label>
                  <input type="text" value={oem} onChange={e => setOem(e.target.value)} maxLength={120} className={formInputStyle} placeholder="e.g., Pace Switchgears Pvt. Ltd." />
                </div>
                <div>
                  <label className={formLabelStyle}>Installed By (Max 120 chars)</label>
                  <input type="text" value={installedBy} onChange={e => setInstalledBy(e.target.value)} maxLength={120} className={formInputStyle} placeholder="e.g., Pace Switchgears Pvt. Ltd." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Warranty Applicable</label>
                  <select value={warrantyApplicable ? 'yes' : 'no'} onChange={e => setWarrantyApplicable(e.target.value === 'yes')} className={formInputStyle}>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div>
                  <label className={formLabelStyle}>Warranty Valid Date (dd-mm-yyyy)</label>
                  <input type="date" value={warrantyExpiry} onChange={e => setWarrantyExpiry(e.target.value)} className={formInputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={formLabelStyle}>Handover Indicated Date (dd-mm-yyyy)</label>
                  <input type="date" value={handoverIndicatedDate} onChange={e => setHandoverIndicatedDate(e.target.value)} className={formInputStyle} />
                </div>
                <div>
                  <label className={formLabelStyle}>Handover Actual Date (dd-mm-yyyy)</label>
                  <input type="date" value={handoverActualDate} onChange={e => setHandoverActualDate(e.target.value)} className={formInputStyle} />
                </div>
              </div>
            </div>

            {/* INSURANCE */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Insurance</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Insurance Company</label>
                  <input type="text" value={insuranceCompany} onChange={e => setInsuranceCompany(e.target.value)} className={formInputStyle} placeholder="e.g., SBI General Insurance" />
                </div>
                <div>
                  <label className={formLabelStyle}>Insurance Agent</label>
                  <input type="text" value={insuranceAgent} onChange={e => setInsuranceAgent(e.target.value)} className={formInputStyle} placeholder="e.g., Optima Insurance Brokers" />
                </div>
              </div>

              <div className="mt-4">
                <label className={formLabelStyle}>Insurance Date</label>
                <input type="date" value={insuranceDate} onChange={e => setInsuranceDate(e.target.value)} className={formInputStyle} />
              </div>
            </div>

            {/* FINANCIAL */}
            <div className="border-b pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Financial Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Cost *</label>
                  <input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className={formInputStyle} required placeholder="0.00" />
                </div>
                <div>
                  <label className={formLabelStyle}>Rate Of Depreciation (%)</label>
                  <input type="number" value={depreciationRate} onChange={e => setDepreciationRate(e.target.value === '' ? '' : Number(e.target.value))} step="0.1" className={formInputStyle} placeholder="0.00" />
                </div>
              </div>

              <div className="mt-4">
                <label className={formLabelStyle}>Replacement Cost</label>
                <input type="number" value={replacementCost} onChange={e => setReplacementCost(e.target.value === '' ? '' : Number(e.target.value))} className={formInputStyle} placeholder="0.00" />
              </div>
            </div>

            {/* ADDITIONAL */}
            <div className="pb-4">
              <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">Additional Information</h4>
              
              <div className="mb-4">
                <label className={formLabelStyle}>Remarks (Max 255 chars)</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} maxLength={255} className={formInputStyle} rows={3} placeholder="Any additional notes about this asset..." />
              </div>

              <div>
                <label className={formLabelStyle}>Link Contract (if applicable)</label>
                <select value={contractId} onChange={e => setContractId(e.target.value)} className={formInputStyle}>
                  <option value="">No Contract</option>
                  {activeContracts.map(contract => (
                    <option key={contract.id} value={contract.id.toString()}>
                      {contract.vendor} - {contract.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-slate-50 flex gap-3 justify-end sticky bottom-0">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-secondary transition-colors">
              Create Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
