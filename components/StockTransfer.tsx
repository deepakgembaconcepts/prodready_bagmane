import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import type { InventoryItem } from '../types';

interface StockTransferProps {
  inventory: InventoryItem[];
  onTransfer: (transfer: StockTransferRequest) => void;
}

export interface StockTransferRequest {
  itemId: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  requestedBy: string;
  reason: string;
  transferDate: Date;
}

const formInputStyle = "w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-primary";
const formLabelStyle = "block text-sm font-semibold text-slate-700 mb-1.5";

const LOCATIONS = ['Central Store', 'Tower A', 'Tower B', 'Tower C', 'Basement Store', 'BTP Campus 1', 'BTP Campus 2'];

export const StockTransfer: React.FC<StockTransferProps> = ({ inventory, onTransfer }) => {
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [requestedBy, setRequestedBy] = useState('');
  const [reason, setReason] = useState('');
  const [transferHistory, setTransferHistory] = useState<(StockTransferRequest & { id: string; status: string })[]>([]);

  const selectedInventoryItem = inventory.find(item => item.id === selectedItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInventoryItem) {
      alert('Please select an item');
      return;
    }

    if (!quantity || quantity < 1) {
      alert('Please enter a valid quantity (minimum 1)');
      return;
    }

    if (quantity > selectedInventoryItem.quantity) {
      alert(`Cannot transfer more than available quantity (${selectedInventoryItem.quantity})`);
      return;
    }

    if (!fromLocation || !toLocation) {
      alert('Please select both source and destination locations');
      return;
    }

    if (fromLocation === toLocation) {
      alert('Source and destination locations must be different');
      return;
    }

    const transfer: StockTransferRequest = {
      itemId: selectedInventoryItem.itemId,
      fromLocation,
      toLocation,
      quantity,
      requestedBy,
      reason,
      transferDate: new Date()
    };

    // Add to history with status
    setTransferHistory(prev => [
      {
        ...transfer,
        id: `TR-${Date.now()}`,
        status: 'Pending'
      },
      ...prev
    ]);

    onTransfer(transfer);

    // Reset form
    setSelectedItem(null);
    setFromLocation('');
    setToLocation('');
    setQuantity(0);
    setRequestedBy('');
    setReason('');
    setShowTransferForm(false);
    
    alert('Stock transfer request submitted successfully!');
  };

  const approveTransfer = (id: string) => {
    setTransferHistory(prev =>
      prev.map(t => t.id === id ? { ...t, status: 'Approved' } : t)
    );
  };

  const rejectTransfer = (id: string) => {
    setTransferHistory(prev =>
      prev.map(t => t.id === id ? { ...t, status: 'Rejected' } : t)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Stock Transfer</h2>
          <p className="text-slate-600 mt-1">Transfer inventory between locations</p>
        </div>
        <button
          onClick={() => setShowTransferForm(!showTransferForm)}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-all font-semibold"
        >
          {showTransferForm ? 'Cancel' : '+ New Transfer Request'}
        </button>
      </div>

      {/* Transfer Form */}
      {showTransferForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Create Transfer Request</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={formLabelStyle}>Select Item</label>
                <select 
                  value={selectedItem ?? ''} 
                  onChange={e => {
                    const id = Number(e.target.value);
                    setSelectedItem(id);
                    const item = inventory.find(i => i.id === id);
                    if (item) {
                      setFromLocation(item.location);
                    }
                  }} 
                  className={formInputStyle} 
                  required
                >
                  <option value="">-- Select Item --</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.itemId}) - Available: {item.quantity} {item.unit} @ {item.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>From Location</label>
                  <select 
                    value={fromLocation} 
                    onChange={e => setFromLocation(e.target.value)} 
                    className={formInputStyle} 
                    required
                    disabled={!!selectedInventoryItem}
                  >
                    <option value="">-- Select Source --</option>
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  {selectedInventoryItem && (
                    <p className="text-xs text-slate-500 mt-1">Auto-filled from item location</p>
                  )}
                </div>
                <div>
                  <label className={formLabelStyle}>To Location</label>
                  <select 
                    value={toLocation} 
                    onChange={e => setToLocation(e.target.value)} 
                    className={formInputStyle} 
                    required
                  >
                    <option value="">-- Select Destination --</option>
                    {LOCATIONS.filter(loc => loc !== fromLocation).map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={formLabelStyle}>Quantity to Transfer</label>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={e => setQuantity(Number(e.target.value))} 
                    className={formInputStyle} 
                    required 
                    min="1"
                    max={selectedInventoryItem ? selectedInventoryItem.quantity : undefined}
                    disabled={!selectedInventoryItem}
                  />
                  {selectedInventoryItem && (
                    <p className="text-xs text-slate-500 mt-1">
                      Available: {selectedInventoryItem.quantity} {selectedInventoryItem.unit}
                    </p>
                  )}
                </div>
                <div>
                  <label className={formLabelStyle}>Requested By</label>
                  <input 
                    type="text" 
                    value={requestedBy} 
                    onChange={e => setRequestedBy(e.target.value)} 
                    className={formInputStyle} 
                    required 
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div>
                <label className={formLabelStyle}>Reason for Transfer</label>
                <textarea 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  className={formInputStyle} 
                  required 
                  rows={3}
                  placeholder="Describe why this transfer is needed"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowTransferForm(false)} 
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary"
                >
                  Submit Transfer Request
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transfer History */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Transfer History</h3>
        </CardHeader>
        <CardContent>
          {transferHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No transfer requests yet</p>
              <p className="text-sm mt-2">Click "New Transfer Request" to create one</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                  <tr>
                    <th className="px-6 py-3">Transfer ID</th>
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3">From → To</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Requested By</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transferHistory.map(transfer => {
                    const item = inventory.find(i => i.id === transfer.itemId);
                    return (
                      <tr key={transfer.id} className="bg-white border-b hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-brand-primary">{transfer.id}</td>
                        <td className="px-6 py-4">
                          {item?.name || 'Unknown'}
                          <br />
                          <span className="text-xs text-slate-400">{item?.itemId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs">
                            {transfer.fromLocation} → {transfer.toLocation}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {transfer.quantity} {item?.unit}
                        </td>
                        <td className="px-6 py-4">{transfer.requestedBy}</td>
                        <td className="px-6 py-4 text-xs">
                          {transfer.transferDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transfer.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            transfer.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {transfer.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => approveTransfer(transfer.id)}
                                className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectTransfer(transfer.id)}
                                className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
