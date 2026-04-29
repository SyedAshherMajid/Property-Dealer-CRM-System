'use client';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import LeadTable from '@/components/LeadTable';
import { Target, AlertCircle, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AgentDashboard() {
  const { data: session } = useSession();
  const { data: leadsData, mutate } = useSWR('/api/leads', fetcher, { refreshInterval: 10000 });

  const leads = leadsData?.leads || [];
  const now = new Date();
  const overdue = leads.filter((l: { followUpDate?: string; status: string }) =>
    l.followUpDate && new Date(l.followUpDate) < now && !['Closed', 'Lost'].includes(l.status));
  const staleDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const stale = leads.filter((l: { lastActivityAt: string; status: string }) =>
    new Date(l.lastActivityAt) < staleDate && !['Closed', 'Lost'].includes(l.status));
  const closed = leads.filter((l: { status: string }) => l.status === 'Closed');
  const inProgress = leads.filter((l: { status: string }) => l.status === 'In Progress');
  const highPriority = leads.filter((l: { priority: string }) => l.priority === 'High');

  const upcomingFollowups = leads
    .filter((l: { followUpDate?: string; status: string }) =>
      l.followUpDate && new Date(l.followUpDate) >= now && !['Closed', 'Lost'].includes(l.status))
    .sort((a: { followUpDate: string }, b: { followUpDate: string }) =>
      new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout title={`Welcome, ${session?.user.name?.split(' ')[0]} 👋`}>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="My Leads" value={leads.length} icon={Target} color="blue" subtitle="Total assigned" />
        <StatCard title="High Priority" value={highPriority.length} icon={TrendingUp} color="red" subtitle="Need attention" />
        <StatCard title="Overdue Follow-ups" value={overdue.length} icon={AlertCircle} color="orange" subtitle="Action required" />
        <StatCard title="Closed" value={closed.length} icon={CheckCircle} color="emerald" subtitle="Completed leads" />
      </div>

      {/* Alert Banners */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {overdue.length} overdue follow-up{overdue.length > 1 ? 's' : ''}!
            </p>
            <p className="text-xs text-red-500 mt-0.5">These leads require immediate attention.</p>
          </div>
        </div>
      )}

      {stale.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-700">
              {stale.length} stale lead{stale.length > 1 ? 's' : ''} — no activity for 7+ days
            </p>
            <p className="text-xs text-yellow-500 mt-0.5">Follow up soon to keep these warm.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">My High-Priority Leads</h2>
            <a href="/agent/leads" className="text-sm text-blue-600 font-medium hover:underline">View All →</a>
          </div>
          <LeadTable
            leads={highPriority.slice(0, 5)}
            isAdmin={false}
            detailBase="/agent/leads"
          />
        </div>

        {/* Upcoming Follow-ups */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">
            <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-500" />Upcoming Follow-ups</span>
          </h2>
          {upcomingFollowups.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No upcoming follow-ups</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingFollowups.map((lead: { _id: string; name: string; followUpDate: string; priority: string }) => (
                <a key={lead._id} href={`/agent/leads/${lead._id}`}
                  className="block p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800 text-sm">{lead.name}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      lead.priority === 'High' ? 'bg-red-50 text-red-600' :
                      lead.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-green-50 text-green-600'
                    }`}>{lead.priority}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    📅 {new Date(lead.followUpDate).toLocaleDateString('en-PK')}
                    {' · '}
                    {formatDistanceToNow(new Date(lead.followUpDate), { addSuffix: true })}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
