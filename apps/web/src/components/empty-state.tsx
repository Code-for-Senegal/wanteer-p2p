export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center">
      <p className="font-medium text-neutral-700">{title}</p>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
    </div>
  );
}
