import React, { useState } from 'react';
import type { Asset } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface AssetQRCodesProps {
    assets: Asset[];
}

export const AssetQRCodes: React.FC<AssetQRCodesProps> = ({ assets }) => {
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

    const handleSelectAsset = (assetId: string) => {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        );
    };

    const handleDownloadQR = () => {
        if (selectedAssets.length === 0) {
            alert('Please select assets to download QR codes');
            return;
        }
        
        // Create a canvas to generate QR codes
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas size for QR code grid
        const qrSize = 200;
        const padding = 20;
        const cols = Math.min(3, selectedAssets.length);
        const rows = Math.ceil(selectedAssets.length / cols);
        
        canvas.width = cols * (qrSize + padding) + padding;
        canvas.height = rows * (qrSize + padding) + padding;
        
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        selectedAssets.forEach((assetId, index) => {
            const asset = assets.find(a => a.id === assetId);
            if (!asset) return;
            
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * (qrSize + padding) + padding;
            const y = row * (qrSize + padding) + padding;
            
            // Draw QR code placeholder
            ctx.fillStyle = '#f1f5f9';
            ctx.fillRect(x, y, qrSize, qrSize);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, qrSize, qrSize);
            
            // Add asset info
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(asset.name, x + qrSize/2, y + qrSize + 15);
            ctx.font = '10px sans-serif';
            ctx.fillText(asset.assetId, x + qrSize/2, y + qrSize + 30);
        });
        
        // Download
        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `asset-qr-codes-${new Date().getTime()}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    };

    const handlePrintQR = () => {
        if (selectedAssets.length === 0) {
            alert('Please select assets to print QR codes');
            return;
        }
        
        // Create printable content
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const selectedAssetDetails = assets.filter(a => selectedAssets.includes(a.id));
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Asset QR Codes</title>
                <style>
                    @media print {
                        @page { size: A4; margin: 1cm; }
                        body { margin: 0; }
                    }
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    .qr-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                    }
                    .qr-item {
                        border: 2px solid #cbd5e1;
                        padding: 15px;
                        text-align: center;
                        page-break-inside: avoid;
                    }
                    .qr-placeholder {
                        width: 150px;
                        height: 150px;
                        background: #f1f5f9;
                        border: 2px dashed #cbd5e1;
                        margin: 0 auto 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        color: #64748b;
                    }
                    .asset-name {
                        font-weight: bold;
                        margin: 5px 0;
                    }
                    .asset-id {
                        font-size: 12px;
                        color: #64748b;
                    }
                </style>
            </head>
            <body>
                <h1>Asset QR Codes</h1>
                <div class="qr-grid">
                    ${selectedAssetDetails.map(asset => `
                        <div class="qr-item">
                            <div class="qr-placeholder">QR CODE</div>
                            <div class="asset-name">${asset.name}</div>
                            <div class="asset-id">${asset.assetId}</div>
                            <div class="asset-id">${asset.category} - ${asset.building}</div>
                        </div>
                    `).join('')}
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 250);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Asset QR Codes</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handleDownloadQR}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Download QR Codes
                    </button>
                    <button
                        onClick={handlePrintQR}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Print QR Codes
                    </button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Select Assets</h3>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assets.map(asset => (
                            <div key={asset.id} className="border rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedAssets.includes(asset.id)}
                                        onChange={() => handleSelectAsset(asset.id)}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{asset.name}</h4>
                                        <p className="text-sm text-slate-500">{asset.assetId}</p>
                                        <p className="text-sm text-slate-500">{asset.category} - {asset.building}</p>
                                    </div>
                                </div>
                                <div className="mt-3 bg-slate-100 p-4 rounded text-center">
                                    <div className="text-xs text-slate-500 mb-2">QR Code Preview</div>
                                    <div className="w-20 h-20 bg-white border-2 border-slate-300 mx-auto flex items-center justify-center">
                                        <span className="text-xs">QR</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};