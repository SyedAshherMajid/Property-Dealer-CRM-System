'use client';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {title && (
          <div className="bg-white border-b border-slate-200 px-8 py-5">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          </div>
        )}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
