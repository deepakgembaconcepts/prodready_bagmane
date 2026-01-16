
import React, { useState } from 'react';
import type { Ticket, User, Announcement, Message, Meeting } from '../types';
import { Card, CardContent } from './ui/Card';
import { Status } from '../types';
import { Badge } from './ui/Badge';

interface TenantPortalProps {
    tickets: Ticket[];
    currentUser: User;
    onUpdateTicket: (ticket: Ticket) => void;
    onCreateTicket: () => void;
    announcements: Announcement[];
    messages: Message[];
    meetings: Meeting[];
}

const TicketTimelineModal: React.FC<{ ticket: Ticket | null, onClose: () => void }> = ({ ticket, onClose }) => {
    if (!ticket) return null;

    const stages = [
        { status: Status.Open, label: 'Ticket Created', date: ticket.createdAt },
        { status: Status.WIP, label: 'Assigned to Technician', date: new Date(ticket.createdAt.getTime() + 3600000) }, // Mock time
        { status: Status.Resolved, label: 'Issue Resolved', date: null },
        { status: Status.Closed, label: 'Ticket Closed', date: null },
    ];

    const currentStageIndex = stages.findIndex(s => s.status === ticket.status);
    const resolvedIndex = stages.findIndex(s => s.status === Status.Resolved);
    
    // Simple logic to show progress
    const activeIndex = ticket.status === Status.Closed ? 3 : 
                        ticket.status === Status.Resolved ? 2 :
                        ticket.status === Status.WIP ? 1 : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800">Tracking: {ticket.ticketId}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="relative">
                     {/* Vertical line container */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                    
                    <div className="space-y-8">
                        {stages.map((stage, index) => {
                            const isCompleted = index <= activeIndex;
                            const isCurrent = index === activeIndex;

                            return (
                                <div key={index} className="relative flex items-start pl-10">
                                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 bg-white ${isCompleted ? 'border-brand-primary' : 'border-slate-200'}`}>
                                        {isCompleted && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full"></div>}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{stage.label}</p>
                                        <p className="text-xs text-slate-500">
                                            {isCompleted && stage.date ? stage.date.toLocaleString() : index > activeIndex ? 'Pending' : ''}
                                        </p>
                                        {isCurrent && (
                                            <p className="text-sm text-brand-secondary mt-1">Current Status: {ticket.status}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Close</button>
                </div>
            </div>
        </div>
    );
};

export const TenantPortal: React.FC<TenantPortalProps> = ({ tickets, currentUser, onUpdateTicket, onCreateTicket, announcements, messages, meetings }) => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [activeTab, setActiveTab] = useState<'Requests' | 'Meetings'>('Requests');
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

    const myTickets = tickets.filter(t => t.createdBy === currentUser.name);

    const stats = {
        active: myTickets.filter(t => t.status === Status.Open || t.status === Status.WIP).length,
        unreadMessages: messages.filter(m => !m.isRead).length
    };

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-lg shadow-lg p-6 text-white flex flex-col md:flex-row justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Welcome back, {currentUser.name}</h2>
                    <p className="opacity-90 mt-1">Manage your facility requests and stay updated.</p>
                </div>
                <div className="flex space-x-6 mt-4 md:mt-0">
                     <div className="text-center bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <span className="block text-2xl font-bold">{stats.active}</span>
                        <span className="text-xs uppercase opacity-90">Active Requests</span>
                    </div>
                    <div className="text-center bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                        <span className="block text-2xl font-bold">{stats.unreadMessages}</span>
                        <span className="text-xs uppercase opacity-90">Unread Messages</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 space-x-6">
                <button 
                    onClick={() => setActiveTab('Requests')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'Requests' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    My Requests
                </button>
                <button 
                    onClick={() => setActiveTab('Meetings')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'Meetings' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Meetings & MOM
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Tickets or Meetings */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'Requests' ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800">My Requests</h3>
                                <button 
                                    onClick={onCreateTicket}
                                    className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-brand-secondary transition-colors flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    New Ticket
                                </button>
                            </div>

                            <div className="space-y-4">
                                {myTickets.length > 0 ? (
                                    myTickets.map(ticket => (
                                        <div key={ticket.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{ticket.ticketId}</span>
                                                        <Badge type={ticket.status} />
                                                    </div>
                                                    <h4 className="font-bold text-slate-800">{ticket.category} - {ticket.subcategory}</h4>
                                                    <p className="text-sm text-slate-600 mt-1 line-clamp-1">{ticket.description}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedTicket(ticket)}
                                                    className="text-brand-primary hover:text-brand-secondary text-sm font-medium"
                                                >
                                                    Track Status &rarr;
                                                </button>
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between text-xs text-slate-500">
                                                <span>Created: {ticket.createdAt.toLocaleDateString()}</span>
                                                <span>Technician: {ticket.technicianName}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400">No active requests.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Meetings Tab
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-800">Scheduled Meetings</h3>
                                <button 
                                    className="bg-white border border-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                                >
                                    Request Meeting
                                </button>
                            </div>
                            <div className="space-y-4">
                                {meetings.map(meeting => (
                                    <div key={meeting.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                        meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                                                        meeting.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {meeting.status}
                                                    </span>
                                                    <span className="text-xs text-slate-500 font-mono">{meeting.id}</span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 mt-1">{meeting.title}</h4>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-700">{meeting.startTime}</div>
                                                <div className="text-xs text-slate-500">{meeting.date.toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center text-xs text-slate-500 mb-3">
                                            <span className="mr-4">📍 {meeting.location}</span>
                                            <span>👤 Organizer: {meeting.organizer}</span>
                                        </div>

                                        {meeting.status === 'Completed' && (
                                            <div className="mt-3 pt-3 border-t border-slate-50">
                                                <button 
                                                    onClick={() => setSelectedMeeting(meeting)}
                                                    className="w-full text-center text-sm font-medium text-brand-primary hover:bg-blue-50 py-2 rounded transition-colors border border-blue-100"
                                                >
                                                    View Minutes of Meeting (MOM)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column: Engagement Widgets */}
                <div className="space-y-6">
                    {/* Announcements */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                                <h3 className="font-bold text-slate-700 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                    Announcements
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {announcements.map(ann => (
                                    <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                                ann.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {ann.type}
                                            </span>
                                            <span className="text-xs text-slate-400">{ann.date.toLocaleDateString()}</span>
                                        </div>
                                        <h4 className="font-semibold text-slate-800 text-sm mb-1">{ann.title}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-2">{ann.content}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Messages */}
                    <Card>
                        <CardContent className="p-0">
                             <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                                <h3 className="font-bold text-slate-700 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Message Center
                                </h3>
                            </div>
                             <div className="divide-y divide-slate-100">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!msg.isRead ? 'bg-blue-50/50' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-xs text-slate-700">{msg.sender}</span>
                                            {!msg.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                                        </div>
                                        <h4 className="font-medium text-slate-800 text-sm mb-1">{msg.subject}</h4>
                                        <p className="text-xs text-slate-500 line-clamp-1">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                                <button className="text-xs text-brand-primary font-medium hover:underline">View All Messages</button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <TicketTimelineModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
            
            {/* MOM Modal */}
            {selectedMeeting && selectedMeeting.momPoints && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Minutes of Meeting (MOM)</h3>
                                <p className="text-sm text-slate-500">{selectedMeeting.title} - {selectedMeeting.date.toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelectedMeeting(null)} className="text-slate-400 hover:text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <h4 className="font-semibold text-slate-700 mb-4">Action Items</h4>
                            <div className="space-y-4">
                                {selectedMeeting.momPoints.map((point) => (
                                    <div key={point.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-slate-800 font-medium">{point.point}</p>
                                            <span className={`text-xs px-2 py-1 rounded font-medium ${point.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {point.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                                            <span>Assigned To: <span className="font-semibold">{point.actionBy}</span></span>
                                            <span>Due Date: {point.dueDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                                <p><strong>Attendees:</strong> {selectedMeeting.attendees.join(', ')}</p>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-slate-50 text-right">
                            <button className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-secondary">Download PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
