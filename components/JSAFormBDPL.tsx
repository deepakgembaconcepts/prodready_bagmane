import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import type { JSA, JSAHazard, JSAControlMeasure, JSASignature } from '../services/jsaService';

interface JSAFormBDPLProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (jsa: JSA) => void;
    initialData?: JSA;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

export const JSAFormBDPL: React.FC<JSAFormBDPLProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

    // Header Section (Step 1)
    const [jsaId, setJsaId] = useState(initialData?.jsaId || `BDPL-${Date.now()}`);
    const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
    const [jobDescription, setJobDescription] = useState(initialData?.jobDescription || '');
    const [workLocation, setWorkLocation] = useState(initialData?.workLocation || '');
    const [department, setDepartment] = useState(initialData?.department || '');
    const [emergencyContactNumber, setEmergencyContactNumber] = useState(initialData?.emergencyContactNumber || '');
    const [createdBy, setCreatedBy] = useState(initialData?.createdBy || '');
    const [validFrom, setValidFrom] = useState(initialData?.validFrom ? new Date(initialData.validFrom).toISOString().split('T')[0] : '');
    const [validUntil, setValidUntil] = useState(initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : '');

    // Hazards & Control Measures (Step 2)
    const [hazards, setHazards] = useState<JSAHazard[]>(initialData?.hazards || []);
    const [controlMeasures, setControlMeasures] = useState<JSAControlMeasure[]>(initialData?.controlMeasures || []);
    const [newHazardDesc, setNewHazardDesc] = useState('');
    const [newHazardInjury, setNewHazardInjury] = useState('');
    const [newHazardSeverity, setNewHazardSeverity] = useState<1 | 2 | 3>(1);
    const [newHazardLikelihood, setNewHazardLikelihood] = useState<1 | 2 | 3>(1);
    const [newControlMeasure, setNewControlMeasure] = useState('');
    const [newControlResponsible, setNewControlResponsible] = useState('');
    const [selectedHazardForMeasure, setSelectedHazardForMeasure] = useState<string>('');

    // PPE & Emergency Procedures (Step 3)
    const [requiredPPE, setRequiredPPE] = useState(initialData?.requiredPPE || []);
    const [ppeEquipment, setPpeEquipment] = useState('');
    const [ppeSpecification, setPpeSpecification] = useState('');
    const [ppeIsRequired, setPpeIsRequired] = useState(true);
    const [emergencyProcedures, setEmergencyProcedures] = useState(initialData?.emergencyProcedures || '');
    const [isolationProcedures, setIsolationProcedures] = useState(initialData?.isolationProcedures || '');
    const [medicalEmergencyPlan, setMedicalEmergencyPlan] = useState(initialData?.medicalEmergencyPlan || '');
    const [gasTestRequired, setGasTestRequired] = useState(initialData?.gasTestRequired || false);

    // Sign-off Section (Step 4)
    const [preparedByName, setPreparedByName] = useState(initialData?.preparedBySignature?.name || '');
    const [preparedByDesignation, setPreparedByDesignation] = useState(initialData?.preparedBySignature?.designation || '');
    const [preparedByDate, setPreparedByDate] = useState(initialData?.preparedBySignature?.date ? new Date(initialData.preparedBySignature.date).toISOString().split('T')[0] : '');
    const [checkedByName, setCheckedByName] = useState(initialData?.checkedBySignature?.name || '');
    const [checkedByDesignation, setCheckedByDesignation] = useState(initialData?.checkedBySignature?.designation || '');
    const [checkedByDate, setCheckedByDate] = useState(initialData?.checkedBySignature?.date ? new Date(initialData.checkedBySignature.date).toISOString().split('T')[0] : '');

    if (!isOpen) return null;

    const calculateRiskScore = (severity: number, likelihood: number) => severity * likelihood;

    const addHazard = () => {
        if (newHazardDesc.trim()) {
            const newHazard: JSAHazard = {
                id: `haz-${Date.now()}`,
                description: newHazardDesc,
                potentialInjury: newHazardInjury,
                severity: newHazardSeverity,
                likelihood: newHazardLikelihood,
                riskScore: calculateRiskScore(newHazardSeverity, newHazardLikelihood)
            };
            setHazards([...hazards, newHazard]);
            setNewHazardDesc('');
            setNewHazardInjury('');
            setNewHazardSeverity(1);
            setNewHazardLikelihood(1);
        }
    };

    const addControlMeasure = () => {
        if (newControlMeasure.trim() && selectedHazardForMeasure) {
            const measure: JSAControlMeasure = {
                id: `cm-${Date.now()}`,
                hazardId: selectedHazardForMeasure,
                measure: newControlMeasure,
                responsible: newControlResponsible
            };
            setControlMeasures([...controlMeasures, measure]);
            setNewControlMeasure('');
            setNewControlResponsible('');
            setSelectedHazardForMeasure('');
        }
    };

    const addPPE = () => {
        if (ppeEquipment.trim()) {
            setRequiredPPE([...requiredPPE, { equipment: ppeEquipment, specification: ppeSpecification, isRequired: ppeIsRequired }]);
            setPpeEquipment('');
            setPpeSpecification('');
            setPpeIsRequired(true);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!jobTitle.trim() || !workLocation.trim() || hazards.length === 0) {
            alert('Please fill in all required fields: Job Title, Location, and at least one hazard');
            return;
        }

        const jsa: JSA = {
            id: initialData?.id || `jsa-${Date.now()}`,
            jsaId,
            jobTitle,
            jobDescription,
            workLocation,
            department,
            emergencyContactNumber,
            createdBy: createdBy || 'Unknown',
            createdDate: initialData?.createdDate || new Date(),
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            hazards,
            controlMeasures,
            requiredPPE,
            emergencyProcedures,
            isolationProcedures,
            medicalEmergencyPlan,
            gasTestRequired,
            preparedBySignature: preparedByName ? {
                name: preparedByName,
                designation: preparedByDesignation,
                date: new Date(preparedByDate)
            } : undefined,
            checkedBySignature: checkedByName ? {
                name: checkedByName,
                designation: checkedByDesignation,
                date: new Date(checkedByDate)
            } : undefined,
            status: initialData?.status || 'Draft',
            revisionNumber: initialData?.revisionNumber || 1,
            isActive: false,
            linkedPermits: initialData?.linkedPermits || []
        };

        onSubmit(jsa);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 my-8">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="p-6 border-b bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">BDPL Job Safety Analysis Form</h2>
                                <p className="text-sm text-slate-600 mt-1">BDPL OCP 03 F-08</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-700">Step {step} of 4</p>
                                <div className="flex gap-1 mt-2">
                                    {[1, 2, 3, 4].map(s => (
                                        <div key={s} className={`h-1 w-12 rounded ${s <= step ? 'bg-brand-primary' : 'bg-slate-300'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {/* Step 1: Header Information */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 1: Header Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={formLabelStyle}>JSA Document ID</label>
                                        <input type="text" value={jsaId} onChange={e => setJsaId(e.target.value)} className={formInputStyle} placeholder="BDPL-OCP-03-F08-001" required />
                                    </div>
                                    <div>
                                        <label className={formLabelStyle}>Job Title *</label>
                                        <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className={formInputStyle} placeholder="e.g., Hot Work - Welding" required />
                                    </div>
                                </div>

                                <div>
                                    <label className={formLabelStyle}>Job Description</label>
                                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={2} className={formInputStyle} placeholder="Detailed description of the work..." />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={formLabelStyle}>Work Location *</label>
                                        <input type="text" value={workLocation} onChange={e => setWorkLocation(e.target.value)} className={formInputStyle} placeholder="e.g., Building A - Ground Floor" required />
                                    </div>
                                    <div>
                                        <label className={formLabelStyle}>Department/Area</label>
                                        <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className={formInputStyle} placeholder="e.g., Civil Works" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={formLabelStyle}>JSA Prepared by</label>
                                        <input type="text" value={createdBy} onChange={e => setCreatedBy(e.target.value)} className={formInputStyle} placeholder="Name" />
                                    </div>
                                    <div>
                                        <label className={formLabelStyle}>Emergency Contact</label>
                                        <input type="tel" value={emergencyContactNumber} onChange={e => setEmergencyContactNumber(e.target.value)} className={formInputStyle} placeholder="+91-" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={formLabelStyle}>Valid From</label>
                                        <input type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} className={formInputStyle} />
                                    </div>
                                    <div>
                                        <label className={formLabelStyle}>Valid Until</label>
                                        <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className={formInputStyle} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Hazards & Control Measures */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 2: Hazard & Consequence | Control Measures</h3>

                                {/* Add Hazard */}
                                <Card className="bg-blue-50 border-blue-200">
                                    <CardHeader className="pb-2">
                                        <h4 className="font-semibold text-blue-900">Add Hazard & Consequence</h4>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <label className={formLabelStyle}>Hazard Description *</label>
                                            <input type="text" value={newHazardDesc} onChange={e => setNewHazardDesc(e.target.value)} className={formInputStyle} placeholder="e.g., Arc flash and thermal burns" />
                                        </div>
                                        <div>
                                            <label className={formLabelStyle}>Potential Injury/Consequence</label>
                                            <input type="text" value={newHazardInjury} onChange={e => setNewHazardInjury(e.target.value)} className={formInputStyle} placeholder="e.g., Severe burns, eye damage" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={formLabelStyle}>Severity (1-3)</label>
                                                <select value={newHazardSeverity} onChange={e => setNewHazardSeverity(Number(e.target.value) as 1|2|3)} className={formInputStyle}>
                                                    <option value="1">1 - Low</option>
                                                    <option value="2">2 - Medium</option>
                                                    <option value="3">3 - High/Critical</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={formLabelStyle}>Likelihood (1-3)</label>
                                                <select value={newHazardLikelihood} onChange={e => setNewHazardLikelihood(Number(e.target.value) as 1|2|3)} className={formInputStyle}>
                                                    <option value="1">1 - Low</option>
                                                    <option value="2">2 - Medium</option>
                                                    <option value="3">3 - High</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button type="button" onClick={addHazard} className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                            + Add Hazard
                                        </button>
                                    </CardContent>
                                </Card>

                                {/* Hazards List */}
                                {hazards.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-slate-800">Added Hazards ({hazards.length}):</h4>
                                        {hazards.map(h => (
                                            <div key={h.id} className="p-3 border rounded-lg bg-slate-50">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-semibold text-slate-800">{h.description}</p>
                                                    <button type="button" onClick={() => setHazards(hazards.filter(x => x.id !== h.id))} className="text-red-600 text-sm">Remove</button>
                                                </div>
                                                <p className="text-sm text-slate-600">{h.potentialInjury}</p>
                                                <p className="text-xs text-slate-500 mt-1">Risk Score: {h.riskScore} (S:{h.severity} × L:{h.likelihood})</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Control Measures */}
                                {hazards.length > 0 && (
                                    <Card className="bg-green-50 border-green-200">
                                        <CardHeader className="pb-2">
                                            <h4 className="font-semibold text-green-900">Add Control Measures</h4>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <label className={formLabelStyle}>Select Hazard</label>
                                                <select value={selectedHazardForMeasure} onChange={e => setSelectedHazardForMeasure(e.target.value)} className={formInputStyle} required>
                                                    <option value="">-- Choose hazard --</option>
                                                    {hazards.map(h => (
                                                        <option key={h.id} value={h.id}>{h.description}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={formLabelStyle}>Control Measure</label>
                                                <textarea value={newControlMeasure} onChange={e => setNewControlMeasure(e.target.value)} rows={2} className={formInputStyle} placeholder="Describe the control measure..." />
                                            </div>
                                            <div>
                                                <label className={formLabelStyle}>Responsible Person/Team</label>
                                                <input type="text" value={newControlResponsible} onChange={e => setNewControlResponsible(e.target.value)} className={formInputStyle} placeholder="e.g., Safety Officer, Welder" />
                                            </div>
                                            <button type="button" onClick={addControlMeasure} className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                                                + Add Control Measure
                                            </button>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Control Measures List */}
                                {controlMeasures.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-slate-800">Control Measures ({controlMeasures.length}):</h4>
                                        {controlMeasures.map(m => {
                                            const hazard = hazards.find(h => h.id === m.hazardId);
                                            return (
                                                <div key={m.id} className="p-3 border rounded-lg bg-slate-50">
                                                    <p className="text-xs text-slate-500 mb-1">For: {hazard?.description}</p>
                                                    <p className="text-sm text-slate-700">{m.measure}</p>
                                                    <p className="text-xs text-slate-600 mt-1">Responsible: {m.responsible}</p>
                                                    <button type="button" onClick={() => setControlMeasures(controlMeasures.filter(x => x.id !== m.id))} className="text-red-600 text-xs mt-2">Remove</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: PPE & Emergency Procedures */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 3: PPE & Emergency Procedures</h3>

                                {/* Add PPE */}
                                <Card className="bg-purple-50 border-purple-200">
                                    <CardHeader className="pb-2">
                                        <h4 className="font-semibold text-purple-900">Add Required PPE</h4>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className={formLabelStyle}>PPE Equipment</label>
                                                <input type="text" value={ppeEquipment} onChange={e => setPpeEquipment(e.target.value)} className={formInputStyle} placeholder="e.g., Safety Helmet" />
                                            </div>
                                            <div>
                                                <label className={formLabelStyle}>Specification</label>
                                                <input type="text" value={ppeSpecification} onChange={e => setPpeSpecification(e.target.value)} className={formInputStyle} placeholder="e.g., Type-I with chin strap" />
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={ppeIsRequired} onChange={e => setPpeIsRequired(e.target.checked)} className="w-4 h-4" />
                                            <span className="text-sm font-medium text-slate-700">Mandatory PPE</span>
                                        </label>
                                        <button type="button" onClick={addPPE} className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                                            + Add PPE
                                        </button>
                                    </CardContent>
                                </Card>

                                {/* PPE List */}
                                {requiredPPE.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-slate-800">Required PPE ({requiredPPE.length}):</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {requiredPPE.map((ppe, i) => (
                                                <div key={i} className={`px-3 py-2 rounded-lg border flex items-center gap-2 ${ppe.isRequired ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-300'}`}>
                                                    <span className="text-sm">{ppe.equipment} {ppe.specification && `(${ppe.specification})`}</span>
                                                    <button type="button" onClick={() => setRequiredPPE(requiredPPE.filter((_, x) => x !== i))} className="text-red-600 text-sm">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Emergency Procedures */}
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-slate-800 mb-3">Emergency & Special Procedures</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className={formLabelStyle}>Emergency Procedures</label>
                                            <textarea value={emergencyProcedures} onChange={e => setEmergencyProcedures(e.target.value)} rows={3} className={formInputStyle} placeholder="What to do in case of emergency..." />
                                        </div>
                                        <div>
                                            <label className={formLabelStyle}>Isolation/Lockout Procedures</label>
                                            <textarea value={isolationProcedures} onChange={e => setIsolationProcedures(e.target.value)} rows={2} className={formInputStyle} placeholder="Energy isolation steps..." />
                                        </div>
                                        <div>
                                            <label className={formLabelStyle}>Medical Emergency Plan</label>
                                            <textarea value={medicalEmergencyPlan} onChange={e => setMedicalEmergencyPlan(e.target.value)} rows={2} className={formInputStyle} placeholder="Medical response plan..." />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={gasTestRequired} onChange={e => setGasTestRequired(e.target.checked)} className="w-4 h-4" />
                                            <span className="text-sm font-medium text-slate-700">Gas Testing Required</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Sign-off */}
                        {step === 4 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Step 4: Sign-off (BDPL Format)</h3>

                                {/* Prepared By */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h4 className="font-semibold text-slate-800">Prepared by (JSA Preparer)</h4>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className={formLabelStyle}>Name</label>
                                            <input type="text" value={preparedByName} onChange={e => setPreparedByName(e.target.value)} className={formInputStyle} placeholder="Name" />
                                        </div>
                                        <div>
                                            <label className={formLabelStyle}>Designation</label>
                                            <input type="text" value={preparedByDesignation} onChange={e => setPreparedByDesignation(e.target.value)} className={formInputStyle} placeholder="Designation" />
                                        </div>
                                        <div>
                                            <label className={formLabelStyle}>Date</label>
                                            <input type="date" value={preparedByDate} onChange={e => setPreparedByDate(e.target.value)} className={formInputStyle} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Checked By */}
                                <Card>
                                    <CardHeader className="pb-2">
                                        <h4 className="font-semibold text-slate-800">Checked by (HSE Manager/Reviewer)</h4>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className={formLabelStyle}>Name</label>
                                            <input type="text" value={checkedByName} onChange={e => setCheckedByName(e.target.value)} className={formInputStyle} placeholder="Name" />
                                        </div>
                                        <div>
                                            <label className={formLabelStyle}>Designation</label>
                                            <input type="text" value={checkedByDesignation} onChange={e => setCheckedByDesignation(e.target.value)} className={formInputStyle} placeholder="Designation" />
                                        </div>
                                        <div>
                                            <label className={formLabelStyle}>Date</label>
                                            <input type="date" value={checkedByDate} onChange={e => setCheckedByDate(e.target.value)} className={formInputStyle} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                                    Note: The contents of the JSA is explored & understood by persons & the users acknowledge the same (Permit Receiver)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-slate-50 border-t flex justify-between gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 font-medium">
                            Cancel
                        </button>
                        <div className="flex gap-2">
                            {step > 1 && (
                                <button type="button" onClick={() => setStep((step - 1) as any)} className="px-4 py-2 bg-slate-400 text-white rounded-lg hover:bg-slate-500 font-medium">
                                    ← Back
                                </button>
                            )}
                            {step < 4 && (
                                <button type="button" onClick={() => setStep((step + 1) as any)} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-medium">
                                    Next →
                                </button>
                            )}
                            {step === 4 && (
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                                    ✓ Submit JSA for Approval
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
