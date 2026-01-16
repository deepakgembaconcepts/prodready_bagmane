
import React, { useState, useEffect } from 'react';
import type { Site, Building } from '../types';
import { Card, CardContent } from './ui/Card';
import { BulkUploadModal } from './BulkUploadModal';
import { useMockData } from '../hooks/useMockData';

interface SiteManagementProps {
    sites: Site[]; // Keep for prop compatibility if passed from parent, or fetch internally
    onBulkUpload?: (file: File) => void;
}

export const SiteManagement: React.FC<SiteManagementProps> = ({ sites: propSites, onBulkUpload }) => {
    const { addBuildingToSite } = useMockData();
    const [sites, setSites] = useState<Site[]>(propSites || []);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSites = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/masters/sites');
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.length > 0) {
                        setSites(data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch sites from master", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSites();
    }, []);

    const handleUpload = (file: File) => {
        if (onBulkUpload) {
            onBulkUpload(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Bulk Import Sites</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Campuses</p>
                            <p className="text-2xl font-bold text-slate-800">{sites.length}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                            <MapIcon />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Buildings</p>
                            <p className="text-2xl font-bold text-slate-800">{sites.reduce((acc, s) => acc + s.buildings.length, 0)}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <BuildingIcon />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Floors</p>
                            <p className="text-2xl font-bold text-slate-800">{sites.reduce((acc, s) => acc + s.buildings.reduce((bAcc, b) => bAcc + b.floors.length, 0), 0)}</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                            <LayersIcon />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {sites.map(site => (
                <SiteCard key={site.id} site={site} onAddBuilding={(name, floors) => addBuildingToSite(site.id, name, floors)} />
            ))}

            <BulkUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onUpload={handleUpload}
                title="Bulk Import Sites & Buildings"
                templateName="Site_Master_Template.xlsx"
            />
        </div>
    );
};

const SiteCard: React.FC<{ site: Site, onAddBuilding: (name: string, floors: number) => void }> = ({ site, onAddBuilding }) => {
    const [expanded, setExpanded] = useState(true);
    const [isAddingBuilding, setIsAddingBuilding] = useState(false);
    const [newBuildingName, setNewBuildingName] = useState('');
    const [newBuildingFloors, setNewBuildingFloors] = useState(5);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddBuilding(newBuildingName, newBuildingFloors);
        setIsAddingBuilding(false);
        setNewBuildingName('');
    };

    return (
        <Card className="overflow-hidden">
            <div
                className="bg-slate-50 p-4 border-b border-slate-200 cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">
                        {site.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">{site.name}</h3>
                        <p className="text-sm text-slate-500">{site.city}, {site.region}</p>
                        {site.pmName && <p className="text-xs text-slate-400">PM: {site.pmName}</p>}
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-600 font-medium">{site.buildings.length} Buildings</span>
                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {expanded && (
                <div className="p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {site.buildings.map(building => (
                            <BuildingCard key={building.id} building={building} />
                        ))}

                        {/* Add Building Card/Form */}
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px]">
                            {!isAddingBuilding ? (
                                <button
                                    onClick={() => setIsAddingBuilding(true)}
                                    className="flex flex-col items-center text-slate-500 hover:text-brand-primary transition-colors"
                                >
                                    <span className="text-3xl mb-2">+</span>
                                    <span className="font-semibold">Add Building</span>
                                </button>
                            ) : (
                                <form onSubmit={handleAddSubmit} className="w-full space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Building Name"
                                        className="w-full text-sm border rounded p-1.5"
                                        value={newBuildingName}
                                        onChange={e => setNewBuildingName(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Floors"
                                        className="w-full text-sm border rounded p-1.5"
                                        value={newBuildingFloors}
                                        onChange={e => setNewBuildingFloors(Number(e.target.value))}
                                        min="1"
                                        required
                                    />
                                    <div className="flex space-x-2 mt-2">
                                        <button type="submit" className="flex-1 bg-brand-primary text-white text-xs py-1 rounded">Add</button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingBuilding(false)}
                                            className="flex-1 bg-slate-200 text-slate-700 text-xs py-1 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const BuildingCard: React.FC<{ building: Building }> = ({ building }) => {
    return (
        <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-slate-700">{building.name}</h4>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{building.floors.length} Floors</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">{building.address}</p>
            <div className="space-y-1">
                {building.floors.slice(0, 3).map(floor => (
                    <div key={floor.id} className="flex justify-between text-xs text-slate-600 border-b border-slate-100 py-1 last:border-0">
                        <span>{floor.name}</span>
                        <span className="text-slate-400">Level {floor.level}</span>
                    </div>
                ))}
                {building.floors.length > 3 && (
                    <div className="text-xs text-slate-400 text-center italic mt-1">
                        + {building.floors.length - 3} more floors
                    </div>
                )}
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500 text-right">
                Area: {building.totalArea.toLocaleString()} sq ft
            </div>
        </div>
    );
};

// Icons
const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
);

const BuildingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
);

const LayersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
