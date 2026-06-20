"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createWorkspaceAction } from "../client/workspace-api-actions";
import { saasProductPortalWorkspaceDetailPath } from "../shared/portal-constants";
import {
  getWorkspaceNameConstraints,
  validateWorkspaceName,
} from "../workspace/workspace-create-validation";
import { WorkspacePanel } from "./workspace-panel";

interface WorkspaceCreateFormEnhancedProps {
  onCreated?: () => void;
}

export function WorkspaceCreateFormEnhanced({ onCreated }: WorkspaceCreateFormEnhancedProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const constraints = useMemo(() => getWorkspaceNameConstraints(), []);
  const validationMessage = useMemo(() => validateWorkspaceName(name), [name]);
  const canSubmit = !submitting && validationMessage === null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateWorkspaceName(name);
    if (message) {
      setError(message);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const workspace = await createWorkspaceAction({ name: name.trim() });
      onCreated?.();
      router.push(saasProductPortalWorkspaceDetailPath(workspace.id));
    } catch (submitError) {
      const submitMessage = submitError instanceof Error ? submitError.message : "Failed to create workspace";
      setError(submitMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspacePanel title="Create workspace" description="POST /api/saas-product/workspaces · tenant from session">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1 text-xs text-zinc-400">
          Workspace name
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g. Enterprise Delivery"
            maxLength={constraints.max}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none ring-amber-500 focus:ring-1"
            disabled={submitting}
          />
        </label>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>
            {name.trim().length}/{constraints.max} · min {constraints.min}
          </span>
          {validationMessage && name.trim().length > 0 ? (
            <span className="text-amber-400">{validationMessage}</span>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create workspace"}
        </button>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </form>
    </WorkspacePanel>
  );
}
