'use client';
import { useState } from 'react';
import useSWR from 'swr';
import DashboardLayout from '@/components/DashboardLayout';
import LeadTable from '@/components/LeadTable';
import { PlusCircle, Search, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminLeadsPage() {
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [search, setSearch] = useState('');

  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (priority !== 'all') params.set('priority', priority);
  if (search) params.set('search', search);

  const { data, mutate, isLoading } = useSWR(`/api/leads?${params}`, fetcher, { refreshInterval: 10000 });
  const leads = data?.leads || [];

  function handleDelete(id: string) {
    mutate((prev: { leads: { _id: string }[] }) => ({
      leads: prev?.leads?.filter((l: { _id: string }) => l._id !== id) || [],
    }), false);
    toast.success('Lead deleted successfully');
  }

  return (
    <DashboardLayout title="Lead Management">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-slate-500 text-sm">{leads.length} leads found</p>
        </div>
        <Link
          href="/admin/leads/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          Add New Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
              <option value="Lost">Lost</option>
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button
              onClick={() => mutate()}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm">Loading leads...</p>
            </div>
          </div>
        ) : (
          <LeadTable leads={leads} isAdmin onDelete={handleDelete} detailBase="/admin/leads" />
        )}
      </div>
    </DashboardLayout>
  );
}
