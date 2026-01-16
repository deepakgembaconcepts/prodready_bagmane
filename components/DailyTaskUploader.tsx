import React, { useRef, useState } from 'react';
import type { Task } from '../types';
import { TaskPriority, TaskStatus, Category } from '../types';
import * as XLSX from 'xlsx';

interface DailyTaskUploaderProps {
  onAddTask: (task: Omit<Task, 'id' | 'taskId'>) => void;
  fixedCategory?: Category; // If provided, apply to all imported rows
}

const inputStyle = 'hidden';
const buttonStyle = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700';
const helperStyle = 'text-xs text-slate-500 mt-1';

const normalizeHeader = (h: any): string => String(h || '').trim().toLowerCase();
const parsePriority = (val: any): TaskPriority => {
  const v = String(val || '').trim().toLowerCase();
  if (v.startsWith('h')) return TaskPriority.High;
  if (v.startsWith('l')) return TaskPriority.Low;
  return TaskPriority.Medium;
};
const parseDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  const num = Number(val);
  if (!Number.isNaN(num)) {
    // Excel serial date
    return XLSX.SSF ? XLSX.SSF.parse_date_code?.(num) ? new Date(Date.UTC(0, 0, (XLSX.SSF.parse_date_code as any)(num).d)) : new Date() : new Date();
  }
  const d = new Date(String(val));
  return isNaN(d.getTime()) ? new Date() : d;
};
const parseCategory = (val: any): Category | undefined => {
  const v = String(val || '').trim().toLowerCase();
  const map: Record<string, Category> = {
    'technical': Category.Technical,
    'soft services': Category.SoftServices,
    'softservices': Category.SoftServices,
    'civil': Category.Civil,
    'security': Category.Security,
    'horticulture': Category.Horticulture,
    'admin': Category.Admin,
  };
  return map[v];
};

export const DailyTaskUploader: React.FC<DailyTaskUploaderProps> = ({ onAddTask, fixedCategory }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleClick = () => fileInputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      rows.forEach((row) => {
        const headers = Object.keys(row).map(normalizeHeader);
        // Flexible header mapping
        const get = (name: string) => {
          const idx = headers.indexOf(name);
          if (idx === -1) return undefined;
          const key = Object.keys(row)[idx];
          return row[key];
        };
        const title = get('title') || get('task') || 'Daily Task';
        const description = get('description') || 'Checklist import';
        const assignedTo = get('assignedto') || get('technician') || 'Unassigned';
        const priority = parsePriority(get('priority'));
        const dueDate = parseDate(get('duedate'));
        const location = get('location') || 'Main Campus';
        const taskType = (get('tasktype') || 'Daily Checklist') as any;
        const category = fixedCategory || parseCategory(get('category'));

        const newTask: Omit<Task, 'id' | 'taskId'> = {
          title: String(title),
          description: String(description),
          assignedTo: String(assignedTo),
          status: TaskStatus.Pending,
          priority,
          dueDate,
          location: String(location),
          taskType,
        };
        if (category) (newTask as any).category = category;
        onAddTask(newTask);
      });
    } catch (err) {
      console.error('Task import failed:', err);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        className={inputStyle}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
      />
      <button onClick={handleClick} className={buttonStyle} disabled={importing}>
        {importing ? 'Importing…' : 'Import Offline Checklists'}
      </button>
      <span className={helperStyle}>CSV/XLSX: Title, Description, AssignedTo, Priority, DueDate, Location, TaskType, Category</span>
    </div>
  );
};

export default DailyTaskUploader;
