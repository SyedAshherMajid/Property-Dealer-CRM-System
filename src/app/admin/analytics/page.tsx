'use client';
import useSWR from 'swr';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { Target, AlertCircle, Clock, TrendingUp, Users, CheckCircle, RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, CartesianGrid,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_COLORS: Record<string, string> = {
  New: '#3b82f6', Contacted: '#8b5cf6', 'In Progress': '#f59e0b', Closed: '#10b981', Lost: '#ef4444',
};
const PRIORITY_COLORS: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useSWR('/api/analytics', fetcher, { refreshInterval: 30000 });

  if (isLoading) return (
    <DashboardLayout title="Analytics & Insights">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading analytics...</p>
        </div>
      </div>
    </DashboardLayout>
  );

  const stats = analytics || {};
  const closed = stats.statusDistribution?.find((s: { status: string }) => s.status === 'Closed')?.count || 0;
  const totalLeads = stats.totalLeads || 0;
  const overallConversion = totalLeads > 0 ? Math.round((closed / totalLeads) * 100) : 0;

  return (
    <DashboardLayout title="Analytics & Insights">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Leads" value={totalLeads} icon={Target} color="blue" />
        <StatCard title="Overall Conversion" value={`${overallConversion}%`} icon={TrendingUp} color="emerald" />
        <StatCard title="Overdue Follow-ups" value={stats.overdueFollowUps || 0} icon={AlertCircle} color="red" />
        <StatCard title="Stale Leads" value={stats.staleLeads || 0} icon={Clock} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Leads by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.statusDistribution || []} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {(stats.statusDistribution || []).map((e: { status: string }) => (
                  <Cell key={e.status} fill={STATUS_COLORS[e.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Priority Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={stats.priorityDistribution || []} dataKey="count" nameKey="priority"
                cx="50%" cy="50%" outerRadius={90} innerRadius={40}
                label={({ priority, count }) => `${priority}: ${count}`}>
                {(stats.priorityDistribution || []).map((e: { priority: string }) => (
                  <Cell key={e.priority} fill={PRIORITY_COLORS[e.priority] || '#94a3b8'} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Agent Performance Overview</h2>
          <span className="text-sm text-slate-400">{stats.agentPerformance?.length || 0} agents</span>
        </div>
        {stats.agentPerformance?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Agent', 'Total Assigned', 'In Progress', 'Closed', 'Lost', 'Conversion Rate'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.agentPerformance.map((agent: {
                  agentId: string; agentName: string; agentEmail: string;
                  totalAssigned: number; inProgress: number; closed: number; conversionRate: number;
                }) => (
                  <tr key={agent.agentId} className="lead-row">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {agent.agentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{agent.agentName}</p>
                          <p className="text-xs text-slate-400">{agent.agentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-sm font-bold text-slate-700">{agent.totalAssigned}</td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-medium">{agent.inProgress}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">{agent.closed}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-sm text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        {agent.totalAssigned - agent.inProgress - agent.closed}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3 min-w-32">
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${agent.conversionRate}%` }} />
                        </div>
                        <span className="text-sm font-bold text-slate-700 w-10 text-right">{agent.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-3" />
            <p>No agent data available yet</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
