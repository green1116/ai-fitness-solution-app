"use client";

import type { WorkspaceListQuery } from "../shared/portal-types";

interface WorkspaceListToolbarProps {
  query: WorkspaceListQuery;
  total: number;
  onStatusFilterChange: (value: WorkspaceListQuery["statusFilter"]) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (field: WorkspaceListQuery["sortField"], direction: WorkspaceListQuery["sortDirection"]) => void;
}

export function WorkspaceListToolbar({
  query,
  total,
  onStatusFilterChange,
  onSearchChange,
  onSortChange,
}: WorkspaceListToolbarProps) {
  return (
    <div className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-3">
      <label className="space-y-1 text-xs text-zinc-400">
        Search
        <input
          value={query.search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Name or ID"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-amber-500 focus:ring-1"
        />
      </label>

      <label className="space-y-1 text-xs text-zinc-400">
        Status
        <select
          value={query.statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as WorkspaceListQuery["statusFilter"])}
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
        >
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </label>

      <label className="space-y-1 text-xs text-zinc-400">
        Sort
        <div className="mt-1 flex gap-2">
          <select
            value={query.sortField}
            onChange={(event) => onSortChange(event.target.value as WorkspaceListQuery["sortField"], query.sortDirection)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="updatedAt">Updated</option>
            <option value="createdAt">Created</option>
            <option value="name">Name</option>
          </select>
          <select
            value={query.sortDirection}
            onChange={(event) =>
              onSortChange(query.sortField, event.target.value as WorkspaceListQuery["sortDirection"])
            }
            className="w-28 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </label>

      <p className="text-xs text-zinc-500 md:col-span-3">{total} workspace(s) after filter</p>
    </div>
  );
}
