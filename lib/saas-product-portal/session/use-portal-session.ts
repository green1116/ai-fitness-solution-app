"use client";

import { useCallback, useEffect, useState } from "react";
import { SAAS_PRODUCT_API_ME_PATH } from "../shared/portal-constants";
import { PORTAL_ERROR_CODES } from "../shared/portal-errors";
import type { PortalMeData, PortalSessionState } from "../shared/portal-types";
import { createSaasProductApiClient } from "../client/saas-product-api-client";

const initialState: PortalSessionState = {
  user: null,
  tenant: null,
  loading: true,
  error: null,
};

export function usePortalSession(): PortalSessionState & { refresh: () => Promise<void> } {
  const [state, setState] = useState<PortalSessionState>(initialState);

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    const client = createSaasProductApiClient();

    try {
      const me = await client.get<PortalMeData>(SAAS_PRODUCT_API_ME_PATH);
      setState({
        user: { userId: me.userId },
        tenant: { tenantId: me.tenantId },
        loading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load portal session";
      const unauthorized =
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === PORTAL_ERROR_CODES.PORTAL_UNAUTHORIZED;
      setState({
        user: null,
        tenant: null,
        loading: false,
        error: unauthorized ? "Unauthorized" : message,
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
