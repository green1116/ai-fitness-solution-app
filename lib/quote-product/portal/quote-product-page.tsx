"use client";

import { useMemo, useState, useTransition } from "react";
import type { QuoteProductSurfaceData } from "../surface/quote-product.surface";
import {
  bindQuoteProductActions,
} from "../surface/quote-product.actions";
import {
  refreshQuoteProductSurfaceAction,
  submitQuoteProductSurfaceAction,
} from "../surface/quote-product.actions.server";
import { describeQuoteUIState } from "../ui/quote-ui.model";
import type { QuoteUIState } from "../ui/quote-ui.model";
import type { QuoteViewModel } from "../ui/quote-ui-view.model";

export interface QuoteProductPageProps {
  surface: QuoteProductSurfaceData;
}

export function QuoteProductPage({ surface }: QuoteProductPageProps) {
  const [title, setTitle] = useState(surface.entry.entry.title);
  const [state, setState] = useState<QuoteUIState>(surface.state);
  const [viewModel, setViewModel] = useState<QuoteViewModel>(surface.viewModel);
  const [isPending, startTransition] = useTransition();

  const actions = useMemo(
    () =>
      bindQuoteProductActions(surface.workspaceId, {
        submitAction: submitQuoteProductSurfaceAction,
        refreshAction: refreshQuoteProductSurfaceAction,
        onStateChange: (nextState, nextViewModel) => {
          setState(nextState);
          setViewModel(nextViewModel);
        },
      }),
    [surface.workspaceId],
  );

  const statusText = useMemo(() => describeQuoteUIState(state), [state]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-zinc-500">V57 Quote Product Surface</p>
        <h1 className="text-2xl font-semibold text-white">{surface.title}</h1>
        <p className="text-sm text-zinc-400">Workspace {surface.workspaceId}</p>
      </header>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
        <h2 className="text-sm font-medium text-white">Quote Entry</h2>
        <p className="mt-1 text-xs text-zinc-500">Submit through the assembled quote product surface.</p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              await actions.submit({ title });
            });
          }}
        >
          <label className="block space-y-2 text-sm">
            <span className="text-zinc-400">{surface.entry.form.titlePlaceholder}</span>
            <input
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={surface.entry.form.titlePlaceholder}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending || viewModel.loading === "EXECUTING"}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {isPending ? "Submitting..." : surface.entry.form.submitLabel}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await actions.refresh();
                });
              }}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-5">
        <h2 className="text-sm font-medium text-white">Quote UI State</h2>
        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Status</dt>
            <dd className="mt-1 font-medium text-white">{state.quoteStatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Readiness</dt>
            <dd className="mt-1 font-medium text-white">{state.readiness}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Loading</dt>
            <dd className="mt-1 font-medium text-white">{viewModel.loading}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Execution Id</dt>
            <dd className="mt-1 font-medium text-white">{state.lastExecutionId ?? "none"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Error</dt>
            <dd className="mt-1 font-medium text-white">{viewModel.error?.message ?? state.lastError ?? "none"}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-zinc-500">{statusText}</p>
      </section>

      {state.quoteStatus === "DONE" && (
        <section className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
          <h2 className="text-sm font-medium text-emerald-200">Execution Result</h2>
          <p className="mt-2 text-sm text-emerald-100">
            Quote execution completed successfully.
            {state.lastExecutionId ? ` Execution ${state.lastExecutionId}` : ""}
          </p>
        </section>
      )}
    </div>
  );
}
