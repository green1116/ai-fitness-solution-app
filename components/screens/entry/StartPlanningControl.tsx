"use client";

import { useState, useTransition } from "react";

import {
  FEAT_10_ACTION_ID,
  FEAT_10_COMMAND,
  FEAT_10_ID,
  FEAT_10_INT_ID,
  runStartPlanningCommand,
} from "@/lib/frontend/start-planning-command";

type StartPlanningControlProps = Readonly<{
  actionId?: typeof FEAT_10_ACTION_ID;
}>;

type SessionCue = Readonly<{
  organizationId: string;
  workspaceId: string;
}>;

/**
 * FEAT-10 control — INT-INTAKE-START → ACT-02-01 → StartPlanning (HTTP).
 * Not a navigation link.
 */
export function StartPlanningControl({
  actionId = FEAT_10_ACTION_ID,
}: StartPlanningControlProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<SessionCue | null>(null);

  function onStart() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await runStartPlanningCommand();
        setSession({
          organizationId: result.organizationId,
          workspaceId: result.workspaceId,
        });
        setReady(true);
      } catch (err) {
        setReady(false);
        setSession(null);
        setError(
          err instanceof Error ? err.message : "Unable to start planning session",
        );
      }
    });
  }

  return (
    <div
      className="mt-8"
      data-feat={FEAT_10_ID}
      data-int-id={FEAT_10_INT_ID}
      data-action-id={actionId}
      data-command={FEAT_10_COMMAND}
      data-navigation-only="false"
    >
      <button
        type="button"
        onClick={onStart}
        disabled={pending}
        data-feat={FEAT_10_ID}
        data-int-id={FEAT_10_INT_ID}
        data-action-id={actionId}
        data-command={FEAT_10_COMMAND}
        data-ac="AC-GP01-03"
        className="rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Starting planning…" : "Start fitness space planning"}
      </button>

      {pending ? (
        <p className="mt-3 text-sm text-slate-500" data-meta="loading">
          Starting planning session…
        </p>
      ) : null}

      {ready ? (
        <p
          className="mt-3 text-sm text-emerald-700"
          data-meta="success"
          data-planning-ready="true"
        >
          Planning intake ready for inputs
          {session?.workspaceId ? (
            <span className="ml-2 text-slate-500" data-server-key="SRV-INPUTS">
              workspace {session.workspaceId}
            </span>
          ) : null}
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" data-meta="error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
