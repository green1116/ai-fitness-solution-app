"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useWorkspaceContext } from "../hooks/use-workspace-context";
import { SAAS_PRODUCT_PORTAL_WORKSPACES_PATH } from "../shared/portal-constants";
import { WorkspaceProductNav } from "../components/workspace-product-nav";

interface WorkspaceProductShellProps {
  children: ReactNode;
}

export function WorkspaceProductShell({ children }: WorkspaceProductShellProps) {
  const { workspaceId, workspace, loading } = useWorkspaceContext();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Link href={SAAS_PRODUCT_PORTAL_WORKSPACES_PATH} className="text-xs text-amber-400 hover:text-amber-300">
          ← Back to workspaces
        </Link>
        <h3 className="text-2xl font-semibold">{loading ? "Workspace" : (workspace?.name ?? "Workspace")}</h3>
        <p className="text-sm text-zinc-400">V52 P5 product capability · shared workspace context</p>
      </section>

      <WorkspaceProductNav workspaceId={workspaceId} />
      {children}
    </div>
  );
}
