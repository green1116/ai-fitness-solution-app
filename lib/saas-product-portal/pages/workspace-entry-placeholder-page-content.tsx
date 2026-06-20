"use client";

import { getWorkspaceProductEntry } from "../workspace-capability/workspace-entry-registry";
import { WorkspacePanel } from "../components/workspace-panel";
import { useWorkspaceContext } from "../hooks/use-workspace-context";

interface WorkspaceEntryPlaceholderPageContentProps {
  entryKey: string;
}

export function WorkspaceEntryPlaceholderPageContent({ entryKey }: WorkspaceEntryPlaceholderPageContentProps) {
  const { metadata, loading } = useWorkspaceContext();
  const entry = getWorkspaceProductEntry(entryKey);

  if (!entry) {
    return (
      <WorkspacePanel title="Unknown entry" description="Entry is not registered">
        <p className="text-sm text-red-300">Unknown workspace product entry: {entryKey}</p>
      </WorkspacePanel>
    );
  }

  return (
    <WorkspacePanel
      title={entry.label}
      description="P5 entry-only surface · business logic not implemented"
    >
      <div className="space-y-3 text-sm text-zinc-300">
        <p>{entry.description}</p>
        <p>
          Status: <span className="text-amber-300">{entry.status}</span> · capability:{" "}
          <span className="text-amber-300">{entry.capability}</span>
        </p>
        {!loading && metadata ? (
          <p className="text-xs text-zinc-500">
            Workspace context: {metadata.name} ({metadata.id})
          </p>
        ) : null}
        <p className="rounded-lg border border-dashed border-zinc-700 bg-zinc-950/50 p-4 text-xs text-zinc-500">
          Business layer mount reserved. No Quote / Workflow / Project runtime wired in P5.
        </p>
      </div>
    </WorkspacePanel>
  );
}
