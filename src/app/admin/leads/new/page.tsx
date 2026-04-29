'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Loader2, DollarSign, Building2, Phone, Mail, User, Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', propertyInterest: '', budget: '',
    source: 'Facebook Ads', notes: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.budget || isNaN(Number(form.budget))) {
      toast.error('Please enter a valid budget');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, budget: Number(form.budget) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lead');
      toast.success(`Lead created! Priority: ${data.lead.priority}`);
      router.push('/admin/leads');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  }

  const budgetVal = Number(form.budget);
  const priority = budgetVal > 20_000_000 ? 'High' : budgetVal >= 10_000_000 ? 'Medium' : form.budget ? 'Low' : null;
  const priorityColors = { High: 'text-red-600 bg-red-50 border-red-200', Medium: 'text-yellow-600 bg-yellow-50 border-yellow-200', Low: 'text-green-600 bg-green-50 border-green-200' };

  return (
    <DashboardLayout title="Add New Lead">
      <div className="mb-6">
        <Link href="/admin/leads" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Leads
        </Link>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-8 py-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800">Lead Information</h2>
            <p className="text-slate-500 text-sm mt-1">Fill in the client details below. Score is auto-calculated based on budget.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input name="name" type="text" value={form.name} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Muhammad Ali" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="client@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="03001234567" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Lead Source *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select name="source" value={form.source} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none">
                    <option>Facebook Ads</option>
                    <option>Walk-in</option>
                    <option>Website</option>
                    <option>Referral</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Property Interest *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input name="propertyInterest" type="text" value={form.propertyInterest} onChange={handleChange} required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="5 Marla House in DHA Lahore" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget (PKR) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input name="budget" type="number" value={form.budget} onChange={handleChange} required min="0"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="25000000" />
              </div>
              {priority && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Auto-assigned priority:</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityColors[priority as keyof typeof priorityColors]}`}>
                    {priority === 'High' ? '🔴' : priority === 'Medium' ? '🟡' : '🟢'} {priority}
                  </span>
                  <span className="text-xs text-slate-400">
                    {priority === 'High' ? '(Budget > 20M)' : priority === 'Medium' ? '(Budget 10M–20M)' : '(Budget < 10M)'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                placeholder="Any additional information about this lead..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Creating Lead...</> : 'Create Lead'}
              </button>
              <Link href="/admin/leads"
                className="px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
