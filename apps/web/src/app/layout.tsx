import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/query-provider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Wantere',
  description: 'Acheter, vendre, donner et échanger près de chez soi.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
