"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createWorkspaceAction } from "../client/workspace-api-actions";
import { saasProductPortalWorkspaceDetailPath } from "../shared/portal-constants";

interface WorkspaceCreateFormProps {
  onCreated?: () => void;
}

export function WorkspaceCreateForm({ onCreated }: WorkspaceCreateFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Workspace name is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const workspace = await createWorkspaceAction({ name: trimmed });
      onCreated?.();
      router.push(saasProductPortalWorkspaceDetailPath(workspace.id));
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to create workspace";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h4 className="text-sm font-medium text-white">Create workspace</h4>
      <p className="mt-1 text-xs text-zinc-400">POST /api/saas-product/workspaces · tenant resolved from session</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Workspace name"
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-amber-500 focus:ring-1"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create"}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
