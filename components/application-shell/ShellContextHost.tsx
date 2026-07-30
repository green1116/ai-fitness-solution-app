"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import {
  deriveShellContextLabel,
  resolveProjectCue,
} from "@/lib/frontend/presentation-state";

/**
 * SHELL-CONTEXT presentation host (CMP-SHELL-CONTEXT).
 * ST-CONTEXT / ST-SHARED project cue only — no Domain project resolution.
 */
function ShellContextInner() {
  const searchParams = useSearchParams();
  const routeProjectId = searchParams.get("projectId");
  const projectCue = resolveProjectCue({ routeProjectId });
  const label = deriveShellContextLabel({ projectCue });

  return (
    <div
      data-shell-region="context"
      data-cmp="CMP-SHELL-CONTEXT"
      data-state-class="ST-CONTEXT"
      data-project-cue={projectCue ? "present" : "absent"}
      className="border-b border-slate-200 bg-slate-50"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-6 py-2 text-xs text-slate-500">
        {projectCue ? (
          <>
            <span>Project context</span>
            <span
              className="font-semibold text-slate-800"
              data-project-id={projectCue}
              data-derived="DER-SHELL-CONTEXT-LABEL"
            >
              {label}
            </span>
          </>
        ) : (
          <span data-derived="DER-SHELL-CONTEXT-LABEL">{label}</span>
        )}
      </div>
    </div>
  );
}

export function ShellContextHost() {
  return (
    <Suspense
      fallback={
        <div
          data-shell-region="context"
          data-cmp="CMP-SHELL-CONTEXT"
          data-state-class="ST-CONTEXT"
          data-project-cue="pending"
          className="border-b border-slate-200 bg-slate-50"
        >
          <div className="mx-auto flex w-full max-w-7xl items-center px-6 py-2 text-xs text-slate-500">
            Project context
          </div>
        </div>
      }
    >
      <ShellContextInner />
    </Suspense>
  );
}
