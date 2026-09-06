import Link from 'next/link';
import type { ReactNode } from 'react';

const navigation = [
  { href: '/', label: 'Vue d’ensemble' },
  { href: '/moderation', label: 'Modération' },
] as const;

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white px-4 py-6">
        <p className="mb-6 text-sm font-semibold tracking-wide text-neutral-500">WANTERE</p>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
