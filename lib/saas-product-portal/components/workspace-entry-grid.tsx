"use client";

import Link from "next/link";
import { WORKSPACE_PRODUCT_ENTRY_REGISTRY } from "../workspace-capability/workspace-entry-registry";
import { saasProductPortalWorkspaceProductPath } from "../shared/portal-constants";
import { WorkspacePanel } from "./workspace-panel";

interface WorkspaceEntryGridProps {
  workspaceId: string;
}

export function WorkspaceEntryGrid({ workspaceId }: WorkspaceEntryGridProps) {
  return (
    <WorkspacePanel title="Product entry registry" description="Registered capability mounts · entry-only in P5">
      <ul className="grid gap-3 md:grid-cols-2">
        {WORKSPACE_PRODUCT_ENTRY_REGISTRY.map((entry) => {
          const href =
            entry.status === "registered"
              ? saasProductPortalWorkspaceProductPath(workspaceId, entry.segment)
              : undefined;

          const content = (
            <>
              <p className="font-medium text-white">{entry.label}</p>
              <p className="mt-1 text-xs text-zinc-400">{entry.description}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-amber-400/90">
                {entry.status} · {entry.capability}
              </p>
            </>
          );

          return (
            <li key={entry.key} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              {href ? (
                <Link href={href} className="block transition hover:text-amber-100">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </WorkspacePanel>
  );
}
