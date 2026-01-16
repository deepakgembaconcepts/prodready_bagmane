import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';

export interface JSA {
  id: string;
  jsaId: string;
  workType: string;
  workDescription: string;
  location: string;
  department: string;
  preparedBy: string;
  preparedDate: Date;
  checkedBy?: string;
  checkedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Active' | 'Archived';
  
  // Hazards and Risk Assessment
  hazards: {
    id: string;
    description: string;
    potentialInjury: string;
    severity: 'Critical' | 'Major' | 'Minor';
    likelihood: 'High' | 'Medium' | 'Low';
    riskScore: number;
  }[];

  // Control Measures (Risk Mitigation)
  controlMeasures: {
    id: string;
    hazardId: string;
    measure: string;
    responsible: string;
    type: 'Elimination' | 'Substitution' | 'Engineering' | 'Administrative' | 'PPE';
  }[];

  // Safe Work Method / Work Procedure
  workProcedure: {
    id: string;
    stepNumber: number;
    description: string;
    hazards: string[]; // references to hazard ids
  }[];

  // PPE Requirements
  ppeRequired: {
    item: string;
    reason: string;
    specification?: string;
  }[];

  // Emergency Procedures
  emergencyContacts: {
    role: string;
    name: string;
    phoneNumber: string;
  }[];

  // Toolbox Talk / Pre-Shift Briefing
  briefingRequired: boolean;
  briefingTopics?: string[];
  
  // Inspection Points
  inspectionPoints: {
    id: string;
    pointName: string;
    checklistItems: {
      id: string;
      item: string;
      required: boolean;
    }[];
  }[];

  notes?: string;
  attachments?: {
    name: string;
    url: string;
  }[];
}

interface JSAFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jsa: JSA) => void;
  initialData?: JSA;
  readOnly?: boolean;
}

export const JSAFormModal: React.FC<JSAFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  readOnly = false 
}) => {
  const [formData, setFormData] = useState<Partial<JSA>>(initialData || {
    jsaId: `JSA-${Date.now()}`,
    status: 'Draft',
    hazards: [],
    controlMeasures: [],
    workProcedure: [],
    ppeRequired: [],
    emergencyContacts: [],
    inspectionPoints: [],
  });

  const [hazardForm, setHazardForm] = useState({
    description: '',
    potentialInjury: '',
    severity: 'Medium' as const,
    likelihood: 'Medium' as const,
  });

  const [procedureForm, setProcedureForm] = useState({
    stepNumber: (formData.workProcedure?.length || 0) + 1,
    description: '',
  });

  const [ppeForm, setPpeForm] = useState({
    item: '',
    reason: '',
    specification: '',
  });

  const calculateRiskScore = (severity: string, likelihood: string): number => {
    const severityMap = { 'Critical': 3, 'Major': 2, 'Minor': 1 };
    const likelihoodMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return (severityMap[severity as keyof typeof severityMap] || 1) * 
           (likelihoodMap[likelihood as keyof typeof likelihoodMap] || 1);
  };

  const addHazard = () => {
    if (!hazardForm.description || !hazardForm.potentialInjury) return;
    
    const riskScore = calculateRiskScore(hazardForm.severity, hazardForm.likelihood);
    const newHazard = {
      id: `HAZ-${Date.now()}`,
      description: hazardForm.description,
      potentialInjury: hazardForm.potentialInjury,
      severity: hazardForm.severity as 'Critical' | 'Major' | 'Minor',
      likelihood: hazardForm.likelihood as 'High' | 'Medium' | 'Low',
      riskScore,
    };

    setFormData(prev => ({
      ...prev,
      hazards: [...(prev.hazards || []), newHazard],
    }));

    setHazardForm({
      description: '',
      potentialInjury: '',
      severity: 'Medium',
      likelihood: 'Medium',
    });
  };

  const addProcedureStep = () => {
    if (!procedureForm.description) return;
    
    const newStep = {
      id: `PROC-${Date.now()}`,
      stepNumber: procedureForm.stepNumber,
      description: procedureForm.description,
      hazards: [],
    };

    setFormData(prev => ({
      ...prev,
      workProcedure: [...(prev.workProcedure || []), newStep],
    }));

    setProcedureForm({
      stepNumber: (formData.workProcedure?.length || 0) + 2,
      description: '',
    });
  };

  const addPPE = () => {
    if (!ppeForm.item || !ppeForm.reason) return;

    const newPPE = {
      item: ppeForm.item,
      reason: ppeForm.reason,
      specification: ppeForm.specification || undefined,
    };

    setFormData(prev => ({
      ...prev,
      ppeRequired: [...(prev.ppeRequired || []), newPPE],
    }));

    setPpeForm({
      item: '',
      reason: '',
      specification: '',
    });
  };

  const handleSubmit = () => {
    if (!formData.workType || !formData.workDescription || !formData.location || !formData.preparedBy) {
      alert('Please fill in all required fields');
      return;
    }

    const jsaData: JSA = {
      id: formData.id || `JSA-${Date.now()}`,
      jsaId: formData.jsaId || `JSA-${Date.now()}`,
      workType: formData.workType,
      workDescription: formData.workDescription,
      location: formData.location,
      department: formData.department || '',
      preparedBy: formData.preparedBy,
      preparedDate: formData.preparedDate || new Date(),
      status: formData.status || 'Draft',
      hazards: formData.hazards || [],
      controlMeasures: formData.controlMeasures || [],
      workProcedure: formData.workProcedure || [],
      ppeRequired: formData.ppeRequired || [],
      emergencyContacts: formData.emergencyContacts || [],
      inspectionPoints: formData.inspectionPoints || [],
      notes: formData.notes,
      briefingRequired: true,
    };

    onSubmit(jsaData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              {initialData ? 'View/Edit JSA' : 'Create New JSA'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Header Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Work Type *
              </label>
              <input
                type="text"
                placeholder="e.g., Hot Work, Height Work, Electrical"
                value={formData.workType || ''}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                placeholder="Work location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Prepared By *
              </label>
              <input
                type="text"
                value={formData.preparedBy || ''}
                onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })}
                disabled={readOnly}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Work Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Work Description *
            </label>
            <textarea
              rows={3}
              value={formData.workDescription || ''}
              onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Hazard Identification */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Hazard Identification & Risk Assessment</h3>
            
            {!readOnly && (
              <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Describe the hazard"
                  value={hazardForm.description}
                  onChange={(e) => setHazardForm({ ...hazardForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Potential injury or loss"
                  value={hazardForm.potentialInjury}
                  onChange={(e) => setHazardForm({ ...hazardForm, potentialInjury: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={hazardForm.severity}
                    onChange={(e) => setHazardForm({ ...hazardForm, severity: e.target.value as any })}
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Minor">Minor Severity</option>
                    <option value="Major">Major Severity</option>
                    <option value="Critical">Critical Severity</option>
                  </select>
                  <select
                    value={hazardForm.likelihood}
                    onChange={(e) => setHazardForm({ ...hazardForm, likelihood: e.target.value as any })}
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Low">Low Likelihood</option>
                    <option value="Medium">Medium Likelihood</option>
                    <option value="High">High Likelihood</option>
                  </select>
                </div>
                <button
                  onClick={addHazard}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Add Hazard
                </button>
              </div>
            )}

            {/* Listed Hazards */}
            <div className="space-y-2">
              {(formData.hazards || []).map((hazard) => (
                <div key={hazard.id} className="bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-700">{hazard.description}</p>
                      <p className="text-sm text-slate-600">Injury: {hazard.potentialInjury}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={hazard.severity === 'Critical' ? 'error' : hazard.severity === 'Major' ? 'warning' : 'info'}>
                          {hazard.severity}
                        </Badge>
                        <Badge>{hazard.likelihood} Likelihood</Badge>
                        <Badge>Risk Score: {hazard.riskScore}</Badge>
                      </div>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          hazards: (prev.hazards || []).filter(h => h.id !== hazard.id),
                        }))}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Work Procedure / Method */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Safe Work Method / Procedure</h3>
            
            {!readOnly && (
              <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
                <input
                  type="number"
                  placeholder="Step number"
                  value={procedureForm.stepNumber}
                  onChange={(e) => setProcedureForm({ ...procedureForm, stepNumber: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <textarea
                  rows={2}
                  placeholder="Describe the step"
                  value={procedureForm.description}
                  onChange={(e) => setProcedureForm({ ...procedureForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <button
                  onClick={addProcedureStep}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Add Step
                </button>
              </div>
            )}

            {/* Listed Steps */}
            <div className="space-y-2">
              {(formData.workProcedure || []).sort((a, b) => a.stepNumber - b.stepNumber).map((step) => (
                <div key={step.id} className="bg-slate-50 p-3 rounded-lg">
                  <p className="font-semibold text-slate-700">Step {step.stepNumber}</p>
                  <p className="text-slate-600 mt-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PPE Requirements */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Personal Protective Equipment (PPE)</h3>
            
            {!readOnly && (
              <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="e.g., Hard Hat, Safety Gloves"
                  value={ppeForm.item}
                  onChange={(e) => setPpeForm({ ...ppeForm, item: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Reason for use"
                  value={ppeForm.reason}
                  onChange={(e) => setPpeForm({ ...ppeForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Specification (optional)"
                  value={ppeForm.specification}
                  onChange={(e) => setPpeForm({ ...ppeForm, specification: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <button
                  onClick={addPPE}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  Add PPE
                </button>
              </div>
            )}

            {/* Listed PPE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(formData.ppeRequired || []).map((ppe, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-lg">
                  <p className="font-medium text-slate-700">{ppe.item}</p>
                  <p className="text-sm text-slate-600">{ppe.reason}</p>
                  {ppe.specification && <p className="text-xs text-slate-500 mt-1">Spec: {ppe.specification}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Status */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || 'Draft'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option>Draft</option>
              <option>Submitted</option>
              <option>Approved</option>
              <option>Active</option>
              <option>Archived</option>
            </select>
          </div>
        </CardContent>

        {/* Footer Buttons */}
        <div className="border-t p-4 flex justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          {!readOnly && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
            >
              Save JSA
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};
