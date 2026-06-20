"use client";

import { ProjectEntryCard } from "../components/project-entry-card";
import { ProjectEntryEmptyState } from "../components/project-entry-empty-state";
import { ProjectEntryHeader } from "../components/project-entry-header";
import { WorkspacePanel } from "../components/workspace-panel";
import { listProjectEntryPlaceholderCards } from "../project-entry/project-entry-placeholder-cards";
import { getProjectEntryStatusView } from "../project-entry/project-entry-status";

export function ProjectEntryPageContent() {
  const statusView = getProjectEntryStatusView();
  const placeholderCards = listProjectEntryPlaceholderCards();

  return (
    <div className="space-y-6">
      <ProjectEntryHeader />

      <WorkspacePanel title="Project Entry Status" description="Read-only entry mount status">
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Phase</dt>
            <dd className="mt-1 font-medium text-white">{statusView.phase}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Layer</dt>
            <dd className="mt-1 font-medium text-white">{statusView.layer}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Capability</dt>
            <dd className="mt-1 font-medium text-amber-200">{statusView.capability}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Project Runtime</dt>
            <dd className="mt-1 font-medium text-white">{statusView.projectRuntime ? "enabled" : "disabled"}</dd>
          </div>
        </dl>
      </WorkspacePanel>

      <WorkspacePanel title="Placeholder Cards" description="Reserved project surfaces · entry-only">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {placeholderCards.map((card) => (
            <ProjectEntryCard key={card.key} card={card} />
          ))}
        </div>
      </WorkspacePanel>

      <ProjectEntryEmptyState />
    </div>
  );
}
