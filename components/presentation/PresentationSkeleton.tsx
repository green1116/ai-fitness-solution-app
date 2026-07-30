/**
 * Layout-preserving skeleton / loading presentation (PD-4.7 §8).
 * Bound to ST-META — never fabricates OBJ-* business values (SK-01).
 */
import type { SkeletonMode } from "@/lib/frontend/presentation-performance";

type PresentationSkeletonProps = Readonly<{
  mode: SkeletonMode;
  region?: string;
  label?: string;
}>;

export function PresentationSkeleton({
  mode,
  region,
  label = "Loading",
}: PresentationSkeletonProps) {
  if (mode === "SK-NONE") return null;

  return (
    <div
      data-perf="skeleton"
      data-skeleton-mode={mode}
      data-skeleton-region={region ?? "main"}
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="mx-auto w-full max-w-7xl px-6 py-8"
    >
      <p className="text-sm text-slate-500">{label}</p>
      {mode === "SK-COMMAND" ? (
        <p className="mt-2 text-sm font-medium text-slate-700">
          Working — you can retry or go back if this takes too long.
        </p>
      ) : (
        <div
          aria-hidden="true"
          className="mt-4 space-y-3"
          data-skeleton-placeholder="layout"
        >
          <div className="h-3 w-2/5 rounded bg-slate-200" />
          <div className="h-3 w-4/5 rounded bg-slate-200" />
          <div className="h-3 w-3/5 rounded bg-slate-200" />
        </div>
      )}
    </div>
  );
}
