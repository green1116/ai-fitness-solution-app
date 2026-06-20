"use client";

import { useCallback, useEffect, useState } from "react";
import { listWorkspacesAction } from "../client/workspace-api-actions";
import type { PortalWorkspaceListState } from "../shared/portal-types";

const initialState: PortalWorkspaceListState = {
  workspaces: [],
  loading: true,
  error: null,
};

export function useWorkspaces(): PortalWorkspaceListState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<PortalWorkspaceListState>(initialState);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const workspaces = await listWorkspacesAction();
      setState({ workspaces, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workspaces";
      setState({ workspaces: [], loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
