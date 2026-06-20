"use client";

import type { PortalWorkspace } from "../shared/portal-types";
import { formatPortalRelativeTimestamp } from "../workspace/workspace-format";
import { saasProductPortalWorkspaceDetailPath } from "../shared/portal-constants";
import Link from "next/link";

interface WorkspaceListProps {
  workspaces: PortalWorkspace[];
}

export function WorkspaceListEnhanced({ workspaces }: WorkspaceListProps) {
  return (
    <ul className="divide-y divide-zinc-800 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60">
      {workspaces.map((workspace) => (
        <li key={workspace.id}>
          <Link
            href={saasProductPortalWorkspaceDetailPath(workspace.id)}
            className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-zinc-900"
          >
            <div>
              <p className="font-medium text-white">{workspace.name}</p>
              <p className="text-xs text-zinc-500">{workspace.id}</p>
              <p className="mt-1 text-xs text-zinc-500">Updated {formatPortalRelativeTimestamp(workspace.updatedAt)}</p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                workspace.status === "ACTIVE"
                  ? "bg-emerald-950/60 text-emerald-300"
                  : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {workspace.status}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
