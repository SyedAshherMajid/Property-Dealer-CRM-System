'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft, Loader2, Phone, Mail, MessageCircle, Calendar, Clock, Save, Trash2, User
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { getPriorityColor, getStatusColor, formatBudget } from '@/lib/scoring';

interface Lead {
  _id: string; name: string; email: string; phone: string; propertyInterest: string;
  budget: number; status: string; priority: string; score: number; notes: string;
  source: string; assignedTo?: { _id: string; name: string; email: string } | null;
  followUpDate?: string | null; createdAt: string; updatedAt: string;
}
interface Activity {
  _id: string; action: string; description: string; createdAt: string;
  performedBy?: { name: string };
}
interface Agent { _id: string; name: string; email: string; }

const ACTION_ICONS: Record<string, string> = {
  lead_created: '✅', lead_updated: '✏️', lead_assigned: '👤', lead_reassigned: '🔄',
  status_changed: '🔄', notes_updated: '📝', followup_set: '📅', lead_deleted: '🗑️',
};

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: '', notes: '', assignedTo: '', followUpDate: '' });

  async function loadData() {
    try {
      const [leadRes, agentsRes] = await Promise.all([
        fetch(`/api/leads/${id}`),
        fetch('/api/users?role=agent'),
      ]);
      const leadData = await leadRes.json();
      const agentsData = await agentsRes.json();
      setLead(leadData.lead);
      setActivities(leadData.activities || []);
      setAgents(agentsData.users || []);
      setForm({
        status: leadData.lead?.status || '',
        notes: leadData.lead?.notes || '',
        assignedTo: leadData.lead?.assignedTo?._id || '',
        followUpDate: leadData.lead?.followUpDate ? format(new Date(leadData.lead.followUpDate), 'yyyy-MM-dd') : '',
      });
    } catch {
      toast.error('Failed to load lead');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: form.status,
          notes: form.notes,
          assignedTo: form.assignedTo || null,
          followUpDate: form.followUpDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLead(data.lead);
      toast.success('Lead updated successfully');
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this lead permanently?')) return;
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Lead deleted'); router.push('/admin/leads'); }
    else toast.error('Delete failed');
  }

  function formatWhatsApp(phone: string) {
    const c = phone.replace(/[\s\-\(\)\+]/g, '');
    return c.startsWith('0') ? `92${c.slice(1)}` : c;
  }

  if (loading) return (
    <DashboardLayout title="Lead Details">
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (!lead) return (
    <DashboardLayout title="Lead Details">
      <div className="text-center py-16">
        <p className="text-slate-500">Lead not found</p>
        <Link href="/admin/leads" className="text-blue-600 mt-2 block hover:underline">← Back to Leads</Link>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Lead Details">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/leads" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Back to Leads
        </Link>
        <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-medium transition">
          <Trash2 className="w-4 h-4" /> Delete Lead
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{lead.name}</h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(lead.priority)}`}>
                    {lead.priority === 'High' ? '🔴' : lead.priority === 'Medium' ? '🟡' : '🟢'} {lead.priority} Priority
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className="text-xs text-slate-500">Score: {lead.score}/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-700">{lead.phone}</p>
                    <a href={`https://wa.me/${formatWhatsApp(lead.phone)}`} target="_blank" rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700">
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-slate-400 flex items-center justify-center">🏠</div>
                <div>
                  <p className="text-xs text-slate-400">Property Interest</p>
                  <p className="text-sm font-medium text-slate-700">{lead.propertyInterest}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-slate-400 flex items-center justify-center">💰</div>
                <div>
                  <p className="text-xs text-slate-400">Budget</p>
                  <p className="text-sm font-bold text-slate-800">{formatBudget(lead.budget)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-slate-400 flex items-center justify-center">📌</div>
                <div>
                  <p className="text-xs text-slate-400">Source</p>
                  <p className="text-sm font-medium text-slate-700">{lead.source}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Created</p>
                  <p className="text-sm font-medium text-slate-700">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Update Lead</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  {['New', 'Contacted', 'In Progress', 'Closed', 'Lost'].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign to Agent</label>
                <select value={form.assignedTo} onChange={(e) => setForm(p => ({ ...p, assignedTo: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">— Unassigned —</option>
                  {agents.map((a) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Follow-up Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="date" value={form.followUpDate} onChange={(e) => setForm(p => ({ ...p, followUpDate: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Add notes about this lead..." />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Activity Timeline</h3>
            {activities.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No activity yet</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div key={activity._id} className="relative flex gap-3">
                    {i < activities.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100" />
                    )}
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm flex-shrink-0 z-10">
                      {ACTION_ICONS[activity.action] || '•'}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <p className="text-sm text-slate-700">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {activity.performedBy && (
                          <span className="text-xs text-slate-400">{activity.performedBy.name}</span>
                        )}
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
