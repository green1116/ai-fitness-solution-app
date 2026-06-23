import Link from "next/link";

type DocumentEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function DocumentEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: DocumentEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">{description}</p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-6 inline-block rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
