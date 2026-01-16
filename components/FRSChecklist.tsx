
import React, { useState, useMemo, useEffect } from 'react';
import { frsData as initialData } from '../data/frsData';
import type { FrsPhase, FrsModule, FrsItem } from '../data/frsData';
import { Card, CardContent } from './ui/Card';


const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div 
            className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
        ></div>
    </div>
);

const ChecklistItem: React.FC<{ item: FrsItem, onToggle: () => void }> = ({ item, onToggle }) => (
     <label className={`flex items-center space-x-3 p-2 rounded-md hover:bg-slate-50 cursor-pointer group transition-colors ${item.planned && !item.completed ? 'bg-blue-50/50 border border-blue-100' : ''}`}>
        <input 
            type="checkbox" 
            checked={item.completed} 
            onChange={onToggle}
            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"
        />
        <div className="flex-1 flex items-center justify-between">
            <span className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                {item.text}
            </span>
            {item.planned && !item.completed && (
                <span className="text-[10px] font-bold tracking-wider uppercase bg-brand-primary text-white px-2 py-0.5 rounded shadow-sm">
                    Next Up
                </span>
            )}
        </div>
    </label>
);

const ModuleCard: React.FC<{ module: FrsModule, onToggleItem: (itemId: string) => void }> = ({ module, onToggleItem }) => {
    const progress = useMemo(() => {
        const completedCount = module.items.filter(item => item.completed).length;
        return module.items.length > 0 ? (completedCount / module.items.length) * 100 : 0;
    }, [module.items]);
    
    return (
        <Card className="h-full">
            <CardContent>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h4 className="font-bold text-slate-800">{module.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{module.description}</p>
                    </div>
                     <span className="text-sm font-semibold text-brand-primary">{Math.round(progress)}%</span>
                </div>
                <ProgressBar progress={progress} />
                <div className="mt-4 space-y-2">
                    {module.items.map(item => (
                        <ChecklistItem key={item.id} item={item} onToggle={() => onToggleItem(item.id)} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const PhaseAccordion: React.FC<{ phase: FrsPhase, onToggleItem: (moduleId: string, itemId: string) => void }> = ({ phase, onToggleItem }) => {
    const [isOpen, setIsOpen] = useState(phase.id === 'phase1'); // Open first phase by default

    const progress = useMemo(() => {
        const allItems = phase.modules.flatMap(m => m.items);
        if (allItems.length === 0) return 0;
        const completedCount = allItems.filter(item => item.completed).length;
        return (completedCount / allItems.length) * 100;
    }, [phase.modules]);

    return (
        <Card className="mb-4">
            <div className="p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">{phase.title}</h3>
                    <div className="flex items-center space-x-4">
                        <span className="text-md font-semibold text-brand-primary">{Math.round(progress)}%</span>
                        <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                 <div className="mt-2">
                    <ProgressBar progress={progress} />
                 </div>
            </div>
            {isOpen && (
                 <div className="p-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
                    {phase.modules.map(module => (
                        <ModuleCard key={module.id} module={module} onToggleItem={(itemId) => onToggleItem(module.id, itemId)} />
                    ))}
                </div>
            )}
        </Card>
    )
}

export const FRSChecklist: React.FC = () => {
    const [checklistData, setChecklistData] = useState<FrsPhase[]>(() => {
         const savedData = localStorage.getItem('frsChecklistData');
         return savedData ? JSON.parse(savedData) : initialData;
    });

    useEffect(() => {
        localStorage.setItem('frsChecklistData', JSON.stringify(checklistData));
    }, [checklistData]);

    const handleToggleItem = (moduleId: string, itemId: string) => {
        setChecklistData(prevData => {
            return prevData.map(phase => ({
                ...phase,
                modules: phase.modules.map(module => {
                    if (module.id === moduleId) {
                        return {
                            ...module,
                            items: module.items.map(item => {
                                if (item.id === itemId) {
                                    return { ...item, completed: !item.completed };
                                }
                                return item;
                            }),
                        };
                    }
                    return module;
                }),
            }));
        });
    };

    const handleReset = () => {
        if(window.confirm("Are you sure you want to reset the checklist to default values? This will update the 'Next Up' items.")) {
            setChecklistData(initialData);
            localStorage.setItem('frsChecklistData', JSON.stringify(initialData));
        }
    }

    const overallProgress = useMemo(() => {
        const allItems = checklistData.flatMap(p => p.modules.flatMap(m => m.items));
        if (allItems.length === 0) return 0;
        const completedCount = allItems.filter(item => item.completed).length;
        return (completedCount / allItems.length) * 100;
    }, [checklistData]);

    const nextUpCount = useMemo(() => {
        return checklistData.flatMap(p => p.modules.flatMap(m => m.items)).filter(i => i.planned && !i.completed).length;
    }, [checklistData]);

  return (
    <div>
        <Card className="mb-6 border-l-4 border-l-brand-primary">
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-700">Project Implementation Status</h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Tracking the implementation of Bagmane FM Platform features. 
                            <span className="ml-2 font-medium text-brand-primary">{nextUpCount} features planned for next iteration.</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <span className="text-3xl font-bold text-brand-primary block">{Math.round(overallProgress)}%</span>
                            <span className="text-xs text-slate-500 uppercase font-semibold">Complete</span>
                        </div>
                        <div className="h-10 w-px bg-slate-200"></div>
                         <button 
                            onClick={handleReset} 
                            className="text-xs bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-md transition-colors flex items-center shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reset Data
                         </button>
                    </div>
                </div>
                <div className="mt-4">
                    <ProgressBar progress={overallProgress} />
                </div>
            </CardContent>
        </Card>
      
      {checklistData.map(phase => (
        <PhaseAccordion key={phase.id} phase={phase} onToggleItem={handleToggleItem} />
      ))}
    </div>
  );
};

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
