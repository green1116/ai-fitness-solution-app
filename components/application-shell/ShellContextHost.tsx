"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * SHELL-CONTEXT presentation host (CMP-SHELL-CONTEXT).
 * Shows opaque project cue when `projectId` is present — no Domain resolution.
 */
function ShellContextInner() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId")?.trim() ?? "";

  return (
    <div
      data-shell-region="context"
      data-cmp="CMP-SHELL-CONTEXT"
      data-project-cue={projectId ? "present" : "absent"}
      className="border-b border-slate-200 bg-slate-50"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-6 py-2 text-xs text-slate-500">
        {projectId ? (
          <>
            <span>Project context</span>
            <span
              className="font-semibold text-slate-800"
              data-project-id={projectId}
            >
              {projectId}
            </span>
          </>
        ) : (
          <span>Project context</span>
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
