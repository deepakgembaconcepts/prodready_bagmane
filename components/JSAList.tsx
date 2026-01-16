import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { JSAFormModal } from './JSAFormModal';

// JSA interface (exported from JSAFormModal)
export interface JSA {
  id: string;
  jsaId: string;
  workType: string;
  location: string;
  department: string;
  preparedBy: string;
  preparedDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  hazards: Array<{
    id: string;
    description: string;
    severity: number;
    likelihood: number;
    riskScore: number;
  }>;
  safeProcedures: Array<{
    id: string;
    procedureName: string;
    steps: string[];
    hazardsInvolved: string[];
  }>;
  ppe: Array<{
    id: string;
    item: string;
    reason: string;
    specification: string;
  }>;
  emergencyContacts: string[];
  briefingTopics: string[];
  inspectionPoints: string[];
  status: 'Draft' | 'Submitted' | 'Approved' | 'Active' | 'Archived';
  validUntil?: Date;
  notes?: string;
}

interface JSAListProps {
  jsas?: JSA[];
  onSelectJSA?: (jsa: JSA) => void;
  onCreateJSA?: (jsa: JSA) => void;
  onUpdateJSA?: (jsa: JSA) => void;
  readOnly?: boolean;
}

const STATUS_COLORS = {
  'Draft': 'bg-slate-100 text-slate-800',
  'Submitted': 'bg-blue-100 text-blue-800',
  'Approved': 'bg-green-100 text-green-800',
  'Active': 'bg-emerald-100 text-emerald-800',
  'Archived': 'bg-gray-100 text-gray-800'
};

const SEVERITY_COLORS = {
  1: 'bg-green-100 text-green-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-red-100 text-red-800'
};

export const JSAList: React.FC<JSAListProps> = ({
  jsas = [],
  onSelectJSA,
  onCreateJSA,
  onUpdateJSA,
  readOnly = false
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedJSA, setSelectedJSA] = useState<JSA | null>(null);
  const [editingJSA, setEditingJSA] = useState<JSA | null>(null);
  const [filter, setFilter] = useState({ status: '', search: '' });

  const filteredJSAs = useMemo(() => {
    return jsas.filter(jsa => {
      const statusMatch = filter.status ? jsa.status === filter.status : true;
      const searchMatch = filter.search
        ? jsa.jsaId.toLowerCase().includes(filter.search.toLowerCase()) ||
          jsa.workType.toLowerCase().includes(filter.search.toLowerCase()) ||
          jsa.location.toLowerCase().includes(filter.search.toLowerCase()) ||
          jsa.department.toLowerCase().includes(filter.search.toLowerCase())
        : true;
      return statusMatch && searchMatch;
    });
  }, [jsas, filter]);

  const handleSelectJSA = (jsa: JSA) => {
    setSelectedJSA(jsa);
    onSelectJSA?.(jsa);
  };

  const handleCreateJSA = (newJSA: JSA) => {
    onCreateJSA?.(newJSA);
    setShowCreateForm(false);
  };

  const handleUpdateJSA = (updatedJSA: JSA) => {
    onUpdateJSA?.(updatedJSA);
    setEditingJSA(null);
  };

  const riskDistribution = useMemo(() => {
    const risks = jsas.flatMap(jsa => jsa.hazards.map(h => h.riskScore));
    const high = risks.filter(r => r >= 6).length;
    const medium = risks.filter(r => r >= 3 && r < 6).length;
    const low = risks.filter(r => r < 3).length;
    return { high, medium, low };
  }, [jsas]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">JSA Management</h2>
        {!readOnly && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create New JSA'}
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">Total JSAs</p>
            <p className="text-3xl font-bold mt-2">{jsas.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">Active</p>
            <p className="text-3xl font-bold mt-2">{jsas.filter(j => j.status === 'Active').length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">High Risk Hazards</p>
            <p className="text-3xl font-bold mt-2">{riskDistribution.high}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">Pending Approval</p>
            <p className="text-3xl font-bold mt-2">{jsas.filter(j => j.status === 'Submitted').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Create JSA Form */}
      {showCreateForm && !readOnly && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Create New JSA</h3>
          </CardHeader>
          <CardContent>
            <JSAFormModal
              onSubmit={handleCreateJSA}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by ID, work type, location..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* JSA List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">
            JSAs ({filteredJSAs.length})
          </h3>
        </CardHeader>
        <CardContent>
          {filteredJSAs.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              {jsas.length === 0 ? 'No JSAs created yet. Create one to get started!' : 'No JSAs match your filters.'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredJSAs.map((jsa) => (
                <div
                  key={jsa.id}
                  onClick={() => handleSelectJSA(jsa)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedJSA?.id === jsa.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* JSA Info */}
                    <div>
                      <p className="font-semibold text-slate-800">{jsa.jsaId}</p>
                      <p className="text-sm text-slate-600">{jsa.workType}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {jsa.location} • {jsa.department}
                      </p>
                    </div>

                    {/* Hazard Summary */}
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Hazards</p>
                      <div className="flex gap-2 flex-wrap">
                        {jsa.hazards.length > 0 ? (
                          <>
                            <Badge className={SEVERITY_COLORS[Math.max(...jsa.hazards.map(h => h.severity)) as 1 | 2 | 3]}>
                              {jsa.hazards.length} items
                            </Badge>
                            <Badge className="bg-slate-100 text-slate-800">
                              Max Risk: {Math.max(...jsa.hazards.map(h => h.riskScore))}
                            </Badge>
                          </>
                        ) : (
                          <span className="text-xs text-slate-500">No hazards</span>
                        )}
                      </div>
                    </div>

                    {/* Status & Dates */}
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Status</p>
                      <Badge className={STATUS_COLORS[jsa.status]}>
                        {jsa.status}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-2">
                        Created: {new Date(jsa.preparedDate).toLocaleDateString()}
                      </p>
                      {jsa.approvedDate && (
                        <p className="text-xs text-green-600">
                          Approved: {new Date(jsa.approvedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {!readOnly && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingJSA(jsa);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            Edit
                          </button>
                          {jsa.status !== 'Archived' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateJSA({ ...jsa, status: 'Archived' });
                              }}
                              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                            >
                              Archive
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectJSA(jsa);
                        }}
                        className="px-3 py-1 bg-slate-200 text-slate-800 text-sm rounded hover:bg-slate-300 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected JSA Details */}
      {selectedJSA && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">JSA Details</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">JSA ID</p>
                <p className="font-semibold text-slate-800">{selectedJSA.jsaId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Work Type</p>
                <p className="font-semibold text-slate-800">{selectedJSA.workType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Location</p>
                <p className="font-semibold text-slate-800">{selectedJSA.location}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Department</p>
                <p className="font-semibold text-slate-800">{selectedJSA.department}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Prepared By</p>
                <p className="font-semibold text-slate-800">{selectedJSA.preparedBy}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <Badge className={STATUS_COLORS[selectedJSA.status]}>
                  {selectedJSA.status}
                </Badge>
              </div>

              {/* Hazards Summary */}
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-slate-700 mb-2">Identified Hazards</p>
                {selectedJSA.hazards.length > 0 ? (
                  <div className="space-y-2">
                    {selectedJSA.hazards.map((hazard) => (
                      <div key={hazard.id} className="text-sm text-slate-600 flex justify-between items-center">
                        <span>{hazard.description}</span>
                        <Badge className={SEVERITY_COLORS[hazard.severity as 1 | 2 | 3]}>
                          Risk: {hazard.riskScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No hazards identified</p>
                )}
              </div>

              {/* Safe Procedures */}
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-slate-700 mb-2">Safe Procedures</p>
                {selectedJSA.safeProcedures.length > 0 ? (
                  <div className="space-y-2">
                    {selectedJSA.safeProcedures.map((proc) => (
                      <div key={proc.id} className="text-sm">
                        <p className="font-medium text-slate-700">{proc.procedureName}</p>
                        <p className="text-slate-600">{proc.steps.length} steps</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No procedures defined</p>
                )}
              </div>

              {/* PPE Requirements */}
              <div className="md:col-span-2">
                <p className="text-sm font-semibold text-slate-700 mb-2">PPE Requirements</p>
                {selectedJSA.ppe.length > 0 ? (
                  <div className="space-y-1">
                    {selectedJSA.ppe.map((item) => (
                      <p key={item.id} className="text-sm text-slate-600">
                        • {item.item} - {item.reason}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No PPE specified</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Form Modal */}
      {editingJSA && !readOnly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
            <CardHeader className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Edit JSA</h3>
              <button
                onClick={() => setEditingJSA(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent>
              <JSAFormModal
                initialData={editingJSA}
                onSubmit={handleUpdateJSA}
                onCancel={() => setEditingJSA(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
