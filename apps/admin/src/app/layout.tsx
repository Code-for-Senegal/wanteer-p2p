import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/query-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Wantere Admin',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
