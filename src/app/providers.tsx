'use client';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' },
          success: { style: { background: '#f0fdf4', border: '1px solid #86efac', color: '#166534' } },
          error: { style: { background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b' } },
        }}
      />
    </SessionProvider>
  );
}
