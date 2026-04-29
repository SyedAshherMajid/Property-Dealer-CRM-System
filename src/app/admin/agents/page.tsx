'use client';
import useSWR from 'swr';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { UserPlus, Users, Mail, Phone } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AgentsPage() {
  const { data } = useSWR('/api/users?role=agent', fetcher, { refreshInterval: 30000 });
  const agents = data?.users || [];

  return (
    <DashboardLayout title="Agents Management">
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-500 text-sm">{agents.length} agents registered</p>
        <Link href="/signup"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
          <UserPlus className="w-5 h-5" /> Add Agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-600">No agents yet</h3>
          <p className="text-slate-400 text-sm mt-1">Add your first agent to get started</p>
          <Link href="/signup" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-sm">
            <UserPlus className="w-4 h-4" /> Create Agent Account
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent: { _id: string; name: string; email: string; phone?: string; createdAt: string }) => (
            <div key={agent._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 stat-card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{agent.name}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Agent</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Joined {new Date(agent.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
