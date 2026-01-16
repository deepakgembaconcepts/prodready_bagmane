import React, { useState } from 'react';
import type { NPSResponse } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface NPSModuleProps {
  onResponseSubmitted?: (response: NPSResponse) => void;
}

export const NPSModule: React.FC<NPSModuleProps> = ({ onResponseSubmitted }) => {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(new Date('2024-06-01'));
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    score: 5,
    feedback: '',
  });

  const monthsSinceLast = lastSent ? Math.floor((new Date().getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;

  const handleSendNPSSurvey = async () => {
    setIsSending(true);
    setTimeout(() => {
      setLastSent(new Date());
      setShowResponseForm(true);
      setIsSending(false);
    }, 1000);
  };

  const handleSubmitResponse = () => {
    if (!formData.tenantName.trim()) {
      alert('Please enter tenant name');
      return;
    }

    const response: NPSResponse = {
      id: `nps_${Date.now()}`,
      tenantName: formData.tenantName,
      score: formData.score,
      feedback: formData.feedback,
      date: new Date(),
    };

    onResponseSubmitted?.(response);
    setShowResponseForm(false);
    setFormData({
      tenantName: '',
      score: 5,
      feedback: '',
    });
    alert('NPS response recorded and dashboard updated!');
  };

  if (showResponseForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowResponseForm(false)} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">← Back</button>
          <h2 className="text-2xl font-bold">NPS Survey Response</h2>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">How likely are you to recommend us?</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tenant Name</label>
              <input
                type="text"
                value={formData.tenantName}
                onChange={e => setFormData(prev => ({ ...prev, tenantName: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Score (0-10)</label>
              <div className="flex space-x-2 justify-between">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                  <button
                    key={score}
                    onClick={() => setFormData(prev => ({ ...prev, score }))}
                    className={`w-9 h-9 rounded font-bold transition-all ${
                      formData.score === score
                        ? 'bg-blue-600 text-white scale-110'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-slate-500 flex justify-between">
                <span>Not likely (0-6)</span>
                <span>Neutral (7-8)</span>
                <span>Very likely (9-10)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Feedback (Optional)</label>
              <textarea
                value={formData.feedback}
                onChange={e => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Why did you give this score? What could we improve?"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmitResponse}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Submit Response
              </button>
              <button
                onClick={() => setShowResponseForm(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-800 rounded hover:bg-slate-400"
              >
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">NPS Survey Management</h2>
        <div className="text-sm text-slate-600">
          Manual trigger for annual tenant satisfaction survey
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Last Survey Sent</p>
                <p className="text-lg font-bold">{lastSent ? lastSent.toLocaleDateString() : 'Never'}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <span className="text-xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Months Since Last</p>
                <p className="text-2xl font-bold text-orange-600">{monthsSinceLast}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <span className="text-xl">⏰</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Recommended Frequency</p>
                <p className="text-lg font-bold text-green-600">Every 12 Months</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <span className="text-xl">🎯</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Send NPS Survey</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-slate-600">
              Send Net Promoter Score survey to all tenant POCs. This survey measures overall satisfaction
              and likelihood to recommend our services.
            </p>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Survey Details:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Target: All active tenant POCs</li>
                <li>• Frequency: Recommended every 12 months</li>
                <li>• Method: Email link to external survey form</li>
                <li>• Expected Response Time: 7-14 days</li>
              </ul>
            </div>

            <button
              onClick={handleSendNPSSurvey}
              disabled={isSending}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending Survey...' : 'Send NPS Survey Now'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};