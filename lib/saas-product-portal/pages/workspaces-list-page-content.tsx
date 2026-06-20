"use client";

import { useRef } from "react";
import { WorkspaceCreateFormEnhanced } from "../components/workspace-create-form-enhanced";
import { WorkspaceEmptyState } from "../components/workspace-empty-state";
import { WorkspaceListEnhanced } from "../components/workspace-list-enhanced";
import { WorkspaceListToolbar } from "../components/workspace-list-toolbar";
import { WorkspacePanel } from "../components/workspace-panel";
import { useWorkspaceList } from "../hooks/use-workspace-list";

export function WorkspacesListPageContent() {
  const { loading, error, refresh, query, view, setStatusFilter, setSearch, setSort, setPage, loadMore } =
    useWorkspaceList();
  const createFormRef = useRef<HTMLDivElement | null>(null);

  function scrollToCreateForm() {
    createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const filteredEmpty = !loading && !error && view.total === 0;

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h3 className="text-2xl font-semibold">Workspaces</h3>
        <p className="text-sm text-zinc-400">
          V52 P4 deepening · filter / sort / pagination + status actions via /api/saas-product/*
        </p>
      </section>

      <WorkspaceListToolbar
        query={query}
        total={view.total}
        onStatusFilterChange={setStatusFilter}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      {loading ? (
        <WorkspacePanel title="Loading" description="Fetching tenant workspaces">
          <p className="text-sm text-zinc-400">Loading workspaces...</p>
        </WorkspacePanel>
      ) : null}

      {error ? (
        <section className="rounded-xl border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300">
          {error}
        </section>
      ) : null}

      {filteredEmpty ? <WorkspaceEmptyState onCreateClick={scrollToCreateForm} /> : null}

      {!loading && !error && view.items.length > 0 ? <WorkspaceListEnhanced workspaces={view.items} /> : null}

      {!loading && !error && view.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3 text-sm text-zinc-400">
          <span>
            Page {view.page} / {view.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={view.page <= 1}
              onClick={() => setPage(view.page - 1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 disabled:opacity-50"
            >
              Previous
            </button>
            {view.hasMore ? (
              <button
                type="button"
                onClick={loadMore}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 hover:bg-zinc-900"
              >
                Load more
              </button>
            ) : null}
            <button
              type="button"
              disabled={view.page >= view.totalPages}
              onClick={() => setPage(view.page + 1)}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <div ref={createFormRef}>
        <WorkspaceCreateFormEnhanced onCreated={() => void refresh()} />
      </div>
    </div>
  );
}
