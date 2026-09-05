"use client";

import { createContext, useContext, type ReactNode } from "react";

const WorkspaceOrganizationContext = createContext<string>("");

/**
 * Workspace-local org id from SSR layout. Not an app-global provider.
 */
export function WorkspaceOrganizationProvider({
  organizationId,
  children,
}: {
  organizationId: string;
  children: ReactNode;
}) {
  return (
    <WorkspaceOrganizationContext.Provider value={organizationId.trim()}>
      {children}
    </WorkspaceOrganizationContext.Provider>
  );
}

export function useWorkspaceOrganizationId(): string {
  return useContext(WorkspaceOrganizationContext);
}
