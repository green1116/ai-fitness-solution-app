import Link from "next/link";

import { buildProjectScopedHref } from "@/lib/frontend/navigation";

type ContextPanelProps = Readonly<{
  projectId?: string;
}>;

/**
 * CMP-CONTEXT-PANEL — SCR-04 context zone.
 * Shows opaque project cue when present; Documents link only (ACT-04-08).
 */
export function ContextPanel({ projectId = "" }: ContextPanelProps) {
  const cue = projectId.trim();
  const documentsHref = buildProjectScopedHref("/documents", cue);

  return (
    <div
      data-cmp="CMP-CONTEXT-PANEL"
      data-action-id="ACT-04-02"
      data-project-cue={cue ? "present" : "absent"}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Project context
      </p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
        Context
      </h2>
      {cue ? (
        <dl className="mt-4 space-y-3 text-sm text-slate-700">
          <div>
            <dt className="text-slate-500">Project</dt>
            <dd
              className="mt-1 font-semibold text-slate-950"
              data-project-id={cue}
            >
              {cue}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Requirements</dt>
            <dd className="mt-1">Visible when project work is in progress</dd>
          </div>
          <div>
            <dt className="text-slate-500">Progress</dt>
            <dd className="mt-1">Workspace task in progress</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          No project cue yet. Open a project to bind this workspace context.
        </p>
      )}
      <Link
        href={documentsHref}
        data-action-id="ACT-04-08"
        data-nav-id="OUT-DOCUMENTS"
        className="mt-6 inline-flex text-sm font-semibold text-slate-950 underline underline-offset-4"
      >
        Open documents
      </Link>
    </div>
  );
}
