import type { SessionUser } from "../tenant-context/context-types";

export interface SaasSessionRecord extends SessionUser {
  valid: boolean;
}

export interface SaasRuntimeSessionInput {
  userId: string;
  email: string;
}

export interface SaasRequestSessionHeaders {
  userId?: string | null;
  email?: string | null;
}
