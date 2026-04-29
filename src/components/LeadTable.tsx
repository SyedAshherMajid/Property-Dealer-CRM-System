'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Eye, Pencil, Trash2, AlertCircle, Clock } from 'lucide-react';
import { getPriorityColor, getStatusColor, formatBudget } from '@/lib/scoring';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  status: string;
  priority: string;
  score: number;
  source: string;
  assignedTo?: { name: string; email: string } | null;
  followUpDate?: string | null;
  lastActivityAt: string;
  createdAt: string;
}

interface Props {
  leads: Lead[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  detailBase?: string;
}

function isOverdue(date?: string | null): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

function isStale(lastActivity: string): boolean {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return new Date(lastActivity) < sevenDaysAgo;
}

export default function LeadTable({ leads, isAdmin, onDelete, detailBase = '/admin/leads' }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this lead? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.ok) onDelete?.(id);
    } finally {
      setDeleting(null);
    }
  }

  function formatWhatsApp(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
    return cleaned.startsWith('0') ? `92${cleaned.slice(1)}` : cleaned;
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">No leads found</h3>
        <p className="text-slate-400 mt-1">Try adjusting your filters or add a new lead</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Lead</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Budget</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Priority</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
            {isAdmin && <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Agent</th>}
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Follow-up</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Added</th>
            <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {leads.map((lead) => {
            const overdue = isOverdue(lead.followUpDate);
            const stale = isStale(lead.lastActivityAt);
            return (
              <tr key={lead._id} className={`lead-row ${overdue ? 'bg-red-50/50' : stale ? 'bg-yellow-50/50' : 'bg-white'}`}>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{lead.name}</p>
                        {overdue && <AlertCircle className="w-4 h-4 text-red-500" title="Overdue follow-up" />}
                        {stale && !overdue && <Clock className="w-4 h-4 text-yellow-500" title="Stale lead" />}
                      </div>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{lead.propertyInterest}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="font-semibold text-slate-700 text-sm">{formatBudget(lead.budget)}</span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(lead.priority)}`}>
                    {lead.priority === 'High' ? '🔴' : lead.priority === 'Medium' ? '🟡' : '🟢'} {lead.priority}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-4">
                    {lead.assignedTo ? (
                      <div>
                        <p className="text-sm font-medium text-slate-700">{lead.assignedTo.name}</p>
                        <p className="text-xs text-slate-400">{lead.assignedTo.email}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                )}
                <td className="px-4 py-4">
                  {lead.followUpDate ? (
                    <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-slate-600'}`}>
                      {overdue ? '⚠️ ' : '📅 '}
                      {new Date(lead.followUpDate).toLocaleDateString('en-PK')}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`${detailBase}/${lead._id}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <a
                      href={`https://wa.me/${formatWhatsApp(lead.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    {isAdmin && onDelete && (
                      <button
                        onClick={() => handleDelete(lead._id)}
                        disabled={deleting === lead._id}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
