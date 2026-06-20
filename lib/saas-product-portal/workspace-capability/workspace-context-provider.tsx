"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getWorkspaceAction } from "../client/workspace-api-actions";
import type { PortalWorkspace, WorkspaceContextValue } from "../shared/portal-types";
import { buildWorkspaceMetadataView } from "./workspace-metadata-view";

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

interface WorkspaceContextProviderProps {
  workspaceId: string;
  children: ReactNode;
}

export function WorkspaceContextProvider({ workspaceId, children }: WorkspaceContextProviderProps) {
  const [workspace, setWorkspace] = useState<PortalWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!workspaceId.trim()) {
      setWorkspace(null);
      setLoading(false);
      setError("Workspace id is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await getWorkspaceAction(workspaceId);
      setWorkspace(next);
      setLoading(false);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Failed to load workspace context";
      setWorkspace(null);
      setLoading(false);
      setError(message);
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      workspace,
      status: workspace?.status ?? null,
      metadata: workspace ? buildWorkspaceMetadataView(workspace) : null,
      loading,
      error,
      refresh,
    }),
    [workspaceId, workspace, loading, error, refresh],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContextInternal(): WorkspaceContextValue | null {
  return useContext(WorkspaceContext);
}
