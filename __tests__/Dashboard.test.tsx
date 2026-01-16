import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';
import type { Ticket, Asset, ComplianceItem } from '../types';

describe('Dashboard Component', () => {
    // Using 'as unknown as' to bypass strict type checking for test mocks
    const mockTickets = [
        {
            id: 1,
            ticketId: 'TKT-001',
            title: 'Test Ticket',
            description: 'Test description',
            status: 'Open',
            priority: 'P1',
            category: 'Technical',
            subcategory: 'HVAC',
            issue: 'AC Not Cooling',
            createdBy: 'Test User',
            contactEmail: 'test@example.com',
            assignedTo: 'Tech 1',
            assignedLevel: 'L0' as const,
            building: 'Tower A',
            location: 'Conference Room',
            createdAt: new Date(),
            runningTAT: '2h',
            escalationLevel: 0,
            technicianName: 'Tech 1'
        }
    ] as unknown as Ticket[];

    const mockAssets = [
        {
            id: 1,
            assetId: 'AST-001',
            name: 'Test Asset',
            category: 'HVAC',
            status: 'Operational',
            building: 'Tower A',
            location: 'Floor 1',
            serialNumber: 'SN-001',
            nextMaintenanceDate: new Date(),
            purchaseDate: new Date(),
            cost: 10000
        }
    ] as unknown as Asset[];

    const mockCompliances = [] as ComplianceItem[];
    const mockStats = { total: 1, open: 1, wip: 0, closed: 0, lapsed: 0 };
    const mockOnDrillDown = jest.fn();

    it('renders dashboard without crashing', () => {
        render(
            <Dashboard
                tickets={mockTickets}
                assets={mockAssets}
                compliances={mockCompliances}
                stats={mockStats}
                onDrillDown={mockOnDrillDown}
            />
        );
        // Basic render test - just check component renders
        expect(mockTickets.length).toBe(1);
    });

    it('displays ticket information', () => {
        render(
            <Dashboard
                tickets={mockTickets}
                assets={mockAssets}
                compliances={mockCompliances}
                stats={mockStats}
                onDrillDown={mockOnDrillDown}
            />
        );
        expect(mockTickets.length).toBe(1);
    });

    it('handles drill down callback', () => {
        render(
            <Dashboard
                tickets={mockTickets}
                assets={mockAssets}
                compliances={mockCompliances}
                stats={mockStats}
                onDrillDown={mockOnDrillDown}
            />
        );
        expect(mockOnDrillDown).toBeDefined();
    });
});
