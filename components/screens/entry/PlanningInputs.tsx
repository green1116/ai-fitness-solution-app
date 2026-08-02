"use client";

import { useState, useTransition, type FormEvent } from "react";

import {
  markPlanningInputsAccepted,
  clearPlanningInputsAccepted,
} from "@/lib/frontend/planning-intake-session";
import {
  FEAT_11_ACTION_ID,
  FEAT_11_COMMAND,
  FEAT_11_ID,
  FEAT_11_INT_ID,
  runSubmitPlanningInputsCommand,
  type PlanningInputsDraft,
} from "@/lib/frontend/submit-planning-inputs-command";

const EMPTY_DRAFT: PlanningInputsDraft = {
  companySize: "",
  location: "",
  space: "",
  budget: "",
  goals: "",
};

/**
 * CMP-INPUT-PLANNING — SCR-02 capture zone.
 * FEAT-11: submits through existing SubmitPlanningInputs binding (HTTP).
 * Collects presentation fields only; no feasibility or pricing validation.
 */
export function PlanningInputs() {
  const [draft, setDraft] = useState<PlanningInputsDraft>(EMPTY_DRAFT);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  function update<K extends keyof PlanningInputsDraft>(
    key: K,
    value: PlanningInputsDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await runSubmitPlanningInputsCommand({ draft });
        markPlanningInputsAccepted();
        setAccepted(true);
      } catch (err) {
        clearPlanningInputsAccepted();
        setAccepted(false);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit planning inputs",
        );
      }
    });
  }

  return (
    <div
      data-cmp="CMP-INPUT-PLANNING"
      data-feat={FEAT_11_ID}
      data-int-id={FEAT_11_INT_ID}
      data-action-id={FEAT_11_ACTION_ID}
      data-command={FEAT_11_COMMAND}
      data-navigation-only="false"
      data-local-only="false"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Planning inputs
      </p>
      <form
        className="mt-4"
        onSubmit={onSubmit}
        data-feat={FEAT_11_ID}
        data-action-id={FEAT_11_ACTION_ID}
        data-command={FEAT_11_COMMAND}
        data-ac="AC-GP01-04"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-slate-700">
            Company size
            <input
              name="companySize"
              value={draft.companySize}
              onChange={(e) => update("companySize", e.target.value)}
              className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
              placeholder="e.g. 200–500"
              autoComplete="off"
              required
            />
          </label>
          <label className="block text-sm text-slate-700">
            Location
            <input
              name="location"
              value={draft.location}
              onChange={(e) => update("location", e.target.value)}
              className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
              placeholder="City / region"
              autoComplete="off"
              required
            />
          </label>
          <label className="block text-sm text-slate-700">
            Space
            <input
              name="space"
              value={draft.space}
              onChange={(e) => update("space", e.target.value)}
              className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
              placeholder="Available area"
              autoComplete="off"
              required
            />
          </label>
          <label className="block text-sm text-slate-700">
            Budget
            <input
              name="budget"
              value={draft.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
              placeholder="Investment range"
              autoComplete="off"
              required
            />
          </label>
          <label className="block text-sm text-slate-700 sm:col-span-2">
            Goals
            <input
              name="goals"
              value={draft.goals}
              onChange={(e) => update("goals", e.target.value)}
              className="mt-1.5 w-full border-b border-slate-300 bg-transparent px-0 py-2 text-slate-950 outline-none focus:border-slate-950"
              placeholder="Planning goals"
              autoComplete="off"
              required
            />
          </label>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={pending}
            data-feat={FEAT_11_ID}
            data-int-id={FEAT_11_INT_ID}
            data-action-id={FEAT_11_ACTION_ID}
            data-command={FEAT_11_COMMAND}
            data-ac="AC-GP01-04"
            className="rounded-md bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Submitting inputs…" : "Submit planning inputs"}
          </button>
        </div>
      </form>

      {pending ? (
        <p className="mt-3 text-sm text-slate-500" data-meta="loading">
          Submitting planning inputs…
        </p>
      ) : null}

      {accepted ? (
        <p
          className="mt-3 text-sm text-emerald-700"
          data-meta="success"
          data-inputs-accepted="true"
        >
          Planning inputs accepted on screen
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
