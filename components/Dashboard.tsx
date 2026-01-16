
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Ticket, ViewType, Asset, ComplianceItem, AssetStatus } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';

interface DashboardProps {
  tickets: Ticket[];
  assets: Asset[];
  compliances: ComplianceItem[];
  stats: { total: number; open: number; wip: number; closed: number; lapsed: number };
  onDrillDown: (view: ViewType) => void;
}

const COLORS = ['#EF5350', '#FFCA28', '#66BB6A', '#42A5F5', '#BDBDBD' ];

export const Dashboard: React.FC<DashboardProps> = ({ tickets, assets, compliances, stats, onDrillDown }) => {

  const topSubcategories = useMemo(() => {
    const counts = tickets.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.subcategory] = (acc[ticket.subcategory] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [tickets]);

  const priorityDistribution = useMemo(() => {
    const counts = tickets.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {});
    const priorityOrder = ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'];
    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => priorityOrder.indexOf(a.name) - priorityOrder.indexOf(b.name));
  }, [tickets]);

  // Asset Stats
  const assetStats = useMemo(() => {
      const breakdown = assets.filter(a => a.status === AssetStatus.Breakdown).length;
      return { total: assets.length, breakdown };
  }, [assets]);

  // Compliance Stats
  const complianceStats = useMemo(() => {
      const expiring = compliances.filter(c => c.status === 'Expiring Soon').length;
      const nonCompliant = compliances.filter(c => c.status === 'Non-Compliant' || c.status === 'Expired').length;
      const total = compliances.length;
      const score = total > 0 ? Math.round(((total - nonCompliant) / total) * 100) : 100;
      return { score, expiring, nonCompliant };
  }, [compliances]);

  return (
    <div className="animate-fade-in-up space-y-6">
      
      {/* Top Row: Aggregated Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Operational Health (Assets)" 
            value={`${assetStats.breakdown} Breakdowns`} 
            subValue={`Out of ${assetStats.total} Assets`}
            color="text-red-600" 
            icon={<CubeIcon />} 
            onClick={() => onDrillDown(ViewType.ASSETS)}
            tooltip="Drill down to Asset Registry"
            bgColor="bg-red-50"
        />
        <StatCard 
            title="Compliance Score" 
            value={`${complianceStats.score}%`} 
            subValue={`${complianceStats.expiring} Expiring Soon`}
            color={complianceStats.score < 90 ? "text-yellow-600" : "text-green-600"}
            icon={<ScaleIcon />} 
            onClick={() => onDrillDown(ViewType.COMPLIANCE)}
            tooltip="Drill down to Statutory Compliance"
            bgColor="bg-blue-50"
        />
         <StatCard 
            title="Helpdesk Performance" 
            value={`${stats.open} Open`} 
            subValue={`${stats.lapsed} SLA Breaches`}
            color="text-brand-primary" 
            icon={<TicketIcon />} 
            onClick={() => onDrillDown(ViewType.TICKETS)}
            tooltip="Drill down to Ticket Listing"
            bgColor="bg-slate-50"
        />
      </div>

      {/* Ticket Metrics Section */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Helpdesk Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <MiniStatCard title="Open" value={stats.open} color="bg-blue-100 text-blue-700" onClick={() => onDrillDown(ViewType.TICKETS)} />
            <MiniStatCard title="WIP" value={stats.wip} color="bg-yellow-100 text-yellow-700" onClick={() => onDrillDown(ViewType.TICKETS)} />
            <MiniStatCard title="Resolved" value={stats.closed} color="bg-green-100 text-green-700" onClick={() => onDrillDown(ViewType.TICKETS)} />
            <MiniStatCard title="Closed" value={stats.closed} color="bg-slate-100 text-slate-700" onClick={() => onDrillDown(ViewType.TICKETS)} />
            <MiniStatCard title="Lapsed" value={stats.lapsed} color="bg-red-100 text-red-700" onClick={() => onDrillDown(ViewType.TICKETS)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
            <CardHeader>
                <h3 className="text-lg font-semibold text-slate-700">Top 5 Issue Categories</h3>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                    data={topSubcategories} 
                    onClick={() => onDrillDown(ViewType.TICKETS)}
                    className="cursor-pointer"
                >
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-md" />
                    <Bar dataKey="count" fill="#1976D2" radius={[4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <h3 className="text-lg font-semibold text-slate-700">Priority Distribution</h3>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie 
                        data={priorityDistribution} 
                        dataKey="value" 
                        nameKey="name" 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={80} 
                        fill="#8884d8" 
                        label
                        onClick={() => onDrillDown(ViewType.TICKETS)}
                        className="cursor-pointer"
                    >
                    {priorityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip wrapperClassName="!bg-white !border-slate-200 !rounded-md" />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

// --- Icons ---
const TicketIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 3h5.25m-5.25-3h.008m-4.5 3h.008m-4.5 3h.008m-4.5-3h.008m-4.5 3h.008M4.5 6h15v12h-15V6z" />
    </svg>
);

const CubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);

const ScaleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 1.75.98 1.75 1.963 0 1.14-.925 2.134-2.134 2.275C16.66 9.42 14.41 9.75 12 9.75c-2.41 0-4.66-.33-6.366-.542-1.21-.141-2.134-1.135-2.134-2.275 0-.983.74-1.82 1.75-1.963m13.5 0a48.42 48.42 0 00-6.75-.47" />
    </svg>
);

// --- Stat Components ---
interface StatCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    color?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    tooltip?: string;
    bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, color = 'text-slate-900', icon, onClick, tooltip, bgColor = 'bg-white' }) => {
    return (
        <Card className={`transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 border-transparent' : ''}`}>
            <div onClick={onClick} title={tooltip} className={`${bgColor} h-full`}>
                <CardContent className="flex items-center justify-between p-6">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
                        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
                        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
                    </div>
                    <div className={`p-4 rounded-full bg-white bg-opacity-60 shadow-sm ${color}`}>
                        {icon}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
};

const MiniStatCard: React.FC<{ title: string; value: number; color: string; onClick?: () => void }> = ({ title, value, color, onClick }) => (
    <div 
        onClick={onClick}
        className={`${color} p-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity flex flex-col items-center justify-center shadow-sm`}
    >
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs uppercase font-semibold opacity-80">{title}</span>
    </div>
);
