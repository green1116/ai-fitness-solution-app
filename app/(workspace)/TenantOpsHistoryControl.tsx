"use client";

import { useState, useTransition } from "react";

import { useWorkspaceOrganizationId } from "./WorkspaceOrganizationProvider";
import {
  loadTenantOpsHistory,
  type TenantOpsHistoryLoadEntry,
} from "./load-tenant-ops-history";

export function TenantOpsHistoryControl({
  itemId,
  customerId,
}: {
  itemId: string;
  customerId: string;
}) {
  const organizationId = useWorkspaceOrganizationId();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [entries, setEntries] = useState<readonly TenantOpsHistoryLoadEntry[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onToggle() {
    const next = !open;
    setOpen(next);
    if (!next || loaded || pending) return;

    startTransition(async () => {
      setError(null);
      const result = await loadTenantOpsHistory({
        organizationId,
        customerId,
        itemId,
      });
      if (!result.ok) {
        setError(result.reason);
        setEntries([]);
        setLoaded(true);
        return;
      }
      setEntries(result.entries);
      setLoaded(true);
    });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className="text-xs uppercase tracking-wide text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
      >
        {open ? "Hide history" : "History"}
        {pending ? "…" : ""}
      </button>
      {open ? (
        <div className="mt-1 space-y-1 border-l border-zinc-800 pl-2">
          {error ? (
            <p className="text-xs text-zinc-500">{error}</p>
          ) : null}
          {!pending && loaded && !error && entries.length === 0 ? (
            <p className="text-xs text-zinc-600">No ops history</p>
          ) : null}
          {entries.map((entry) => (
            <div key={entry.id} className="text-xs text-zinc-500">
              <span className="uppercase tracking-wide text-zinc-400">
                {entry.type.replace("tenant_ops.", "")}
              </span>
              {entry.result ? (
                <span className="ml-1 text-zinc-400">{entry.result}</span>
              ) : null}
              {entry.failureClass ? (
                <span className="ml-1 text-zinc-600">{entry.failureClass}</span>
              ) : null}
              <span className="ml-1 text-zinc-600">
                {entry.timestamp.slice(0, 19).replace("T", " ")}
              </span>
              {entry.reason ? (
                <p className="text-zinc-600">{entry.reason}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
