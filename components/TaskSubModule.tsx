import React, { useMemo } from 'react';
import type { Task, User } from '../types';
import { TaskStatus, TaskPriority, UserRole, Category } from '../types';
import { Card, CardContent } from './ui/Card';

interface TaskSubModuleProps {
    tasks: Task[];
    onStatusChange: (taskId: number, status: TaskStatus) => void;
    onAddTask?: (task: Omit<Task, 'id' | 'taskId'>) => void;
    currentUser: User;
    category: Category;
    title: string;
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

import { DailyTaskUploader } from './DailyTaskUploader';

export const TaskSubModule: React.FC<TaskSubModuleProps> = ({ tasks, onStatusChange, onAddTask, currentUser, category, title }) => {
    const filteredTasks = useMemo(() => {
        return tasks.filter(t => t.category === category);
    }, [tasks, category]);

    const groupedTasks = useMemo((): Record<TaskStatus, Task[]> => {
        return {
            [TaskStatus.Pending]: filteredTasks.filter(t => t.status === TaskStatus.Pending),
            [TaskStatus.InProgress]: filteredTasks.filter(t => t.status === TaskStatus.InProgress),
            [TaskStatus.PendingApproval]: filteredTasks.filter(t => t.status === TaskStatus.PendingApproval),
            [TaskStatus.Completed]: filteredTasks.filter(t => t.status === TaskStatus.Completed),
        };
    }, [filteredTasks]);

    const stats = {
        total: filteredTasks.length,
        pending: groupedTasks[TaskStatus.Pending].length,
        inProgress: groupedTasks[TaskStatus.InProgress].length,
        approval: groupedTasks[TaskStatus.PendingApproval].length,
        completed: groupedTasks[TaskStatus.Completed].length
    };

    const isSupervisor = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.BUILDING_MANAGER;

    const handleStatusChange = (taskId: number, newStatus: TaskStatus) => {
        // For approval flow
        if (newStatus === TaskStatus.PendingApproval) {
            // Submit for approval
            onStatusChange(taskId, TaskStatus.PendingApproval);
        } else if (newStatus === TaskStatus.InProgress && isSupervisor) {
            // Approver pushes back to WIP
            onStatusChange(taskId, TaskStatus.InProgress);
        } else {
            onStatusChange(taskId, newStatus);
        }
    };

    return (
        <div>
                        <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                                {onAddTask && (
                                    <DailyTaskUploader onAddTask={onAddTask} fixedCategory={category} />
                                )}
                        </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                 <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                        <div className="text-sm text-slate-500">Total Tasks</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <div className="text-sm text-slate-500">Pending</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                        <div className="text-sm text-slate-500">In Progress</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">{stats.approval}</div>
                        <div className="text-sm text-slate-500">Pending Approval</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                        <div className="text-sm text-slate-500">Completed</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {(Object.entries(groupedTasks) as [string, Task[]][]).map(([status, taskList]) => (
                    <div key={status} className="space-y-4">
                        <h3 className="font-semibold text-slate-700 flex items-center justify-between">
                            {status}
                            <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                {taskList.length}
                            </span>
                        </h3>
                        <div className="space-y-3">
                            {taskList.map(task => (
                                <Card key={task.id} className="p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-sm">{task.title}</h4>
                                            <PriorityBadge priority={task.priority} />
                                        </div>
                                        <p className="text-xs text-slate-600">{task.description}</p>
                                        <div className="flex justify-between items-center text-xs text-slate-500">
                                            <span>{task.assignedTo}</span>
                                            <span>{task.dueDate.toLocaleDateString()}</span>
                                        </div>
                                        {task.status === TaskStatus.Pending && !isSupervisor && (
                                            <button
                                                onClick={() => handleStatusChange(task.id, TaskStatus.PendingApproval)}
                                                className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                            >
                                                Submit for Approval
                                            </button>
                                        )}
                                        {task.status === TaskStatus.PendingApproval && isSupervisor && (
                                            <div className="flex space-x-2 mt-2">
                                                <button
                                                    onClick={() => handleStatusChange(task.id, TaskStatus.Completed)}
                                                    className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(task.id, TaskStatus.InProgress)}
                                                    className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                >
                                                    Deny/Push Back
                                                </button>
                                            </div>
                                        )}
                                        {task.status === TaskStatus.InProgress && (
                                            <button
                                                onClick={() => handleStatusChange(task.id, TaskStatus.Completed)}
                                                className="w-full mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                            >
                                                Mark Complete
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};