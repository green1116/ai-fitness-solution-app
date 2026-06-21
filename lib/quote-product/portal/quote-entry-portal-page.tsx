"use client";

import { useMemo, useState, useTransition } from "react";
import type { QuoteEntrySurface } from "../entry/quote-entry.types";
import { submitQuoteEntryFormAction } from "../ui/quote-ui.actions";
import { describeQuoteUIState } from "../ui/quote-ui.model";

export interface QuoteEntryPortalPageProps {
  surface: QuoteEntrySurface;
}

export function QuoteEntryPortalPage({ surface }: QuoteEntryPortalPageProps) {
  const [title, setTitle] = useState(surface.entry.title);
  const [uiState, setUiState] = useState(surface.uiState);
  const [isPending, startTransition] = useTransition();
  const statusText = useMemo(() => describeQuoteUIState(uiState), [uiState]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">V57 Quote Entry Layer</p>
        <h1 className="text-2xl font-semibold text-white">{surface.title}</h1>
        <p className="text-sm text-zinc-400">Workspace {surface.workspaceId}</p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
        <h2 className="text-sm font-medium text-white">Quote Entry Form</h2>
        <p className="mt-1 text-xs text-zinc-500">Submit a quote entry through the product service layer.</p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const result = await submitQuoteEntryFormAction({
                workspaceId: surface.workspaceId,
                title,
              });
              setUiState(result.uiState);
            });
          }}
        >
          <label className="block space-y-2 text-sm">
            <span className="text-zinc-400">{surface.form.titlePlaceholder}</span>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={surface.form.titlePlaceholder}
            />
          </label>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {isPending ? "Submitting..." : surface.form.submitLabel}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
        <h2 className="text-sm font-medium text-white">Quote UI State</h2>
        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Status</dt>
            <dd className="mt-1 font-medium text-white">{uiState.quoteStatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Readiness</dt>
            <dd className="mt-1 font-medium text-white">{uiState.readiness}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Execution Id</dt>
            <dd className="mt-1 font-medium text-white">{uiState.lastExecutionId ?? "none"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Error</dt>
            <dd className="mt-1 font-medium text-white">{uiState.lastError ?? "none"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-zinc-500">{statusText}</p>
      </section>
    </div>
  );
}
