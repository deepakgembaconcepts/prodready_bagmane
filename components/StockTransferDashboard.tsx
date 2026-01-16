import React, { useState, useMemo } from 'react';
import type { InventoryItem } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface StockTransferRequest {
    id: string;
    itemId: string;
    itemName: string;
    fromLocation: string;
    toLocation: string;
    quantity: number;
    requestedBy: string;
    reason: string;
    transferDate: Date;
    status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
}

interface StockTransferDashboardProps {
    inventory: InventoryItem[];
    onTransfer?: (transfer: Omit<StockTransferRequest, 'id' | 'status'>) => void;
}

const STATUS_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
const LOCATIONS = ['Central Store', 'Tower A', 'Tower B', 'Tower C', 'Basement Store', 'BTP Campus 1', 'BTP Campus 2'];

export const StockTransferDashboard: React.FC<StockTransferDashboardProps> = ({ inventory, onTransfer }) => {
    const [showTransferForm, setShowTransferForm] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [requestedBy, setRequestedBy] = useState('');
    const [reason, setReason] = useState('');
    const [transfers, setTransfers] = useState<StockTransferRequest[]>([]);

    const selectedInventoryItem = inventory.find(item => item.id === selectedItem);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedInventoryItem) {
            alert('Please select an item');
            return;
        }

        if (quantity <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        if (quantity > selectedInventoryItem.quantity) {
            alert(`Cannot transfer more than available quantity (${selectedInventoryItem.quantity})`);
            return;
        }

        if (fromLocation === toLocation) {
            alert('Source and destination locations must be different');
            return;
        }

        const newTransfer: StockTransferRequest = {
            id: `TR-${Date.now()}`,
            itemId: selectedItem,
            itemName: selectedInventoryItem.name,
            fromLocation,
            toLocation,
            quantity,
            requestedBy,
            reason,
            transferDate: new Date(),
            status: 'Pending'
        };

        setTransfers(prev => [newTransfer, ...prev]);
        onTransfer?.({
            itemId: selectedItem,
            itemName: selectedInventoryItem.name,
            fromLocation,
            toLocation,
            quantity,
            requestedBy,
            reason,
            transferDate: new Date()
        });

        // Reset form
        setSelectedItem('');
        setFromLocation('');
        setToLocation('');
        setQuantity(0);
        setRequestedBy('');
        setReason('');
        setShowTransferForm(false);
    };

    const metrics = useMemo(() => {
        const totalTransfers = transfers.length;
        const pending = transfers.filter(t => t.status === 'Pending').length;
        const inTransit = transfers.filter(t => t.status === 'In Transit').length;
        const completed = transfers.filter(t => t.status === 'Completed').length;
        const cancelled = transfers.filter(t => t.status === 'Cancelled').length;

        const totalQuantityTransferred = transfers
            .filter(t => t.status === 'Completed')
            .reduce((sum, t) => sum + t.quantity, 0);

        // Transfers by location
        const locationMap: Record<string, number> = {};
        transfers.forEach(t => {
            locationMap[t.fromLocation] = (locationMap[t.fromLocation] || 0) + t.quantity;
        });

        const transfersByLocation = Object.entries(locationMap).map(([location, quantity]) => ({
            name: location,
            quantity,
        }));

        // Status distribution
        const statusDistribution = [
            { name: 'Pending', count: pending },
            { name: 'In Transit', count: inTransit },
            { name: 'Completed', count: completed },
            { name: 'Cancelled', count: cancelled },
        ];

        return {
            totalTransfers,
            pending,
            inTransit,
            completed,
            cancelled,
            totalQuantityTransferred,
            transfersByLocation,
            statusDistribution
        };
    }, [transfers]);

    const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary";
    const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Stock Transfer Dashboard</h2>
                <button
                    onClick={() => setShowTransferForm(!showTransferForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    {showTransferForm ? 'Cancel' : 'New Transfer'}
                </button>
            </div>

            {/* Transfer Form */}
            {showTransferForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <h3 className="text-lg font-semibold text-slate-800">Create Stock Transfer Request</h3>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={formLabelStyle}>Select Item</label>
                                    <select
                                        value={selectedItem}
                                        onChange={(e) => setSelectedItem(e.target.value)}
                                        className={formInputStyle}
                                        required
                                    >
                                        <option value="">Choose an inventory item...</option>
                                        {inventory.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} (Available: {item.quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={formLabelStyle}>Quantity to Transfer</label>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                        className={formInputStyle}
                                        min="1"
                                        max={selectedInventoryItem?.quantity || 0}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={formLabelStyle}>From Location</label>
                                    <select
                                        value={fromLocation}
                                        onChange={(e) => setFromLocation(e.target.value)}
                                        className={formInputStyle}
                                        required
                                    >
                                        <option value="">Select source location...</option>
                                        {LOCATIONS.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={formLabelStyle}>To Location</label>
                                    <select
                                        value={toLocation}
                                        onChange={(e) => setToLocation(e.target.value)}
                                        className={formInputStyle}
                                        required
                                    >
                                        <option value="">Select destination location...</option>
                                        {LOCATIONS.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className={formLabelStyle}>Requested By</label>
                                    <input
                                        type="text"
                                        value={requestedBy}
                                        onChange={(e) => setRequestedBy(e.target.value)}
                                        placeholder="Your name"
                                        className={formInputStyle}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={formLabelStyle}>Reason for Transfer</label>
                                    <input
                                        type="text"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="e.g., Stock redistribution, Repair, Replacement"
                                        className={formInputStyle}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                                >
                                    Submit Transfer Request
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowTransferForm(false)}
                                    className="flex-1 px-4 py-2 bg-slate-300 text-slate-800 rounded hover:bg-slate-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Pending</p>
                        <p className="text-3xl font-bold mt-2">{metrics.pending}</p>
                        <p className="text-xs opacity-75 mt-1">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">In Transit</p>
                        <p className="text-3xl font-bold mt-2">{metrics.inTransit}</p>
                        <p className="text-xs opacity-75 mt-1">Being transferred</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Completed</p>
                        <p className="text-3xl font-bold mt-2">{metrics.completed}</p>
                        <p className="text-xs opacity-75 mt-1">Total transfers</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                    <CardContent className="p-4 flex flex-col justify-between h-full">
                        <p className="text-sm font-medium opacity-90">Total Quantity</p>
                        <p className="text-3xl font-bold mt-2">{metrics.totalQuantityTransferred}</p>
                        <p className="text-xs opacity-75 mt-1">Items transferred</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            {metrics.transfersByLocation.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-slate-800">Transfers by Source Location</h3>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.transfersByLocation}>
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="quantity" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-semibold text-slate-800">Transfer Status</h3>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={metrics.statusDistribution.filter(s => s.count > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="count"
                                    >
                                        {metrics.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent Transfers */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800">Recent Transfer Requests</h3>
                </CardHeader>
                <CardContent>
                    {transfers.length === 0 ? (
                        <p className="text-slate-500">No transfers yet. Create one to get started!</p>
                    ) : (
                        <div className="space-y-3">
                            {transfers.slice(0, 8).map((transfer) => (
                                <div key={transfer.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-slate-800">{transfer.itemName}</p>
                                            <p className="text-sm text-slate-600">{transfer.fromLocation} → {transfer.toLocation}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-800">{transfer.quantity} units</p>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-1 ${
                                                transfer.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                                                transfer.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                                                transfer.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {transfer.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{transfer.reason}</span>
                                        <span>{transfer.transferDate.toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
