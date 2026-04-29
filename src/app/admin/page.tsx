'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import LeadTable from '@/components/LeadTable';
import {
  Users, Target, TrendingUp, AlertCircle, Clock, CheckCircle, Activity, Zap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_COLORS: Record<string, string> = {
  New: '#3b82f6', Contacted: '#8b5cf6', 'In Progress': '#f59e0b', Closed: '#10b981', Lost: '#ef4444',
};
const PRIORITY_COLORS: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

export default function AdminDashboard() {
  const { data: analytics, mutate: mutateAnalytics } = useSWR('/api/analytics', fetcher, { refreshInterval: 15000 });
  const { data: leadsData, mutate: mutateLeads } = useSWR('/api/leads?status=New', fetcher, { refreshInterval: 15000 });

  const stats = analytics || {};
  const newLeads = leadsData?.leads?.slice(0, 6) || [];

  function handleDelete(id: string) {
    mutateLeads((prev: { leads: { _id: string }[] }) => ({
      leads: prev?.leads?.filter((l: { _id: string }) => l._id !== id) || [],
    }), false);
    mutateAnalytics();
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Leads" value={stats.totalLeads || 0} icon={Target} color="blue" subtitle="All time" />
        <StatCard title="High Priority" value={stats.priorityDistribution?.find((p: { priority: string }) => p.priority === 'High')?.count || 0} icon={Zap} color="red" subtitle="Needs immediate action" />
        <StatCard title="Overdue Follow-ups" value={stats.overdueFollowUps || 0} icon={AlertCircle} color="orange" subtitle="Action required" />
        <StatCard title="Stale Leads" value={stats.staleLeads || 0} icon={Clock} color="yellow" subtitle="7+ days inactive" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Lead Status Distribution</h2>
          {stats.statusDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.statusDistribution} barSize={36}>
                <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stats.statusDistribution.map((entry: { status: string }) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400">No data yet</div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Priority Distribution</h2>
          {stats.priorityDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.priorityDistribution}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ priority, count }) => `${priority}: ${count}`}
                >
                  {stats.priorityDistribution.map((entry: { priority: string }) => (
                    <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] || '#94a3b8'} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-400">No data yet</div>
          )}
        </div>
      </div>

      {/* Agent Performance */}
      {stats.agentPerformance?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Agent Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Agent</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Total</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">In Progress</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Closed</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider pb-3">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.agentPerformance.map((agent: { agentId: string; agentName: string; agentEmail: string; totalAssigned: number; inProgress: number; closed: number; conversionRate: number }) => (
                  <tr key={agent.agentId}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                          {agent.agentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{agent.agentName}</p>
                          <p className="text-xs text-slate-400">{agent.agentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-semibold text-slate-700">{agent.totalAssigned}</td>
                    <td className="py-3 text-sm text-yellow-600">{agent.inProgress}</td>
                    <td className="py-3 text-sm text-emerald-600">{agent.closed}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${agent.conversionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{agent.conversionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent New Leads */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Recent New Leads</h2>
          <a href="/admin/leads" className="text-sm text-blue-600 font-medium hover:underline">View All →</a>
        </div>
        <LeadTable leads={newLeads} isAdmin onDelete={handleDelete} detailBase="/admin/leads" />
      </div>
    </DashboardLayout>
  );
}
