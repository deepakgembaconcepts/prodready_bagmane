
import React, { useState, useRef } from 'react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  title: string;
  templateName: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose, onUpload, title, templateName }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onUpload(file);
          resetAndClose();
        }, 500);
      }
    }, 200);
  };

  const resetAndClose = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            <button onClick={resetAndClose} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 className="text-sm font-semibold text-blue-800">Use the Template</h4>
                    <p className="text-xs text-blue-600 mt-1">
                        Please ensure your data matches the format in the template to avoid errors during import.
                    </p>
                    <button className="text-xs font-bold text-blue-700 underline mt-2 hover:text-blue-900">
                        Download {templateName}
                    </button>
                </div>
            </div>

            <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-brand-primary hover:bg-slate-50'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        setFile(e.dataTransfer.files[0]);
                    }
                }}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange} 
                />
                
                {!file ? (
                    <div className="space-y-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="mx-auto h-12 w-12 text-slate-400">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500">CSV, XLS, XLSX up to 10MB</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                         <div className="mx-auto h-12 w-12 text-green-500 bg-white rounded-full flex items-center justify-center shadow-sm">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Remove
                        </button>
                    </div>
                )}
            </div>

            {isUploading && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                            className="bg-brand-primary h-2 rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
            <button 
                onClick={resetAndClose}
                disabled={isUploading}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 disabled:opacity-50"
            >
                Cancel
            </button>
            <button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:opacity-50 flex items-center"
            >
                {isUploading ? 'Processing...' : 'Upload Data'}
            </button>
        </div>
      </div>
    </div>
  );
};
