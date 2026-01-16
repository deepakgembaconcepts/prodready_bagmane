
import { useState, useEffect } from 'react';
import type {
    Ticket, Asset, Site, Task, Vendor, Contract, InventoryItem,
    WorkPermit, Incident, Audit, ComplianceItem, UtilityReading,
    UtilityBill, ESGMetric, CSATResponse, NPSResponse, TransitionProject,
    Announcement, Message, Meeting, JSA
} from '../types';
import { TicketService } from '../services/ticketService';
import { AssetService } from '../services/assetService';
import { ContractService, VendorService } from '../services/contractVendorService';
import { StockTransferService } from '../services/inventoryAssetService';

// Fallback to mock data for unimplemented services to verify incremental migration
// In a real scenario, we'd import empty states or fetch from other services
import { useMockData } from './useMockData';

export const useApiData = () => {
    // We can inherit the mocked state for things we haven't built APIs for yet
    // This allows for a hybrid approach during migration
    const mockData = useMockData();

    // Override specific states with real API data
    const [tickets, setTickets] = useState<Ticket[]>([]); // Start empty, fetch on mount
    const [assets, setAssets] = useState<Asset[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Parallel fetch for implemented services
                const [fetchedTickets, fetchedAssets, fetchedContracts, fetchedVendors] = await Promise.all([
                    TicketService.getAllTickets().catch(err => {
                        console.error("Failed to fetch tickets", err);
                        return [];
                    }),
                    AssetService.getAllAssets().catch(err => {
                        console.error("Failed to fetch assets", err);
                        return [];
                    }),
                    ContractService.getAllContracts().catch(err => {
                        console.error("Failed to fetch contracts", err);
                        return [];
                    }),
                    VendorService.getAllVendors().catch(err => {
                        console.error("Failed to fetch vendors", err);
                        return [];
                    })
                ]);

                // Map contracts/vendors if needed to match frontend types exactly
                // (Assumes backend returns compatible structures)
                setTickets(fetchedTickets);
                setAssets(fetchedAssets);
                // @ts-ignore - temporary cast until types exact match verified
                setContracts(fetchedContracts);
                // @ts-ignore
                setVendors(fetchedVendors);

            } catch (err) {
                console.error("Error loading initial data", err);
                setError("Failed to load application data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Ticket Actions ---
    const addTicket = async (newTicketData: Omit<Ticket, 'id' | 'ticketId' | 'createdAt' | 'runningTAT'>) => {
        try {
            const createdTicket = await TicketService.createTicket(newTicketData);
            setTickets(prev => [createdTicket, ...prev]);
            return createdTicket;
        } catch (err) {
            console.error("Failed to create ticket", err);
            throw err;
        }
    };

    // --- Asset Actions ---
    const addAsset = async (newAssetData: Omit<Asset, 'id' | 'assetId' | 'nextMaintenanceDate'>) => {
        try {
            const createdAsset = await AssetService.createAsset(newAssetData);
            setAssets(prev => [createdAsset, ...prev]);
            return createdAsset;
        } catch (err) {
            console.error("Failed to create asset", err);
            throw err;
        }
    };

    const updateAssetVerification = async (id: number, status: string) => {
        // Implement using AssetService.updateAsset if verification supported
        // For now, mock behavior or optimistic update
        console.log("Asset verification update not yet API connected");
    };

    const updateAssetStatus = async (id: number, status: string) => {
        try {
            // @ts-ignore
            await AssetService.updateAsset(id, { status });
            setAssets(prev => prev.map(a => a.id === id ? { ...a, status: status as any } : a));
        } catch (err) {
            console.error("Failed to update asset status", err);
        }
    };

    // --- Contract & Vendor Actions ---
    const addContract = async (newContract: any) => {
        // Use ContractService.createContract
        // Note: Frontend passes different shape than backend might expect sometimes
        // For now, let's try to map it
        try {
            const created = await ContractService.createContract(
                newContract.title,
                newContract.vendorId,
                newContract.vendorName,
                newContract.type,
                newContract.startDate,
                newContract.value,
                'System'
            );
            // @ts-ignore
            setContracts(prev => [...prev, created]);
        } catch (err) {
            console.error("Failed to add contract", err);
        }
    };

    // Return hybrid state: Real API data for what we fetched, Mock data for the rest
    return {
        ...mockData, // Spread mock data first
        tickets,     // Override with real state
        addTicket,   // Override with real action
        assets,
        addAsset,
        updateAssetVerification,
        updateAssetStatus,
        contracts,
        addContract,
        vendors,
        // addVendor, // TODO: Implement addVendor in useApiData

        loading,
        error
    };
};
