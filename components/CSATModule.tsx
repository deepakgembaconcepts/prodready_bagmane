import React, { useState, useMemo } from 'react';
import type { CSATResponse } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface TenantPOC {
  id: number;
  name: string;
  email: string;
  company: string;
  lastSurveyDate: Date | null;
  surveyCount: number;
}

const mockTenants: TenantPOC[] = [
  { id: 1, name: 'John Smith', email: 'john.smith@techcorp.com', company: 'TechCorp', lastSurveyDate: new Date('2024-06-15'), surveyCount: 2 },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@innovate.com', company: 'Innovate Ltd', lastSurveyDate: new Date('2024-01-20'), surveyCount: 1 },
  { id: 3, name: 'Mike Davis', email: 'mike.davis@startup.io', company: 'Startup Inc', lastSurveyDate: null, surveyCount: 0 },
];

interface CSATModuleProps {
  onResponseSubmitted?: (response: CSATResponse) => void;
}

export const CSATModule: React.FC<CSATModuleProps> = ({ onResponseSubmitted }) => {
  const [selectedTenant, setSelectedTenant] = useState<TenantPOC | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [formData, setFormData] = useState({
    overallSatisfaction: 5,
    serviceQuality: 5,
    responseTime: 5,
    professionalismScore: 5,
    comments: '',
  });

  const tenantsNeedingSurvey = useMemo(() => {
    const now = new Date();
    return mockTenants.filter(tenant => {
      if (!tenant.lastSurveyDate) return true;
      const monthsSince = (now.getTime() - tenant.lastSurveyDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsSince >= 6;
    });
  }, []);

  const handleSendSurvey = async (tenant: TenantPOC) => {
    setIsSending(true);
    setSelectedTenant(tenant);
    setTimeout(() => {
      alert(`CSAT survey sent to ${tenant.email}`);
      setIsSending(false);
    }, 1000);
  };

  const handleSubmitResponse = () => {
    if (!selectedTenant) return;
    
    const response: CSATResponse = {
      id: `csat_${Date.now()}`,
      tenantName: selectedTenant.name,
      tenantPoC: selectedTenant.email,
      building: 'Bagmane Complex',
      rating: formData.overallSatisfaction,
      overallSatisfaction: formData.overallSatisfaction,
      serviceQuality: formData.serviceQuality,
      responseTime: formData.responseTime,
      professionalismScore: formData.professionalismScore,
      comments: formData.comments,
      date: new Date(),
    };

    onResponseSubmitted?.(response);
    setShowResponseForm(false);
    setFormData({
      overallSatisfaction: 5,
      serviceQuality: 5,
      responseTime: 5,
      professionalismScore: 5,
      comments: '',
    });
    alert('CSAT response recorded and dashboard updated!');
  };

  if (showResponseForm && selectedTenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setShowResponseForm(false)} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300">← Back</button>
          <h2 className="text-2xl font-bold">CSAT Survey Response - {selectedTenant.name}</h2>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Please rate our service</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { label: 'Overall Satisfaction', key: 'overallSatisfaction' },
              { label: 'Service Quality', key: 'serviceQuality' },
              { label: 'Response Time', key: 'responseTime' },
              { label: 'Professionalism', key: 'professionalismScore' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFormData(prev => ({ ...prev, [key]: rating }))}
                      className={`w-10 h-10 rounded-full font-bold transition-all ${
                        formData[key as keyof typeof formData] === rating
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium mb-2">Additional Comments</label>
              <textarea
                value={formData.comments}
                onChange={e => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Share your feedback..."
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
        <h2 className="text-2xl font-bold text-slate-800">CSAT Survey Automation</h2>
        <div className="text-sm text-slate-600">
          Automated every 6 months to Tenant POCs
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Total Tenants</p>
                <p className="text-2xl font-bold">{mockTenants.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Due for Survey</p>
                <p className="text-2xl font-bold text-orange-600">{tenantsNeedingSurvey.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <span className="text-xl">📧</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">Surveys Sent This Month</p>
                <p className="text-2xl font-bold text-green-600">3</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <span className="text-xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Tenant POC Survey Status</h3>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">Tenant POC</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Last Survey</th>
                  <th className="px-4 py-3 text-left">Survey Count</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockTenants.map(tenant => {
                  const needsSurvey = tenantsNeedingSurvey.includes(tenant);
                  return (
                    <tr key={tenant.id} className="border-b">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-slate-500">{tenant.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{tenant.company}</td>
                      <td className="px-4 py-3">
                        {tenant.lastSurveyDate ? tenant.lastSurveyDate.toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">{tenant.surveyCount}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          needsSurvey ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {needsSurvey ? 'Due' : 'Up to Date'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedTenant(tenant);
                            setShowResponseForm(true);
                          }}
                          disabled={isSending}
                          className={`px-3 py-1 rounded text-sm ${
                            needsSurvey
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isSending ? 'Sending...' : 'Send Survey'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};