import Link from "next/link";

/**
 * GRD-CONTEXT soft gate — never blocks route entry.
 * Guides to `/projects` or `/` when project cue is absent.
 */
export function ContextSoftGuide() {
  return (
    <div
      data-guard="GRD-CONTEXT"
      data-guard-mode="soft"
      className="border-b border-amber-200 bg-amber-50 text-amber-950"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 text-sm">
        <p>Project cue is not set. You can continue reading this screen.</p>
        <Link
          href="/projects"
          className="font-semibold underline underline-offset-4"
        >
          My Projects
        </Link>
        <Link href="/" className="font-semibold underline underline-offset-4">
          Home
        </Link>
      </div>
    </div>
  );
}
