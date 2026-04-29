'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Building2 } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      router.replace(session.user.role === 'admin' ? '/admin' : '/agent');
    } else {
      router.replace('/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
      <div className="text-center text-white">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-blue-300 animate-pulse" />
        <p className="text-lg text-blue-200">Loading Property Dealer CRM...</p>
      </div>
    </div>
  );
}
