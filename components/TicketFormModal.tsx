
import React, { useState, useEffect } from 'react';
import type { Ticket } from '../types';
import { Category, Priority, Status } from '../types';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: Omit<Ticket, 'id' | 'ticketId' | 'createdAt' | 'runningTAT'>) => void;
}

const MOCK_SUBCATEGORIES: { [key in Category]?: string[] } = {
  [Category.Technical]: ['HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Asset Management'],
  [Category.SoftServices]: ['Housekeeping', 'Pest Control', 'Waste Management'],
  [Category.Civil]: ['Masonry', 'Carpentry', 'Painting'],
  [Category.Security]: ['Access Control', 'CCTV', 'Patrolling'],
  [Category.Admin]: ['Stationery', 'Meeting Room', 'Vendor Mgmt'],
};

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

export const TicketFormModal: React.FC<TicketFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [category, setCategory] = useState<Category>(Category.Technical);
  const [subcategory, setSubcategory] = useState<string>('HVAC');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('Tower A');
  const [createdBy, setCreatedBy] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [fileNames, setFileNames] = useState('No file chosen');

  // Escalation API state
  const [escalationCategories, setEscalationCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [issues, setIssues] = useState<string[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [escalationRule, setEscalationRule] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load categories on mount
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:3001/api/escalation/categories')
      .then(res => res.json())
      .then(cats => {
        setEscalationCategories(cats);
        if (cats.length > 0) {
          setSelectedCategory(cats[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
        setLoading(false);
      });
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (!selectedCategory) return;

    setLoading(true);
    fetch(`http://localhost:3001/api/escalation/subcategories/${encodeURIComponent(selectedCategory)}`)
      .then(res => res.json())
      .then(subs => {
        setSubCategories(subs);
        if (subs.length > 0) {
          setSelectedSubCategory(subs[0]);
        } else {
          setSelectedSubCategory('');
          setIssues([]);
          setSelectedIssue('');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load subcategories:', err);
        setLoading(false);
      });
  }, [selectedCategory]);

  // Load issues when subcategory changes
  useEffect(() => {
    if (!selectedCategory || !selectedSubCategory) return;

    setLoading(true);
    fetch(`http://localhost:3001/api/escalation/issues/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedSubCategory)}`)
      .then(res => res.json())
      .then(issuesList => {
        setIssues(issuesList);
        if (issuesList.length > 0) {
          setSelectedIssue(issuesList[0]);
        } else {
          setSelectedIssue('');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load issues:', err);
        setLoading(false);
      });
  }, [selectedCategory, selectedSubCategory]);

  // Load escalation rule when issue changes
  useEffect(() => {
    if (!selectedCategory || !selectedSubCategory || !selectedIssue) {
      setEscalationRule(null);
      return;
    }

    fetch(`http://localhost:3001/api/escalation/rule/${encodeURIComponent(selectedCategory)}/${encodeURIComponent(selectedSubCategory)}/${encodeURIComponent(selectedIssue)}`)
      .then(res => res.json())
      .then(rule => setEscalationRule(rule))
      .catch(err => console.error('Failed to load rule:', err));
  }, [selectedCategory, selectedSubCategory, selectedIssue]);

  if (!isOpen) return null;

  // Load categories and subcategories from API
  useEffect(() => {
    const fetchHelpdeskData = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:3001/api/masters/helpdesk/categories');
        if (response.ok) {
          const data = await response.json();
          // data structure: [{ name: 'Category', subcategories: ['Sub1', 'Sub2']}]
          if (data && Array.isArray(data)) {
            const loadedParams: { [key: string]: string[] } = {};
            data.forEach((item: any) => {
              loadedParams[item.name] = item.subcategories;
            });

            // Transform to match local state needs or keep raw
            // For now, simpler to just map to categories
            const cats = Object.keys(loadedParams);
            // Update state if needed, but existing code uses escalation API.
            // Wait, the requirement is to use the NEW master data endpoint for the dropdowns.
            // The existing code was checking `api/escalation/categories`.
            // I should replace MOCK_SUBCATEGORIES usage with this new data.
          }
        }
      } catch (error) {
        console.error("Failed to fetch helpdesk master data", error);
      } finally {
        setLoading(false);
      }
    };
    // fetchHelpdeskData(); // Uncomment if we want to replace the escalation rules source, 
    // BUT current TicketFormModal is heavily tied to escalation API which might differ from the simple csv.
    // Let's stick to the plan: "Update TicketFormModal.tsx to fetch categories from /api/masters/helpdesk"

  }, []);

  // Update: Integrating the new master data for the basic Category/Subcategory dropdowns,
  // independent of the Escalation Rule section (which is complex and specific).

  const [masterCategories, setMasterCategories] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    fetch('http://localhost:3001/api/masters/helpdesk/categories')
      .then(res => res.json())
      .then(data => {
        const mapping: { [key: string]: string[] } = {};
        data.forEach((d: any) => mapping[d.name] = d.subcategories);
        setMasterCategories(mapping);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      createdBy,
      contactEmail,
      category,
      subcategory: subcategory || masterCategories[category]?.[0] || '',
      status: Status.Open,
      assignedLevel: 'L0',
      technicianName: 'Unassigned',
      priority: priority as Priority,
      description,
      building
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as Category;
    setCategory(newCategory);
    setSubcategory(masterCategories[newCategory]?.[0] || '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileNames(Array.from(e.target.files).map((f: File) => f.name).join(', '));
    } else {
      setFileNames('No file chosen');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">Create New Ticket</h3>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={formLabelStyle}>Your Name</label>
                <input type="text" value={createdBy} onChange={e => setCreatedBy(e.target.value)} className={formInputStyle} required placeholder="John Doe" />
              </div>
              <div>
                <label className={formLabelStyle}>Email</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={formInputStyle} required placeholder="john.dome@example.com" />
              </div>
            </div>

            {/* Escalation Rule Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-3">Escalation SLA Mapping</h4>
              <div className="space-y-2">
                <div>
                  <label className={formLabelStyle}>Service Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={formInputStyle}
                    disabled={loading}
                  >
                    <option value="">Select a category...</option>
                    {escalationCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className={formLabelStyle}>Sub Category</label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className={formInputStyle}
                    disabled={loading || subCategories.length === 0}
                  >
                    <option value="">Select a sub category...</option>
                    {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                  </select>
                </div>
                <div>
                  <label className={formLabelStyle}>Issue</label>
                  <select
                    value={selectedIssue}
                    onChange={(e) => setSelectedIssue(e.target.value)}
                    className={formInputStyle}
                    disabled={loading || issues.length === 0}
                  >
                    <option value="">Select an issue...</option>
                    {issues.map(issue => <option key={issue} value={issue}>{issue}</option>)}
                  </select>
                </div>
              </div>

              {escalationRule && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-800 mb-2"><strong>SLA Applied:</strong></p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded">
                      <span className="font-semibold">L0:</span> {escalationRule.l0ResponseTime}min resp / {escalationRule.l0ResolutionTime}min res
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-semibold">L1:</span> {escalationRule.l1ResponseTime}min resp / {escalationRule.l1ResolutionTime}min res
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-semibold">Suggested Priority:</span> {escalationRule.priority}
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-semibold">Type:</span> {escalationRule.ticketType}
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2 italic">* Priority can be modified below based on your assessment</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={formLabelStyle}>Category</label>
                <select value={category} onChange={handleCategoryChange} className={formInputStyle} required>
                  {Object.keys(masterCategories).length > 0 ? (
                    Object.keys(masterCategories).map(cat => <option key={cat} value={cat}>{cat}</option>)
                  ) : (
                    Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)
                  )}
                </select>
              </div>
              <div>
                <label className={formLabelStyle}>Subcategory</label>
                <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className={formInputStyle} required>
                  {masterCategories[category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={formLabelStyle}>Building</label>
                <select value={building} onChange={e => setBuilding(e.target.value)} className={formInputStyle} required>
                  <option>Tower A</option>
                  <option>Tower B</option>
                  <option>Tower C</option>
                  <option>Common Area</option>
                </select>
              </div>
              <div>
                <label className={formLabelStyle}>Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={formInputStyle} required>
                  {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={formLabelStyle}>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className={formInputStyle} required placeholder="Describe the issue..." rows={3}></textarea>
            </div>
            <div>
              <label className={formLabelStyle}>Attachments</label>
              <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-secondary" />
              <p className="text-sm text-slate-600 mt-1">{fileNames}</p>
            </div>
          </div>
          <div className="p-6 border-t flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-all font-semibold">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-all font-semibold">Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
};
