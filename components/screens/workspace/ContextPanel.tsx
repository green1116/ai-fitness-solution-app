"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import { buildProjectScopedHref } from "@/lib/frontend/navigation";
import {
  FEAT_41_ACTION_ID,
  FEAT_41_COMMAND,
  FEAT_41_ID,
  FEAT_41_INT_ID,
  runViewProjectContextCommand,
  type ProjectContextView,
} from "@/lib/frontend/view-project-context-command";

type ContextPanelProps = Readonly<{
  projectId?: string;
}>;

/**
 * CMP-CONTEXT-PANEL — SCR-04 context zone.
 * FEAT-41: loads context through existing ViewProjectContext binding (HTTP).
 * Documents link remains ACT-04-08 (out of FEAT-41 command scope).
 */
export function ContextPanel({ projectId = "" }: ContextPanelProps) {
  const cue = projectId.trim();
  const documentsHref = buildProjectScopedHref("/documents", cue);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [context, setContext] = useState<ProjectContextView | null>(null);
  const [loaded, setLoaded] = useState(false);

  function loadContext() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await runViewProjectContextCommand({
          projectId: cue || undefined,
        });
        setContext(result.context);
        setLoaded(true);
      } catch (err) {
        setLoaded(false);
        setContext(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load project context",
        );
      }
    });
  }

  useEffect(() => {
    if (!cue) return;
    let cancelled = false;
    setError(null);
    startTransition(async () => {
      try {
        const result = await runViewProjectContextCommand({
          projectId: cue,
        });
        if (cancelled) return;
        setContext(result.context);
        setLoaded(true);
      } catch (err) {
        if (cancelled) return;
        setLoaded(false);
        setContext(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load project context",
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [cue]);

  return (
    <div
      data-cmp="CMP-CONTEXT-PANEL"
      data-feat={FEAT_41_ID}
      data-int-id={FEAT_41_INT_ID}
      data-action-id={FEAT_41_ACTION_ID}
      data-command={FEAT_41_COMMAND}
      data-navigation-only="false"
      data-local-only="false"
      data-project-cue={cue ? "present" : "absent"}
      data-context-loaded={loaded ? "true" : "false"}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Project context
      </p>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
        Context
      </h2>

      <div className="mt-4">
        <button
          type="button"
          onClick={loadContext}
          disabled={pending}
          data-feat={FEAT_41_ID}
          data-int-id={FEAT_41_INT_ID}
          data-action-id={FEAT_41_ACTION_ID}
          data-command={FEAT_41_COMMAND}
          data-ac="AC-GP01-07"
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Loading context…" : "View project context"}
        </button>
      </div>

      {pending ? (
        <p className="mt-3 text-sm text-slate-500" data-meta="loading">
          Loading project context…
        </p>
      ) : null}

      {loaded && context ? (
        <dl
          className="mt-4 space-y-3 text-sm text-slate-700"
          data-meta="success"
          data-context-visible="true"
        >
          <div>
            <dt className="text-slate-500">Project</dt>
            <dd
              className="mt-1 font-semibold text-slate-950"
              data-project-id={context.projectId || cue}
            >
              {context.projectLabel}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Requirements</dt>
            <dd className="mt-1" data-context-field="requirements">
              {context.requirementsLabel}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Progress</dt>
            <dd className="mt-1" data-context-field="progress">
              {context.progressLabel}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Documents</dt>
            <dd className="mt-1" data-context-field="documents">
              {context.documentsCue}
            </dd>
          </div>
        </dl>
      ) : cue ? (
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
            <dd className="mt-1">Load context to view requirements</dd>
          </div>
          <div>
            <dt className="text-slate-500">Progress</dt>
            <dd className="mt-1">Load context to view progress</dd>
          </div>
        </dl>
      ) : !pending && !error ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          No project cue yet. Open a project to bind this workspace context.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" data-meta="error" role="alert">
          {error}
        </p>
      ) : null}

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
