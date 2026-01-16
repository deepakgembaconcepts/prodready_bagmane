
import React, { useMemo } from 'react';
import type { Task, User } from '../types';
import { TaskStatus, TaskPriority, UserRole } from '../types';
import { Card, CardContent } from './ui/Card';
import { DailyTaskUploader } from './DailyTaskUploader';

interface TaskBoardProps {
    tasks: Task[];
    onStatusChange: (taskId: number, status: TaskStatus) => void;
    onAddTask: (task: Omit<Task, 'id' | 'taskId'>) => void;
    currentUser: User;
}

const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => {
    const colors = {
        [TaskPriority.High]: 'bg-red-100 text-red-800',
        [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-800',
        [TaskPriority.Low]: 'bg-blue-100 text-blue-800',
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[priority]}`}>
            {priority}
        </span>
    );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onStatusChange, onAddTask, currentUser }) => {
    const groupedTasks = useMemo(() => {
        return {
            [TaskStatus.Pending]: tasks.filter(t => t.status === TaskStatus.Pending),
            [TaskStatus.InProgress]: tasks.filter(t => t.status === TaskStatus.InProgress),
            [TaskStatus.PendingApproval]: tasks.filter(t => t.status === TaskStatus.PendingApproval),
            [TaskStatus.Completed]: tasks.filter(t => t.status === TaskStatus.Completed),
        };
    }, [tasks]);

    const stats = {
        total: tasks.length,
        pending: groupedTasks[TaskStatus.Pending].length,
        inProgress: groupedTasks[TaskStatus.InProgress].length,
        approval: groupedTasks[TaskStatus.PendingApproval].length,
        completed: groupedTasks[TaskStatus.Completed].length
    };

    const isSupervisor = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.BUILDING_MANAGER;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Daily Tasks & Log Sheet</h2>
                <DailyTaskUploader onAddTask={onAddTask} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                 <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Total Tasks</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 border-l-4 border-slate-300">
                        <p className="text-sm text-slate-500">Pending</p>
                        <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 border-l-4 border-brand-primary">
                        <p className="text-sm text-slate-500">In Progress</p>
                        <p className="text-2xl font-bold text-brand-primary">{stats.inProgress}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 border-l-4 border-orange-400">
                         <p className="text-sm text-slate-500">Pending Approval</p>
                         <p className="text-2xl font-bold text-orange-500">{stats.approval}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 border-l-4 border-green-500">
                        <p className="text-sm text-slate-500">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-250px)] overflow-hidden">
                <TaskColumn 
                    title="To Do" 
                    tasks={groupedTasks[TaskStatus.Pending]} 
                    status={TaskStatus.Pending}
                    onStatusChange={onStatusChange}
                    color="bg-slate-50 border-slate-200"
                    isSupervisor={isSupervisor}
                />
                <TaskColumn 
                    title="In Progress" 
                    tasks={groupedTasks[TaskStatus.InProgress]} 
                    status={TaskStatus.InProgress}
                    onStatusChange={onStatusChange}
                    color="bg-blue-50 border-blue-200"
                    isSupervisor={isSupervisor}
                />
                <TaskColumn 
                    title="Pending Approval" 
                    tasks={groupedTasks[TaskStatus.PendingApproval]} 
                    status={TaskStatus.PendingApproval}
                    onStatusChange={onStatusChange}
                    color="bg-orange-50 border-orange-200"
                    isSupervisor={isSupervisor}
                />
                <TaskColumn 
                    title="Done" 
                    tasks={groupedTasks[TaskStatus.Completed]} 
                    status={TaskStatus.Completed}
                    onStatusChange={onStatusChange}
                    color="bg-green-50 border-green-200"
                    isSupervisor={isSupervisor}
                />
            </div>
        </div>
    );
};

interface TaskColumnProps {
    title: string;
    tasks: Task[];
    status: TaskStatus;
    onStatusChange: (taskId: number, status: TaskStatus) => void;
    color: string;
    isSupervisor: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ title, tasks, status, onStatusChange, color, isSupervisor }) => {
    return (
        <div className={`flex flex-col h-full rounded-lg border ${color}`}>
            <div className="p-3 border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-bold text-slate-700 flex justify-between items-center text-sm">
                    {title}
                    <span className="bg-white px-2 py-0.5 rounded-full text-xs border border-gray-200 shadow-sm">
                        {tasks.length}
                    </span>
                </h3>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-2">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded">{task.taskId}</span>
                            <PriorityBadge priority={task.priority} />
                        </div>
                        <h4 className="font-semibold text-slate-800 mb-1 text-sm">{task.title}</h4>
                        <p className="text-xs text-slate-500 mb-2 truncate">{task.location}</p>
                        
                        {task.checklistItems && task.checklistItems.length > 0 && (
                            <div className="mb-2 p-1 bg-blue-50 rounded text-xs text-blue-700">
                                ✓ {task.checklistItems.length} items
                            </div>
                        )}
                        
                        {task.supervisorApproval !== undefined && (
                            <div className="mb-2 text-xs font-medium">
                                {task.supervisorApproval ? <span className="text-green-600">✓ Approved</span> : <span className="text-orange-600">⏳ Pending</span>}
                            </div>
                        )}
                        
                        <div className="flex items-center text-xs text-slate-400 mb-3">
                            <UserIcon />
                            <span className="ml-1">{task.assignedTo}</span>
                        </div>

                        <div className="pt-2 border-t border-slate-50">
                            {status === TaskStatus.Pending && (
                                <button 
                                    onClick={() => onStatusChange(task.id, TaskStatus.InProgress)}
                                    className="text-xs bg-brand-primary text-white px-3 py-1.5 rounded hover:bg-brand-secondary w-full transition-colors"
                                >
                                    Start Task
                                </button>
                            )}
                            {status === TaskStatus.InProgress && (
                                <button 
                                    onClick={() => onStatusChange(task.id, TaskStatus.PendingApproval)}
                                    className="text-xs bg-brand-accent text-white px-3 py-1.5 rounded hover:bg-brand-secondary w-full transition-colors"
                                >
                                    Submit for Approval
                                </button>
                            )}
                             {status === TaskStatus.PendingApproval && (
                                <div className="space-y-1">
                                    {isSupervisor ? (
                                        <button 
                                            onClick={() => onStatusChange(task.id, TaskStatus.Completed)}
                                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 w-full flex items-center justify-center transition-colors"
                                        >
                                            <CheckIcon /> Approve
                                        </button>
                                    ) : (
                                        <span className="text-xs text-orange-500 font-medium flex items-center justify-center w-full bg-orange-50 py-1 rounded">
                                            Awaiting Supervisor
                                        </span>
                                    )}
                                     <button 
                                            onClick={() => onStatusChange(task.id, TaskStatus.InProgress)}
                                            className="text-xs text-slate-400 hover:text-slate-600 w-full text-center mt-1"
                                        >
                                            Return to WIP
                                    </button>
                                </div>
                            )}
                            {status === TaskStatus.Completed && (
                                <span className="text-xs text-green-600 font-medium flex items-center justify-center w-full">
                                    <CheckIcon /> Completed
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);
