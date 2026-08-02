"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  FEAT_12_ACTION_ID,
  FEAT_12_COMMAND,
  FEAT_12_ID,
  FEAT_12_INT_ID,
  FEAT_12_PREREQUISITE_ACTION,
  assertContinueToWorkspaceBindingReady,
  runContinueToWorkspaceCommand,
} from "@/lib/frontend/continue-to-workspace-command";
import {
  getPlanningInputsAcceptedSnapshot,
  subscribePlanningInputsAccepted,
} from "@/lib/frontend/planning-intake-session";

type ContinueToWorkspaceControlProps = Readonly<{
  label: string;
}>;

/**
 * FEAT-12 — Continue to AI Workspace only after ACT-02-02 inputs accepted.
 * Reuses existing ContinueToWorkspace navigateTo "/workspace".
 */
export function ContinueToWorkspaceControl({
  label,
}: ContinueToWorkspaceControlProps) {
  const inputsAccepted = useSyncExternalStore(
    subscribePlanningInputsAccepted,
    getPlanningInputsAcceptedSnapshot,
    () => false,
  );

  const bindingPlan = assertContinueToWorkspaceBindingReady();
  const href = bindingPlan.navigateTo!;

  if (!inputsAccepted) {
    return (
      <div
        data-cmp="CMP-FORWARD-PRIMARY"
        data-feat={FEAT_12_ID}
        data-int-id={FEAT_12_INT_ID}
        data-action-id={FEAT_12_ACTION_ID}
        data-command={FEAT_12_COMMAND}
        data-prerequisite={FEAT_12_PREREQUISITE_ACTION}
        data-prerequisite-met="false"
        data-unconditional-nav="false"
        data-ac="AC-GP01-05"
      >
        <button
          type="button"
          disabled
          data-feat={FEAT_12_ID}
          data-action-id={FEAT_12_ACTION_ID}
          data-command={FEAT_12_COMMAND}
          data-prerequisite={FEAT_12_PREREQUISITE_ACTION}
          data-prerequisite-met="false"
          data-ac="AC-GP01-05"
          className="inline-flex cursor-not-allowed text-sm font-semibold text-slate-400 underline underline-offset-4"
        >
          {label}
        </button>
        <p className="mt-2 text-xs text-slate-500" data-gate="prerequisite">
          Submit planning inputs before continuing to the AI Workspace.
        </p>
      </div>
    );
  }

  function onNavigate() {
    // Enforce prerequisite at click time via existing command helper.
    runContinueToWorkspaceCommand();
  }

  return (
    <div
      data-cmp="CMP-FORWARD-PRIMARY"
      data-feat={FEAT_12_ID}
      data-int-id={FEAT_12_INT_ID}
      data-action-id={FEAT_12_ACTION_ID}
      data-command={FEAT_12_COMMAND}
      data-prerequisite={FEAT_12_PREREQUISITE_ACTION}
      data-prerequisite-met="true"
      data-unconditional-nav="false"
      data-ac="AC-GP01-05"
    >
      <Link
        href={href}
        onClick={onNavigate}
        data-feat={FEAT_12_ID}
        data-int-id={FEAT_12_INT_ID}
        data-action-id={FEAT_12_ACTION_ID}
        data-command={FEAT_12_COMMAND}
        data-prerequisite={FEAT_12_PREREQUISITE_ACTION}
        data-prerequisite-met="true"
        data-navigate-to={href}
        data-ac="AC-GP01-05"
        className="inline-flex text-sm font-semibold text-slate-950 underline underline-offset-4"
      >
        {label}
      </Link>
    </div>
  );
}
