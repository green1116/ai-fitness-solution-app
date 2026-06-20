"use client";

import { useWorkspaceContext } from "./use-workspace-context";

export function useWorkspaceRefresh(): { refresh: () => Promise<void>; loading: boolean } {
  const { refresh, loading } = useWorkspaceContext();
  return { refresh, loading };
}
