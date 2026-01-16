
import React, { useState, useMemo } from 'react';
import type { TransitionProject } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface TransitionDashboardProps {
    projects: TransitionProject[];
    onAddSnag: (projectId: string, description: string, category: string) => void;
    onUpdateProgress: (projectId: string, newProgress: number) => void;
}

const ProgressBar: React.FC<{ progress: number, color?: string }> = ({ progress, color = 'bg-brand-primary' }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
            className={`${color} h-2.5 rounded-full transition-all duration-500`} 
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

export const TransitionDashboard: React.FC<TransitionDashboardProps> = ({ projects, onAddSnag, onUpdateProgress }) => {
    // FIX: Store the ID, not the object, to ensure we always get the latest data from props
    const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
    const [isSnagModalOpen, setIsSnagModalOpen] = useState(false);
    const [newSnagDesc, setNewSnagDesc] = useState('');
    const [newSnagCategory, setNewSnagCategory] = useState('Civil Works');
    
    // Progress Modal State
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
    const [progressValue, setProgressValue] = useState(0);

    // Derived state for the active project
    const selectedProject = useMemo(() => 
        projects.find(p => p.id === selectedProjectId) || null, 
    [projects, selectedProjectId]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'Planning': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Delayed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCreateSnag = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProject) {
            onAddSnag(selectedProject.id, newSnagDesc, newSnagCategory);
            setIsSnagModalOpen(false);
            setNewSnagDesc('');
        }
    };

    const openProgressModal = () => {
        if (selectedProject) {
            setProgressValue(selectedProject.progress);
            setIsProgressModalOpen(true);
        }
    };

    const handleUpdateProgressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProject) {
            onUpdateProgress(selectedProject.id, progressValue);
            setIsProgressModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-lg text-white mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Transition & HOTO Dashboard</h2>
                        <p className="opacity-90">Manage facility handovers, track snags, and monitor milestones.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-slate-700">Active Projects</h3>
                    {projects.map(project => (
                        <div 
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                selectedProjectId === project.id 
                                ? 'bg-white border-brand-primary ring-1 ring-brand-primary shadow-md' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">{project.id}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 mb-1">{project.name}</h4>
                            <p className="text-xs text-slate-500 mb-3">{project.type}</p>
                            
                            <div className="mb-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600">Progress</span>
                                    <span className="font-bold text-slate-800">{project.progress}%</span>
                                </div>
                                <ProgressBar progress={project.progress} color={project.status === 'Delayed' ? 'bg-red-500' : 'bg-green-500'} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Project Details */}
                <div className="lg:col-span-2">
                    {selectedProject ? (
                        <div className="space-y-6">
                            {/* Key Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase">Target Date</p>
                                            <p className="text-lg font-bold text-slate-800">{selectedProject.targetDate.toLocaleDateString()}</p>
                                        </div>
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                            <CalendarIcon />
                                        </div>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardContent className="p-4 flex items-center justify-between border-l-4 border-red-500">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase">Open Snags</p>
                                            <p className="text-lg font-bold text-red-600">{selectedProject.snagsOpen}</p>
                                        </div>
                                        <div className="p-2 bg-red-50 text-red-600 rounded-full">
                                            <ExclamationIcon />
                                        </div>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardContent className="p-4 flex items-center justify-between border-l-4 border-green-500">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase">Closed Snags</p>
                                            <p className="text-lg font-bold text-green-600">{selectedProject.snagsClosed}</p>
                                        </div>
                                        <div className="p-2 bg-green-50 text-green-600 rounded-full">
                                            <CheckCircleIcon />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase">From FM</p>
                                            <p className="text-sm font-bold text-slate-800">{selectedProject.fromFacilityManager || '—'}</p>
                                        </div>
                                        <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                                            👤
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Checklist Categories */}
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-800">Handover Checklist Status</h3>
                                        <button 
                                            onClick={() => setIsSnagModalOpen(true)}
                                            className="text-xs bg-brand-primary text-white px-4 py-1.5 rounded-full hover:bg-brand-secondary font-medium transition-colors shadow-sm flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Report Snag
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {selectedProject.categories.map((cat, idx) => {
                                            const catProgress = Math.round((cat.completed / cat.total) * 100);
                                            return (
                                                <div key={idx} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div>
                                                            <h5 className="font-medium text-slate-800">{cat.name}</h5>
                                                            <p className="text-xs text-slate-500">{cat.completed} / {cat.total} Items Verified</p>
                                                        </div>
                                                        <span className="text-sm font-bold text-brand-primary">{catProgress}%</span>
                                                    </div>
                                                    <ProgressBar progress={catProgress} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Snag List */}
                            <Card>
                                <CardHeader><h3 className="font-semibold text-slate-800">Recently Reported Snags</h3></CardHeader>
                                <CardContent>
                                    {selectedProject.snagList && selectedProject.snagList.length > 0 ? (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {selectedProject.snagList.map(snag => (
                                                <div key={snag.id} className="p-3 border border-slate-100 rounded-lg flex justify-between items-center text-sm bg-slate-50 animate-fade-in-up">
                                                    <div>
                                                        <span className="block font-semibold text-slate-700">{snag.category}</span>
                                                        <span className="text-slate-600">{snag.description}</span>
                                                    </div>
                                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded border border-red-200">Open</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 text-sm">No snags reported yet.</div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end space-x-3">
                                <button className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-sm font-medium">
                                    Download Snag List
                                </button>
                                <button 
                                    onClick={openProgressModal}
                                    className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-secondary text-sm font-medium"
                                >
                                    Update Progress
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 p-12">
                            <p className="text-slate-400">Select a project to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Snag Modal */}
            {isSnagModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Report New Snag</h3>
                            <button onClick={() => setIsSnagModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleCreateSnag}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                                <select 
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                    value={newSnagCategory}
                                    onChange={e => setNewSnagCategory(e.target.value)}
                                >
                                    {selectedProject?.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                <textarea 
                                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:outline-none" 
                                    rows={3}
                                    value={newSnagDesc}
                                    onChange={e => setNewSnagDesc(e.target.value)}
                                    required
                                    placeholder="Describe the snag (e.g. Paint peeling on 4th floor)"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsSnagModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">Submit Report</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Progress Modal */}
            {isProgressModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm m-4 p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-800">Update Project Progress</h3>
                            <button onClick={() => setIsProgressModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <form onSubmit={handleUpdateProgressSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Overall Completion (%)
                                </label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={progressValue} 
                                    onChange={e => setProgressValue(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="text-center mt-2 font-bold text-2xl text-brand-primary">
                                    {progressValue}%
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsProgressModalOpen(false)} className="px-4 py-2 bg-slate-100 rounded-lg text-slate-700 hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ExclamationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
