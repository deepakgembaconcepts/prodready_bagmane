
import React, { useState, useMemo } from 'react';
import type { InventoryItem } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { StockTransfer } from './StockTransfer';

interface InventoryListProps {
    inventory: InventoryItem[];
}

const filterInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all";

export const InventoryList: React.FC<InventoryListProps> = ({ inventory }) => {
    const [activeTab, setActiveTab] = useState<'inventory' | 'transfer'>('inventory');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    const filteredInventory = useMemo(() => {
        return inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.itemId.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category === '' || item.category === category;
            return matchesSearch && matchesCategory;
        });
    }, [inventory, search, category]);

    const stats = useMemo(() => {
        const totalValue = inventory.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const lowStockItems = inventory.filter(item => item.quantity <= item.minLevel).length;
        const totalItems = inventory.length;
        return { totalValue, lowStockItems, totalItems };
    }, [inventory]);

    const uniqueCategories = Array.from(new Set(inventory.map(i => i.category)));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-blue-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Inventory Value</p>
                            <p className="text-2xl font-bold text-slate-800">₹{stats.totalValue.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                             <span className="text-2xl">💰</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-red-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
                            <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
                        </div>
                        <div className="p-2 bg-red-50 rounded-full text-red-600">
                            <span className="text-2xl">⚠️</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4 flex justify-between items-center border-l-4 border-green-500">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total SKUs</p>
                            <p className="text-2xl font-bold text-green-600">{stats.totalItems}</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-full text-green-600">
                             <span className="text-2xl">📦</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    Inventory Items
                </button>
                <button
                    onClick={() => setActiveTab('transfer')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'transfer' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                >
                    Stock Transfer
                </button>
            </div>

            {activeTab === 'inventory' && (
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Inventory Stock</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <input 
                            type="text" 
                            placeholder="Search Item Name or ID..." 
                            className={filterInputStyle}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select 
                            className={filterInputStyle}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Item ID</th>
                                    <th className="px-6 py-3">Item Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Qty / Min</th>
                                    <th className="px-6 py-3">Unit Price</th>
                                    <th className="px-6 py-3">Total Value</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Last Restocked</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInventory.map(item => {
                                    const isLowStock = item.quantity <= item.minLevel;
                                    const totalValue = item.quantity * item.unitPrice;
                                    return (
                                        <tr key={item.id} className={`bg-white border-b hover:bg-slate-50 ${isLowStock ? 'bg-red-50' : ''}`}>
                                            <td className="px-6 py-4 font-medium text-slate-900">{item.itemId}</td>
                                            <td className="px-6 py-4 font-medium">{item.name}</td>
                                            <td className="px-6 py-4 text-sm">{item.category}</td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                                                    {item.quantity} / {item.minLevel}
                                                </span>
                                                {isLowStock && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">⚠ Low</span>}
                                            </td>
                                            <td className="px-6 py-4 text-sm">₹{item.unitPrice}</td>
                                            <td className="px-6 py-4 font-semibold">₹{totalValue.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-1 rounded ${
                                                    isLowStock ? 'bg-red-100 text-red-800' :
                                                    item.quantity > item.minLevel * 2 ? 'bg-green-100 text-green-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {isLowStock ? '🔴 Low' : item.quantity > item.minLevel * 2 ? '🟢 Stock' : '🟡 Normal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{item.lastRestocked.toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                                {filteredInventory.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-6 text-slate-400">No items found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            )}

            {activeTab === 'transfer' && (
                <StockTransfer 
                    inventory={inventory} 
                    onTransfer={(transfer) => {
                        console.log('Stock transfer request:', transfer);
                    }}
                />
            )}
        </div>
    );
};
