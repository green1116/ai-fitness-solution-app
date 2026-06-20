"use client";

import { useCallback, useEffect, useState } from "react";
import { getWorkspaceAction } from "../client/workspace-api-actions";
import type { PortalWorkspaceDetailState } from "../shared/portal-types";

const initialState: PortalWorkspaceDetailState = {
  workspace: null,
  loading: true,
  error: null,
};

export function useWorkspace(workspaceId: string): PortalWorkspaceDetailState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<PortalWorkspaceDetailState>(initialState);

  const refresh = useCallback(async () => {
    if (!workspaceId.trim()) {
      setState({ workspace: null, loading: false, error: "Workspace id is required" });
      return;
    }

    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const workspace = await getWorkspaceAction(workspaceId);
      setState({ workspace, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workspace";
      setState({ workspace: null, loading: false, error: message });
    }
  }, [workspaceId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
