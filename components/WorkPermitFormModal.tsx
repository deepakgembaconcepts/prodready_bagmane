
import React, { useState, useEffect } from 'react';
import type { WorkPermit } from '../types';
import { useMockData } from '../hooks/useMockData';
import { JSAService } from '../services/jsaService';
import type { JSA } from '../services/jsaService';

interface WorkPermitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (permit: Omit<WorkPermit, 'id' | 'permitId'>) => void;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const PERMIT_TYPES = ['Hot Work', 'Height Work', 'Electrical', 'Confined Space', 'General', 'Excavation', 'Lifting and Hoisting'] as const;
const PPE_OPTIONS = ['Hardhat', 'Safety Goggles', 'Gloves', 'Safety Shoes', 'High Visibility Vest', 'Respirator', 'Face Shield', 'Earplugs'];

export const WorkPermitFormModal: React.FC<WorkPermitFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { vendors } = useMockData();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: JSA Selection, 2: Basic Details, 3: Advanced Details
  const [type, setType] = useState<typeof PERMIT_TYPES[number]>('General');
  const [description, setDescription] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [issuer, setIssuer] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');
  const [safetyPrecautions, setSafetyPrecautions] = useState('');
  const [selectedPPE, setSelectedPPE] = useState<string[]>([]);
  const [gasTestResults, setGasTestResults] = useState('');
  const [incidentOccurred, setIncidentOccurred] = useState(false);
  const [incidentDetails, setIncidentDetails] = useState('');

  // JSA States
  const [selectedJSAId, setSelectedJSAId] = useState<string>('');
  const [availableJSAs, setAvailableJSAs] = useState<JSA[]>([]);
  const [selectedJSADetails, setSelectedJSADetails] = useState<JSA | null>(null);
  const [jsaLoading, setJsaLoading] = useState(true);

  // Load approved JSAs on mount
  useEffect(() => {
    if (isOpen) {
      const loadJSAs = async () => {
        try {
          const approved = await JSAService.getActiveJSAs();
          setAvailableJSAs(approved);
        } catch (error) {
          console.error('Error loading JSAs:', error);
          setAvailableJSAs([]);
        } finally {
          setJsaLoading(false);
        }
      };
      loadJSAs();
    }
  }, [isOpen]);

  // Advanced checks
  const [riskAssessmentDone, setRiskAssessmentDone] = useState(false);
  const [isolationDone, setIsolationDone] = useState(false);
  const [medicalEmergencyPlan, setMedicalEmergencyPlan] = useState(false);

  if (!isOpen) return null;

  const handlePPEToggle = (ppe: string) => {
    setSelectedPPE(prev =>
      prev.includes(ppe)
        ? prev.filter(p => p !== ppe)
        : [...prev, ppe]
    );
  };

  const handleJSASelect = (jsaId: string) => {
    setSelectedJSAId(jsaId);
    const jsa = availableJSAs.find(j => j.id === jsaId);
    setSelectedJSADetails(jsa || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check JSA selection
    if (!selectedJSAId) {
      alert('Please select an approved JSA before proceeding');
      return;
    }
    
    // Validate start time: must be between 09:00 and 18:00
    const start = new Date(`${startDate}T${startTime}`);
    const startHour = start.getHours();
    if (startHour < 9 || startHour >= 18) {
      alert('Work Permit start time must be between 09:00 and 18:00');
      return;
    }
    
    // Validate end time: max 20:00 (can be extended up to 2 hours from 18:00)
    const end = new Date(`${endDate}T${endTime}`);
    const endHour = end.getHours();
    if (endHour > 20 || (endHour === 20 && end.getMinutes() > 0)) {
      alert('Work Permit end time cannot exceed 20:00 (maximum 2-hour extension from 18:00)');
      return;
    }
    
    // Check if extension request is needed (beyond 18:00)
    if (endHour > 18 || (endHour === 18 && end.getMinutes() > 0)) {
      const confirmExtension = confirm(`This work extends beyond 18:00 to ${endTime}. An extension request will be created for approval. Continue?`);
      if (!confirmExtension) {
        return;
      }
    }
    
    onSubmit({
      type,
      description: description || workDescription,
      vendor,
      location,
      startDate: start,
      endDate: end,
      status: 'Pending',
      approver: issuer || 'Safety Officer',
      jsaVerified: true,
      workDescription: workDescription || undefined,
      riskAssessmentDone,
      safetyPrecautions: safetyPrecautions || undefined,
      contractorName: contractorName || undefined,
      contractorContactNumber: contractorPhone || undefined,
      supervisorName: supervisorName || undefined,
      equipmentUsed: equipmentUsed || undefined,
      gasTestResults: gasTestResults || undefined,
      isolationDone,
      personalProtectiveEquipment: selectedPPE.length > 0 ? selectedPPE : undefined,
      medicalEmergencyPlan,
      incidentOccurred,
      incidentDetails: incidentDetails || undefined,
      issuer: issuer || undefined,
      issuedDate: new Date(),
    });
    // Reset
    setDescription('');
    setWorkDescription('');
    setLocation('');
    setStep(1);
    setSelectedJSAId('');
    setSelectedJSADetails(null);
    setSelectedPPE([]);
    onClose();
  };

  const isJSASelected = selectedJSAId !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b flex justify-between items-center">
            <h3 className="text-xl font-semibold text-slate-800">
                {step === 1 ? 'Step 1: Select Job Safety Analysis (JSA)' : step === 2 ? 'Step 2: Permit Details' : 'Step 3: Advanced Details'}
            </h3>
            <span className="text-sm text-slate-500">Step {step} of 3</span>
          </div>
          
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {step === 1 && (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded border border-blue-200">
                        ℹ️ Select an approved Job Safety Analysis (JSA) to link with this Work Permit. The JSA contains all hazard identification, risk assessments, and required safety measures.
                    </p>
                    
                    {jsaLoading ? (
                        <div className="p-4 text-center text-slate-600">Loading approved JSAs...</div>
                    ) : availableJSAs.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                            ⚠️ No approved JSAs available. Please create and approve a JSA first.
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className={formLabelStyle}>Select Approved JSA</label>
                                <select 
                                    value={selectedJSAId} 
                                    onChange={(e) => handleJSASelect(e.target.value)}
                                    className={formInputStyle}
                                    required
                                >
                                    <option value="">-- Choose a JSA --</option>
                                    {Array.isArray(availableJSAs) && availableJSAs.map(jsa => (
                                        <option key={jsa.id} value={jsa.id}>
                                            {jsa.jobTitle} ({jsa.jsaId}) - {jsa.department}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedJSADetails && (
                                <div className="border-2 border-green-300 bg-green-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-semibold text-slate-800">📋 Selected JSA Details</h4>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600 uppercase">JSA ID</p>
                                            <p className="text-slate-800">{selectedJSADetails.jsaId}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600 uppercase">Status</p>
                                            <p className="text-green-700 font-medium">✓ Approved</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600 uppercase">Department</p>
                                            <p className="text-slate-800">{selectedJSADetails.department}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600 uppercase">Valid Until</p>
                                            <p className="text-slate-800">{new Date(selectedJSADetails.validUntil).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Identified Hazards</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJSADetails.hazards.map((h, i) => (
                                                <span key={i} className={`text-xs px-2 py-1 rounded ${
                                                    h.riskLevel === 'Critical' ? 'bg-red-200 text-red-800' :
                                                    h.riskLevel === 'High' ? 'bg-orange-200 text-orange-800' :
                                                    h.riskLevel === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                                    'bg-slate-200 text-slate-800'
                                                }`}>
                                                    {h.description} ({h.riskLevel})
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Required PPE</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJSADetails.requiredPPE.map((ppe, i) => (
                                                <span key={i} className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-800">
                                                    {ppe.equipment}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {step === 2 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={formLabelStyle}>Permit Type</label>
                            <select value={type} onChange={e => setType(e.target.value as any)} className={formInputStyle} required>
                                {PERMIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={formLabelStyle}>Executing Vendor</label>
                            <select value={vendor} onChange={e => setVendor(e.target.value)} className={formInputStyle} required>
                                <option value="">Select Vendor</option>
                                <option value="Internal Team">Internal Team</option>
                                {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={formLabelStyle}>Work Location</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={formInputStyle} required placeholder="e.g., Terrace, Tower A" />
                    </div>

                    <div>
                        <label className={formLabelStyle}>Work Description</label>
                        <textarea value={workDescription} onChange={e => setWorkDescription(e.target.value)} rows={3} className={formInputStyle} required placeholder="Describe the work to be performed..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={formLabelStyle}>Start Date & Time</label>
                            <div className="flex gap-2">
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={formInputStyle} required />
                                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={formInputStyle} required />
                            </div>
                        </div>
                        <div>
                            <label className={formLabelStyle}>End Date & Time</label>
                            <div className="flex gap-2">
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={formInputStyle} required />
                                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={formInputStyle} required />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={formLabelStyle}>Contractor Name</label>
                            <input type="text" value={contractorName} onChange={e => setContractorName(e.target.value)} className={formInputStyle} placeholder="Name of contractor" />
                        </div>
                        <div>
                            <label className={formLabelStyle}>Contractor Contact</label>
                            <input type="tel" value={contractorPhone} onChange={e => setContractorPhone(e.target.value)} className={formInputStyle} placeholder="Phone number" />
                        </div>
                    </div>

                    <div>
                        <label className={formLabelStyle}>Supervisor Name</label>
                        <input type="text" value={supervisorName} onChange={e => setSupervisorName(e.target.value)} className={formInputStyle} placeholder="Onsite supervisor name" />
                    </div>
                </>
            )}

            {step === 3 && (
                <>
                    <div>
                        <label className={formLabelStyle}>Permit Issuer Name</label>
                        <input type="text" value={issuer} onChange={e => setIssuer(e.target.value)} className={formInputStyle} placeholder="Safety officer / Authority" />
                    </div>

                    <div>
                        <label className={formLabelStyle}>Equipment to be Used</label>
                        <input type="text" value={equipmentUsed} onChange={e => setEquipmentUsed(e.target.value)} className={formInputStyle} placeholder="Cranes, welding machine, etc." />
                    </div>

                    <div>
                        <label className={formLabelStyle}>Safety Precautions</label>
                        <textarea value={safetyPrecautions} onChange={e => setSafetyPrecautions(e.target.value)} rows={2} className={formInputStyle} placeholder="List safety measures to be followed..." />
                    </div>

                    <div>
                        <label className={formLabelStyle + "mb-3"}>Personal Protective Equipment (PPE) Required</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PPE_OPTIONS.map(ppe => (
                                <label key={ppe} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedPPE.includes(ppe)}
                                        onChange={() => handlePPEToggle(ppe)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-700">{ppe}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={formLabelStyle}>Gas Test Results (if applicable)</label>
                        <input type="text" value={gasTestResults} onChange={e => setGasTestResults(e.target.value)} className={formInputStyle} placeholder="e.g., O2: 20.8%, LEL: <10%" />
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={riskAssessmentDone}
                                onChange={e => setRiskAssessmentDone(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-slate-700">Risk Assessment Completed</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isolationDone}
                                onChange={e => setIsolationDone(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-slate-700">Isolation/Lockout Done</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={medicalEmergencyPlan}
                                onChange={e => setMedicalEmergencyPlan(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-slate-700">Medical Emergency Plan in Place</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={incidentOccurred}
                                onChange={e => setIncidentOccurred(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-slate-700">Any Incident Occurred</span>
                        </label>
                    </div>

                    {incidentOccurred && (
                        <div>
                            <label className={formLabelStyle}>Incident Details</label>
                            <textarea value={incidentDetails} onChange={e => setIncidentDetails(e.target.value)} rows={2} className={formInputStyle} placeholder="Describe the incident..." />
                        </div>
                    )}
                </>
            )}

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
            
            {step === 1 ? (
                <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    disabled={!isJSASelected}
                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next: Details
                </button>
            ) : step === 2 ? (
                <>
                    <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="px-4 py-2 bg-slate-400 text-white rounded-md hover:bg-slate-500"
                    >
                        Back
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setStep(3)}
                        className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary"
                    >
                        Next: Advanced
                    </button>
                </>
            ) : (
                <>
                    <button 
                        type="button" 
                        onClick={() => setStep(2)}
                        className="px-4 py-2 bg-slate-400 text-white rounded-md hover:bg-slate-500"
                    >
                        Back
                    </button>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Submit for Approval</button>
                </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
