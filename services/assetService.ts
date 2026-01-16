
import { Asset } from '../types';

export class AssetService {
    /**
     * Get all assets
     */
    static async getAllAssets(): Promise<Asset[]> {
        const response = await fetch('/api/assets');
        if (!response.ok) throw new Error('Failed to fetch assets');
        return response.json();
    }

    /**
     * Create a new asset
     */
    static async createAsset(asset: Omit<Asset, 'id' | 'assetId' | 'nextMaintenanceDate'>): Promise<Asset> {
        const response = await fetch('/api/assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(asset),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create asset');
        }
        return response.json();
    }

    /**
     * Update an asset
     */
    static async updateAsset(id: number, updates: Partial<Asset>): Promise<Asset> {
        const response = await fetch(`/api/assets/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update asset');
        }
        return response.json();
    }
}
