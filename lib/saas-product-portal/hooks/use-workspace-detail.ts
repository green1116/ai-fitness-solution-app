"use client";

import { useCallback, useState } from "react";
import { updateWorkspaceStatusAction } from "../client/workspace-api-actions";
import type { PortalWorkspaceStatus } from "../shared/portal-types";
import { useWorkspace } from "./use-workspace";

export function useWorkspaceDetail(workspaceId: string) {
  const base = useWorkspace(workspaceId);
  const [statusPending, setStatusPending] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (status: PortalWorkspaceStatus) => {
      setStatusPending(true);
      setStatusError(null);
      try {
        await updateWorkspaceStatusAction(workspaceId, { status });
        await base.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update workspace status";
        setStatusError(message);
        throw error;
      } finally {
        setStatusPending(false);
      }
    },
    [base, workspaceId],
  );

  return {
    ...base,
    statusPending,
    statusError,
    updateStatus,
  };
}
