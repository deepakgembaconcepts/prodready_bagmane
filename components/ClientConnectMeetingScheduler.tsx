import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Badge } from './ui/Badge';

import { Meeting } from '../types';

interface MOM {
  id: string;
  meetingId: string;
  meetingTitle: string;
  date: Date;
  attendees: string[];
  keyDiscussions: string[];
  decisions: Array<{
    id: string;
    decision: string;
    owner: string;
  }>;
  actionItems: Array<{
    id: string;
    action: string;
    owner: string;
    dueDate: Date;
    status: 'Open' | 'In Progress' | 'Completed';
  }>;
  nextSteps?: string;
  createdBy: string;
  createdDate: Date;
}

interface ClientConnectMeetingSchedulerProps {
  meetings?: Meeting[];
  moms?: MOM[];
  onCreateMeeting?: (meeting: Meeting) => void;
  onCreateMOM?: (mom: MOM) => void;
  currentUser?: string;
}

const MEETING_STATUS_COLORS = {
  'Scheduled': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800'
};

export const ClientConnectMeetingScheduler: React.FC<ClientConnectMeetingSchedulerProps> = ({
  meetings = [],
  moms = [],
  onCreateMeeting,
  onCreateMOM,
  currentUser = 'Current User'
}) => {
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showMOMForm, setShowMOMForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [momForMeeting, setMomForMeeting] = useState<MOM | null>(null);

  // Meeting Form State
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    attendees: '',
    location: '',
    description: ''
  });

  // MOM Form State
  const [momForm, setMomForm] = useState({
    keyDiscussions: '',
    decisions: '',
    actionItems: '',
    nextSteps: ''
  });

  const metrics = useMemo(() => {
    const upcomingMeetings = meetings.filter(m => new Date(m.date) > new Date() && m.status === 'Scheduled').length;
    const completedMeetings = meetings.filter(m => m.status === 'Completed').length;
    const totalMeetings = meetings.length;
    const openActions = moms.flatMap(m => m.actionItems).filter(a => a.status === 'Open').length;

    return {
      upcomingMeetings,
      completedMeetings,
      totalMeetings,
      openActions,
      totalMOMs: moms.length
    };
  }, [meetings, moms]);

  const handleCreateMeeting = () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.startTime || !meetingForm.endTime) {
      alert('Please fill in all required fields');
      return;
    }

    const newMeeting: Meeting = {
      id: `MTG-${Date.now()}`,
      title: meetingForm.title,
      date: new Date(meetingForm.date),
      startTime: meetingForm.startTime,
      endTime: meetingForm.endTime,
      organizer: currentUser,
      attendees: meetingForm.attendees.split(',').map(a => a.trim()).filter(a => a),
      location: meetingForm.location,
      status: 'Scheduled'
    };

    onCreateMeeting?.(newMeeting);
    setMeetingForm({ title: '', date: '', startTime: '', endTime: '', attendees: '', location: '', description: '' });
    setShowMeetingForm(false);
  };

  const handleCreateMOM = () => {
    if (!selectedMeeting || !momForm.keyDiscussions) {
      alert('Please select a meeting and add key discussions');
      return;
    }

    const newMOM: MOM = {
      id: `MOM-${Date.now()}`,
      meetingId: selectedMeeting.id,
      meetingTitle: selectedMeeting.title,
      date: new Date(),
      attendees: selectedMeeting.attendees,
      keyDiscussions: momForm.keyDiscussions.split('\n').filter(k => k.trim()),
      decisions: momForm.decisions
        .split('\n')
        .filter(d => d.trim())
        .map((decision, i) => ({
          id: `DEC-${i}`,
          decision,
          owner: 'TBD'
        })),
      actionItems: momForm.actionItems
        .split('\n')
        .filter(a => a.trim())
        .map((action, i) => ({
          id: `ACTION-${i}`,
          action,
          owner: 'TBD',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'Open'
        })),
      nextSteps: momForm.nextSteps,
      createdBy: currentUser,
      createdDate: new Date()
    };

    onCreateMOM?.(newMOM);
    setMomForm({ keyDiscussions: '', decisions: '', actionItems: '', nextSteps: '' });
    setShowMOMForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Client Connect - Meeting Management</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">Total Meetings</p>
            <p className="text-3xl font-bold mt-2">{metrics.totalMeetings}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">Upcoming</p>
            <p className="text-3xl font-bold mt-2">{metrics.upcomingMeetings}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">Completed</p>
            <p className="text-3xl font-bold mt-2">{metrics.completedMeetings}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none">
          <CardContent className="p-4">
            <p className="text-sm font-medium opacity-90">Open Actions</p>
            <p className="text-3xl font-bold mt-2">{metrics.openActions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Meeting Section */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">Schedule Meeting</h3>
          <button
            onClick={() => setShowMeetingForm(!showMeetingForm)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            {showMeetingForm ? 'Cancel' : 'New Meeting'}
          </button>
        </CardHeader>
        {showMeetingForm && (
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Title *</label>
                  <input
                    type="text"
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    placeholder="e.g., Quarterly Review"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={meetingForm.startTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    value={meetingForm.endTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                    placeholder="e.g., Conference Room A / Virtual"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Attendees (comma-separated)</label>
                  <input
                    type="text"
                    value={meetingForm.attendees}
                    onChange={(e) => setMeetingForm({ ...meetingForm, attendees: e.target.value })}
                    placeholder="john@email.com, jane@email.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={meetingForm.description}
                    onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                    placeholder="Meeting agenda and details..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateMeeting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowMeetingForm(false)}
                  className="px-4 py-2 bg-slate-300 text-slate-800 rounded hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Meetings List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-800">Meetings ({meetings.length})</h3>
        </CardHeader>
        <CardContent>
          {meetings.length === 0 ? (
            <p className="text-slate-500">No meetings scheduled yet</p>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-slate-800">{meeting.title}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.startTime} - {meeting.endTime}
                      </p>
                      <p className="text-xs text-slate-500">{meeting.location}</p>
                    </div>
                    <Badge className={MEETING_STATUS_COLORS[meeting.status]}>
                      {meeting.status}
                    </Badge>
                  </div>

                  {meeting.description && (
                    <p className="text-sm text-slate-600 mb-2">{meeting.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-3">
                    {meeting.attendees.map((attendee, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                        {attendee}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMeeting(meeting);
                      setShowMOMForm(true);
                    }}
                    className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    + Create MOM
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MOM Creation Form */}
      {showMOMForm && selectedMeeting && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">
              Minutes of Meeting - {selectedMeeting.title}
            </h3>
            <button
              onClick={() => setShowMOMForm(false)}
              className="text-slate-500 hover:text-slate-700"
            >
              ✕
            </button>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Key Discussions *</label>
                <textarea
                  value={momForm.keyDiscussions}
                  onChange={(e) => setMomForm({ ...momForm, keyDiscussions: e.target.value })}
                  placeholder="Enter key discussion points (one per line)"
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Decisions Made</label>
                <textarea
                  value={momForm.decisions}
                  onChange={(e) => setMomForm({ ...momForm, decisions: e.target.value })}
                  placeholder="Enter decisions made (one per line)"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Action Items</label>
                <textarea
                  value={momForm.actionItems}
                  onChange={(e) => setMomForm({ ...momForm, actionItems: e.target.value })}
                  placeholder="Enter action items (one per line)"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Next Steps</label>
                <textarea
                  value={momForm.nextSteps}
                  onChange={(e) => setMomForm({ ...momForm, nextSteps: e.target.value })}
                  placeholder="Describe next steps..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateMOM}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create MOM
                </button>
                <button
                  type="button"
                  onClick={() => setShowMOMForm(false)}
                  className="px-4 py-2 bg-slate-300 text-slate-800 rounded hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* MOMs List */}
      {moms.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-800">Minutes of Meetings ({moms.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moms.map((mom) => (
                <div key={mom.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="mb-3">
                    <p className="font-semibold text-slate-800">{mom.meetingTitle}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(mom.date).toLocaleDateString()} - Created by {mom.createdBy}
                    </p>
                  </div>

                  {mom.keyDiscussions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700">Key Discussions:</p>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        {mom.keyDiscussions.map((disc, i) => (
                          <li key={i}>{disc}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {mom.decisions.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700">Decisions:</p>
                      <ul className="text-sm text-slate-600 list-disc list-inside">
                        {mom.decisions.map((dec) => (
                          <li key={dec.id}>{dec.decision}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {mom.actionItems.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Action Items:</p>
                      <div className="space-y-1">
                        {mom.actionItems.map((action) => (
                          <div key={action.id} className="text-sm text-slate-600 flex justify-between">
                            <span>• {action.action}</span>
                            <Badge className="bg-yellow-100 text-yellow-800">{action.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
