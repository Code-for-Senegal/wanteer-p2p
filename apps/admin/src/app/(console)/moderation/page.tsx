'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiPath, request } from '@/lib/api';
import type { Paginated } from '@wantere/types';

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  comment: string | null;
  status: string;
  createdAt: string;
}

export default function ModerationPage() {
  const queryClient = useQueryClient();

  const reports = useQuery({
    queryKey: ['reports'],
    queryFn: () => request<Paginated<Report>>(apiPath('/reports?pageSize=50')),
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'RESOLVED' | 'DISMISSED' }) =>
      request(apiPath(`/reports/${id}`), { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
  });

  return (
    <section>
      <h1 className="text-xl font-semibold text-neutral-900">Modération</h1>

      {reports.isError ? (
        <p className="mt-4 text-sm text-neutral-600">
          Connectez-vous avec un compte modérateur pour consulter la file.
        </p>
      ) : null}

      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 font-medium">Cible</th>
            <th className="py-2 font-medium">Motif</th>
            <th className="py-2 font-medium">Statut</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {reports.data?.items.map((report) => (
            <tr key={report.id} className="border-b border-neutral-100">
              <td className="py-2 text-neutral-800">
                {report.targetType} · {report.targetId.slice(0, 8)}
              </td>
              <td className="py-2 text-neutral-700">{report.reason}</td>
              <td className="py-2 text-neutral-700">{report.status}</td>
              <td className="py-2 text-right">
                <button
                  type="button"
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100"
                  onClick={() => review.mutate({ id: report.id, status: 'RESOLVED' })}
                >
                  Clore
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
