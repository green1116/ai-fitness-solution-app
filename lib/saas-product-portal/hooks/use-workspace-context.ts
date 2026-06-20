"use client";

import { useWorkspaceContextInternal } from "../workspace-capability/workspace-context-provider";
import type { WorkspaceContextValue } from "../shared/portal-types";

export function useWorkspaceContext(): WorkspaceContextValue {
  const context = useWorkspaceContextInternal();
  if (!context) {
    throw new Error("useWorkspaceContext must be used within WorkspaceContextProvider");
  }
  return context;
}
