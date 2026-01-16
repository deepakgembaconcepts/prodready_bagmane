
import { Ticket } from '../types';

export class TicketService {
    /**
     * Get all tickets
     */
    static async getAllTickets(): Promise<Ticket[]> {
        const response = await fetch('/api/tickets');
        if (!response.ok) throw new Error('Failed to fetch tickets');
        return response.json();
    }

    /**
     * Create a new ticket
     */
    static async createTicket(ticket: Omit<Ticket, 'id' | 'ticketId' | 'createdAt' | 'runningTAT'>): Promise<Ticket> {
        const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create ticket');
        }
        return response.json();
    }

    /**
     * Update a ticket
     */
    static async updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
        // Note: The backend uses string ID in some places but Int in Prisma. 
        // The frontend types use number for ID.
        const response = await fetch(`/api/tickets/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update ticket');
        }
        return response.json();
    }
}
