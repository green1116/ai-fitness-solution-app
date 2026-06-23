export function DocumentListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-xl border border-zinc-800 bg-black/40 p-4"
        >
          <div className="h-4 w-1/3 rounded bg-zinc-800" />
          <div className="mt-3 h-3 w-1/2 rounded bg-zinc-900" />
        </li>
      ))}
    </ul>
  );
}
