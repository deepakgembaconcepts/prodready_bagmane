import React, { useMemo } from 'react';
import type { InventoryItem } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface InventoryDashboardProps {
  inventory: InventoryItem[];
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ inventory }) => {
  const analytics = useMemo(() => {
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventory.reduce((sum, item) => sum + (item.unitCost * item.quantity), 0);
    
    // Find low stock items (less than reorder level if available, or quantity < 5)
    const lowStockItems = inventory.filter(item => item.quantity < 5).length;
    
    // Find out of stock items
    const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
    
    // Calculate average item value
    const avgItemValue = totalItems > 0 ? totalValue / totalItems : 0;
    
    // Group by category/location
    const byLocation: { [key: string]: number } = {};
    const byCategoryValue: { [key: string]: number } = {};
    
    inventory.forEach(item => {
      byLocation[item.location] = (byLocation[item.location] || 0) + item.quantity;
      byCategoryValue[item.category] = (byCategoryValue[item.category] || 0) + (item.unitCost * item.quantity);
    });
    
    // Most stocked location
    const mostStockedLocation = Object.entries(byLocation).sort((a, b) => b[1] - a[1])[0];
    
    // Highest value category
    const highestValueCategory = Object.entries(byCategoryValue).sort((a, b) => b[1] - a[1])[0];
    
    return {
      totalItems,
      totalQuantity,
      totalValue,
      lowStockItems,
      outOfStockItems,
      avgItemValue,
      mostStockedLocation,
      highestValueCategory,
      byLocation,
      byCategoryValue
    };
  }, [inventory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventory Analytics Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">Comprehensive inventory overview and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Total Items</p>
              <p className="text-3xl font-bold text-slate-800">{analytics.totalItems}</p>
              <p className="text-xs text-slate-500 mt-2">Unique SKUs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Total Quantity</p>
              <p className="text-3xl font-bold text-brand-primary">{analytics.totalQuantity.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">Units in stock</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Inventory Value</p>
              <p className="text-3xl font-bold text-green-600">₹{analytics.totalValue.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-2">Total value</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Low Stock Alert</p>
              <div className="flex justify-center gap-2 mt-2">
                <span className="text-2xl font-bold text-orange-600">{analytics.lowStockItems}</span>
                <span className="text-2xl font-bold text-red-600">{analytics.outOfStockItems}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Low / Out of stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Distribution by Location */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-slate-800">Stock Distribution by Location</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(analytics.byLocation) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([location, quantity]) => {
                const percentage = (quantity / analytics.totalQuantity) * 100;
                return (
                  <div key={location}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{location}</span>
                      <span className="text-sm font-semibold text-slate-800">{quantity} units</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-brand-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>

        {/* Inventory Value by Category */}
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-slate-800">Inventory Value by Category</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(analytics.byCategoryValue) as [string, number][])
              .sort((a, b) => b[1] - a[1])
              .map(([category, value]) => {
                const percentage = (value / analytics.totalValue) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-slate-700">{category}</span>
                      <span className="text-sm font-semibold text-slate-800">₹{value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-slate-800">Most Stocked Location</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">
              {analytics.mostStockedLocation?.[0] || 'N/A'}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {analytics.mostStockedLocation?.[1] || 0} units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-slate-800">Highest Value Category</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {analytics.highestValueCategory?.[0] || 'N/A'}
            </p>
            <p className="text-sm text-slate-600 mt-1">
              ₹{analytics.highestValueCategory?.[1]?.toLocaleString() || '0'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-slate-800">Average Item Value</h3>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">
              ₹{analytics.avgItemValue.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600 mt-1">Per SKU average</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Items Table */}
      {analytics.lowStockItems > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-orange-600">⚠️</span> Low Stock Items ({analytics.lowStockItems})
            </h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Item Name</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">SKU</th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">Quantity</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory
                    .filter(item => item.quantity < 5)
                    .sort((a, b) => a.quantity - b.quantity)
                    .map(item => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-800">{item.name}</td>
                        <td className="py-2 px-3 text-slate-600">{item.sku}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`font-semibold ${item.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                            {item.quantity}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{item.location}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
