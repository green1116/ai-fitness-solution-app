import Link from "next/link";

/**
 * CMP-NAV-CONTINUITY — SCR-01 continuity zone.
 * Opens My Projects; does not list projects (SCR-07).
 */
export function ContinuityLink() {
  return (
    <div data-cmp="CMP-NAV-CONTINUITY">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Continuity
      </p>
      <Link
        href="/projects"
        data-action-id="ACT-01-06"
        className="mt-3 inline-flex text-sm font-semibold text-slate-950 underline underline-offset-4"
      >
        My Projects
      </Link>
    </div>
  );
}
