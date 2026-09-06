'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiPath, request } from '@/lib/api';
import { session, type AuthTokens } from '@/features/auth/session';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      if (step === 'phone') {
        await request(apiPath('/auth/login'), { method: 'POST', body: JSON.stringify({ phone }) });
        setStep('code');
        return;
      }

      const tokens = await request<AuthTokens>(apiPath('/auth/verify'), {
        method: 'POST',
        body: JSON.stringify({ phone, code, platform: 'web' }),
      });

      session.write(tokens);
      router.push('/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Connexion impossible');
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900">Connexion</h1>

      <input
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        placeholder="+221770000000"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        disabled={step === 'code'}
      />

      {step === 'code' ? (
        <input
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          placeholder="Code reçu par SMS"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        className="w-full rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white"
      >
        {step === 'phone' ? 'Recevoir un code' : 'Se connecter'}
      </button>
    </form>
  );
}
