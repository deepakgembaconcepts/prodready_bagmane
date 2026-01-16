import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';
import { getCategoriesWithSubcategories } from '../services/categoryService';
import { getAllSLALevels } from '../services/slaMatrixService';
import { getIssuesForSubcategory, getPriorityForIssue } from '../services/ticketMasterService';
import type { Ticket } from '../types';
import { Status, Priority, Category, Site, Building, Floor } from '../types';

interface HelpDeskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Partial<Ticket>) => void;
}

export function HelpDeskFormModal({ isOpen, onClose, onSubmit }: HelpDeskFormModalProps) {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    issue: '',
    issueDescription: '',
    title: '',
    description: '',
    priority: '',
    requester: '',
    requesterEmail: '',
    location: '',
  });

  const [issues, setIssues] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Location Hierarchy State
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedFloorId, setSelectedFloorId] = useState('');

  // Derived state for location dropdowns
  const buildings = useMemo(() =>
    sites.find(s => String(s.id) === selectedSiteId)?.buildings || [],
    [sites, selectedSiteId]
  );

  const floors = useMemo(() =>
    buildings.find(b => String(b.id) === selectedBuildingId)?.floors || [],
    [buildings, selectedBuildingId]
  );

  // Load sites on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/api/masters/sites', {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch sites');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setSites(data);
      })
      .catch(err => console.error('Failed to load sites:', err));
  }, []);

  // Update formData path when location selections change
  useEffect(() => {
    const site = sites.find(s => String(s.id) === selectedSiteId);
    const building = buildings.find(b => String(b.id) === selectedBuildingId);
    const floor = floors.find(f => String(f.id) === selectedFloorId);

    if (site && building && floor) {
      setFormData(prev => ({
        ...prev,
        location: `${site.name} > ${building.name} > ${floor.name}`
      }));
    } else if (site && building) {
      setFormData(prev => ({
        ...prev,
        location: `${site.name} > ${building.name}`
      }));
    } else if (site) {
      setFormData(prev => ({
        ...prev,
        location: `${site.name}`
      }));
    }
  }, [selectedSiteId, selectedBuildingId, selectedFloorId, sites, buildings, floors]);

  const categoriesData = useMemo(() => getCategoriesWithSubcategories(), []);
  const currentCategories = useMemo(() => categoriesData.map(c => c.category), [categoriesData]);
  const currentSubcategories = useMemo(
    () => categoriesData.find(c => c.category === formData.category)?.subcategories || [],
    [formData.category, categoriesData]
  );

  const slaLevels = useMemo(() => getAllSLALevels(), []);
  const l0SLA = useMemo(() => slaLevels[0], [slaLevels]);

  // Load issues when category/subcategory changes
  useEffect(() => {
    if (!formData.category || !formData.subcategory) {
      setIssues([]);
      setPriorities([]);
      return;
    }

    setLoading(true);
    getIssuesForSubcategory(formData.category, formData.subcategory)
      .then(issuesList => {
        setIssues(issuesList);
        setFormData(prev => ({ ...prev, issue: '', priority: '', issueDescription: '' }));
      })
      .catch(err => console.error('Error loading issues:', err))
      .finally(() => setLoading(false));
  }, [formData.category, formData.subcategory]);

  // Load priority when issue changes
  useEffect(() => {
    if (!formData.category || !formData.subcategory || !formData.issue) {
      setPriorities([]);
      setFormData(prev => ({ ...prev, priority: '' }));
      return;
    }

    setLoading(true);
    getPriorityForIssue(formData.category, formData.subcategory, formData.issue)
      .then(priority => {
        // Create priority dropdown options (P1, P2, P3, P4)
        const priorityOptions = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
        setPriorities(priorityOptions);
        setFormData(prev => ({ ...prev, priority }));
      })
      .catch(err => console.error('Error loading priority:', err))
      .finally(() => setLoading(false));
  }, [formData.category, formData.subcategory, formData.issue]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      category: e.target.value,
      subcategory: '',
      issue: '',
      priority: '',
    }));
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      subcategory: e.target.value,
      issue: '',
      priority: '',
    }));
  };

  const handleSubmit = () => {
    if (!formData.category || !formData.subcategory || !formData.issue || !formData.title || !formData.requester || !formData.description || !formData.priority) {
      alert('Please fill in all required fields');
      return;
    }

    const newTicket: Partial<Ticket> = {
      id: Date.now(),
      ticketId: `TKT-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      category: Category.Technical,
      subcategory: `${formData.category} > ${formData.subcategory}`,
      issue: formData.issue, // Add issue field
      priority: (formData.priority.includes('P1') ? Priority.P1 :
        formData.priority.includes('P2') ? Priority.P2 :
          formData.priority.includes('P3') ? Priority.P3 : Priority.P4),
      status: Status.Open,
      createdBy: formData.requester,
      contactEmail: formData.requesterEmail,
      technicianName: 'L0 Technician',
      building: formData.location,
      createdAt: new Date(),
      assignedLevel: 'L0',
      runningTAT: '30m',
      requester: formData.requester,
      requesterEmail: formData.requesterEmail,
      assignedTo: 'L0 Technician',
      location: formData.location,
      escalationLevel: 0,
      responseTimeTarget: l0SLA.responseTimeMins,
      resolutionTimeTarget: l0SLA.resolutionTimeMins,
      ticketType: 'Reactive', // From flowchart
      issueType: 'Service Request', // From flowchart
    };

    onSubmit(newTicket);
    setFormData({
      category: '',
      subcategory: '',
      issue: '',
      issueDescription: '',
      title: '',
      description: '',
      priority: '',
      requester: '',
      requesterEmail: '',
      location: '',
    });
    setIssues([]);
    setPriorities([]);
    onClose();
  };

  const isFormValid = formData.category && formData.subcategory && formData.issue && formData.title && formData.requester && formData.description && formData.priority;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Create New Ticket</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 w-8 h-8 rounded flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Name & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="requester"
                  value={formData.requester}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="requesterEmail"
                  value={formData.requesterEmail}
                  onChange={handleInputChange}
                  placeholder="john.dome@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category, Subcategory, Issue */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {currentCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleSubcategoryChange}
                  disabled={!formData.category}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Subcategory</option>
                  {currentSubcategories.map(subcat => (
                    <option key={subcat} value={subcat}>
                      {subcat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue <span className="text-red-500">*</span>
                </label>
                <select
                  name="issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  disabled={!formData.subcategory || loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{loading ? 'Loading...' : 'Select Issue'}</option>
                  {issues.map(issue => (
                    <option key={issue} value={issue}>
                      {issue}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Description
              </label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleInputChange}
                placeholder="Provide details about the issue"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Priority - Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={!formData.issue || priorities.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Priority</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief title of the ticket"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the issue"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Location (Cascading Dropdowns) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Site Select */}
                <select
                  value={selectedSiteId}
                  onChange={(e) => {
                    setSelectedSiteId(e.target.value);
                    setSelectedBuildingId('');
                    setSelectedFloorId('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Campus</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>

                {/* Building Select */}
                <select
                  value={selectedBuildingId}
                  onChange={(e) => {
                    setSelectedBuildingId(e.target.value);
                    setSelectedFloorId('');
                  }}
                  disabled={!selectedSiteId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Building</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                {/* Floor Select */}
                <select
                  value={selectedFloorId}
                  onChange={(e) => setSelectedFloorId(e.target.value)}
                  disabled={!selectedBuildingId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Floor</option>
                  {floors.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              {/* Hidden input to ensure validation works if logic relies on formData.location */}
              <input type="hidden" name="location" value={formData.location} />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                Create Ticket
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
