"use server";

import type { PortalSessionState } from "../shared/portal-types";
import { fetchPortalSessionViaMe } from "./resolve-portal-session";

export async function fetchPortalSessionViaMeAction(): Promise<PortalSessionState> {
  return fetchPortalSessionViaMe();
}
