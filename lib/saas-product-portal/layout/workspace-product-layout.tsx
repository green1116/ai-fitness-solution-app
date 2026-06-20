"use client";

import type { ReactNode } from "react";
import { WorkspaceContextProvider } from "../workspace-capability/workspace-context-provider";
import { WorkspaceProductShell } from "./workspace-product-shell";

interface WorkspaceProductLayoutProps {
  workspaceId: string;
  children: ReactNode;
}

export function WorkspaceProductLayout({ workspaceId, children }: WorkspaceProductLayoutProps) {
  return (
    <WorkspaceContextProvider workspaceId={workspaceId}>
      <WorkspaceProductShell>{children}</WorkspaceProductShell>
    </WorkspaceContextProvider>
  );
}
