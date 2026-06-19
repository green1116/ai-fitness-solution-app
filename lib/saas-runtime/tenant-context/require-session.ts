import type { SaasRequestSessionHeaders } from "../auth/auth-types";
import { requireCurrentSession } from "../auth/session-service";
import type { SessionUser } from "./context-types";

export function requireSession(headers?: SaasRequestSessionHeaders): SessionUser {
  return requireCurrentSession(headers);
}
