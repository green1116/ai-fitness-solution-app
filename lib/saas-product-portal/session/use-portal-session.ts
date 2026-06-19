"use client";

import { useCallback, useEffect, useState } from "react";
import type { PortalSessionState } from "../shared/portal-types";
import { fetchPortalSessionViaMeAction } from "./fetch-portal-session-action";

const initialState: PortalSessionState = {
  user: null,
  tenant: null,
  membership: null,
  sessionSource: "none",
  loading: true,
  error: null,
};

export function usePortalSession(): PortalSessionState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<PortalSessionState>(initialState);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const next = await fetchPortalSessionViaMeAction();
      setState(next);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load portal session";
      setState({
        user: null,
        tenant: null,
        membership: null,
        sessionSource: "none",
        loading: false,
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
