'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  Building2, LayoutDashboard, Users, BarChart3, PlusCircle, LogOut,
  Target, Bell, ChevronRight, UserCircle,
} from 'lucide-react';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'All Leads', icon: Target },
  { href: '/admin/leads/new', label: 'Add Lead', icon: PlusCircle },
  { href: '/admin/agents', label: 'Agents', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const agentNav = [
  { href: '/agent', label: 'My Dashboard', icon: LayoutDashboard },
  { href: '/agent/leads', label: 'My Leads', icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user.role === 'admin';
  const navItems = isAdmin ? adminNav : agentNav;

  return (
    <aside className="w-64 min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col border-r border-slate-700 shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Property</p>
            <p className="font-bold text-blue-400 text-sm leading-tight">Dealer CRM</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-3 border-b border-slate-700">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isAdmin ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'}`}>
          {isAdmin ? '👑 Administrator' : '🎯 Sales Agent'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Navigation</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && href !== '/agent' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="text-sm font-medium">{label}</span>
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-700/50 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user.name}</p>
            <p className="text-xs text-slate-400 truncate">{session?.user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
