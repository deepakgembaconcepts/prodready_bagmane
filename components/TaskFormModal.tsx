
import React, { useState, useEffect } from 'react';
import type { Task, Ticket } from '../types';
import { TaskPriority, TaskStatus, Category } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'taskId'>) => void;
  linkedTicket?: Ticket | null;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const MOCK_TECHNICIANS = ['Rajesh Kumar', 'Sita Sharma', 'Amit Patel', 'Priya Singh', 'Vijay Verma'];
const MOCK_BUILDINGS = ['Tower A', 'Tower B', 'Tower C', 'Clubhouse', 'Admin Block'];
const TASK_TYPES = ['Daily Checklist', 'Maintenance', 'Inspection', 'Security Check', 'Cleanup'] as const;

import { CHECKLIST_TEMPLATES, getTemplatesByCategory } from '../data/checklistTemplates';



export const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSubmit, linkedTicket }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState(MOCK_TECHNICIANS[0]);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [dueDate, setDueDate] = useState('');
  const [location, setLocation] = useState(MOCK_BUILDINGS[0]);

  // Dynamic Category and Task Type
  const [category, setCategory] = useState<Category>(Category.Technical);
  const availableTemplates = Object.keys(getTemplatesByCategory(category));
  const [taskType, setTaskType] = useState<string>(availableTemplates[0] || '');

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [completedBy, setCompletedBy] = useState('');
  const [supervisorApproval, setSupervisorApproval] = useState(false);
  const [approvedBy, setApprovedBy] = useState('');
  const [toolsUsed, setToolsUsed] = useState('');
  const [defectsFound, setDefectsFound] = useState('');
  const [maintenanceRequired, setMaintenanceRequired] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [checklistItems, setChecklistItems] = useState<Array<{ id: string; item: string; completed: boolean; remarks?: string; verifiedBy?: string }>>([]);

  // Pre-fill form when a ticket is passed
  useEffect(() => {
    if (linkedTicket) {
      setTitle(`Fix: ${linkedTicket.category} Issue`);
      setDescription(`Corrective maintenance for Ticket #${linkedTicket.ticketId}.\n\nIssue: ${linkedTicket.description}`);
      setLocation(linkedTicket.building);
      setPriority(linkedTicket.priority.includes('Critical') || linkedTicket.priority.includes('High') ? TaskPriority.High : TaskPriority.Medium);
      setCategory(linkedTicket.category); // Pre-select category from ticket
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split('T')[0]);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  }, [linkedTicket, isOpen]);

  // Update available task types when category changes
  useEffect(() => {
    const templates = Object.keys(getTemplatesByCategory(category));
    if (templates.length > 0) {
      setTaskType(templates[0]);
    } else {
      setTaskType('');
    }
  }, [category]);

  // Initialize checklist when taskType changes
  useEffect(() => {
    const templates = getTemplatesByCategory(category);
    const template = templates[taskType] || [];
    setChecklistItems(
      template.map((item) => ({
        id: item.id,
        item: item.item,
        completed: false,
        remarks: '',
      }))
    );
  }, [taskType, category]);

  if (!isOpen) return null;

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const updateChecklistRemark = (id: string, remark: string) => {
    setChecklistItems(prev =>
      prev.map(item => item.id === id ? { ...item, remarks: remark } : item)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      assignedTo,
      status: TaskStatus.Pending,
      priority,
      dueDate: new Date(dueDate),
      location,
      category,
      ticketId: linkedTicket?.ticketId,
      taskType: taskType as any, // Cast to any to bypass strict literal type if needed, or update types
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      completedBy: completedBy || undefined,
      supervisorApproval,
      approvedBy: approvedBy || undefined,
      toolsUsed: toolsUsed ? toolsUsed.split(',').map(t => t.trim()) : undefined,
      defectsFound: defectsFound || undefined,
      maintenanceRequired,
      completionNotes: completionNotes || undefined,
      checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-slate-800">
              {step === 1 ? (linkedTicket ? 'Create Corrective Task' : 'Assign New Task') : 'Checklist & Details'}
            </h3>
            {linkedTicket && (
              <p className="text-sm text-slate-500 mt-1">Linking to Ticket: <span className="font-mono font-bold text-slate-700">{linkedTicket.ticketId}</span></p>
            )}
            <p className="text-xs text-slate-400 mt-2">Step {step} of 2</p>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

            {step === 1 && (
              <>
                <div>
                  <label className={formLabelStyle}>Task Title</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={formInputStyle} required placeholder="e.g., Morning Pump Reading" />
                </div>

                <div>
                  <label className={formLabelStyle}>Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={formInputStyle} required placeholder="Describe the task details..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelStyle}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value as Category)} className={formInputStyle}>
                      {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={formLabelStyle}>Task / Checklist Template</label>
                    <select value={taskType} onChange={e => setTaskType(e.target.value)} className={formInputStyle}>
                      {availableTemplates.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelStyle}>Priority</label>
                    <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className={formInputStyle} required>
                      {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    {/* Spacer or additional field */}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelStyle}>Assigned Technician</label>
                    <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={formInputStyle} required>
                      {MOCK_TECHNICIANS.map(tech => <option key={tech} value={tech}>{tech}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={formLabelStyle}>Location</label>
                    <select value={location} onChange={e => setLocation(e.target.value)} className={formInputStyle} required>
                      {MOCK_BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={formLabelStyle}>Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={formInputStyle} required />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-3">{taskType} Checklist</h4>
                  <div className="space-y-2">
                    {checklistItems.map(item => (
                      <div key={item.id} className="border-b pb-2 last:border-b-0">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleChecklistItem(item.id)}
                            className="w-5 h-5 mt-1 text-brand-primary rounded"
                          />
                          <div className="flex-1">
                            <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-700'}>{item.item}</span>
                            <input
                              type="text"
                              placeholder="Add remarks..."
                              value={item.remarks || ''}
                              onChange={e => updateChecklistRemark(item.id, e.target.value)}
                              className="w-full text-xs px-2 py-1 mt-1 border border-slate-200 rounded bg-white"
                            />
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelStyle}>Start Time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={formInputStyle} />
                  </div>
                  <div>
                    <label className={formLabelStyle}>End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={formInputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={formLabelStyle}>Completed By</label>
                    <input type="text" value={completedBy} onChange={e => setCompletedBy(e.target.value)} className={formInputStyle} placeholder="Technician name" />
                  </div>
                  <div>
                    <label className={formLabelStyle}>Tools Used</label>
                    <input type="text" value={toolsUsed} onChange={e => setToolsUsed(e.target.value)} className={formInputStyle} placeholder="e.g., Wrench, Multimeter (comma-separated)" />
                  </div>
                </div>

                <div>
                  <label className={formLabelStyle}>Defects Found</label>
                  <textarea value={defectsFound} onChange={e => setDefectsFound(e.target.value)} rows={2} className={formInputStyle} placeholder="Description of any defects found..." />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={maintenanceRequired}
                    onChange={e => setMaintenanceRequired(e.target.checked)}
                    className="w-4 h-4"
                    id="maintenance-required"
                  />
                  <label htmlFor="maintenance-required" className="text-sm font-semibold text-slate-700">Further Maintenance Required</label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={supervisorApproval}
                    onChange={e => setSupervisorApproval(e.target.checked)}
                    className="w-4 h-4"
                    id="supervisor-approval"
                  />
                  <label htmlFor="supervisor-approval" className="text-sm font-semibold text-slate-700">Supervisor Approval Required</label>
                </div>

                {supervisorApproval && (
                  <div>
                    <label className={formLabelStyle}>Approved By</label>
                    <input type="text" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} className={formInputStyle} placeholder="Supervisor name" />
                  </div>
                )}

                <div>
                  <label className={formLabelStyle}>Completion Notes</label>
                  <textarea value={completionNotes} onChange={e => setCompletionNotes(e.target.value)} rows={2} className={formInputStyle} placeholder="Additional completion remarks..." />
                </div>
              </>
            )}

          </div>
          <div className="p-4 bg-slate-50 border-t flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary"
              >
                Next: Checklist
              </button>
            ) : (
              <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Create Task</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
