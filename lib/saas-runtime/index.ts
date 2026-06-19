export * from "./tenant-context/tenant-context";
export * from "./auth/auth-types";
export * from "./auth/auth-validation";
export {
  clearRuntimeSession,
  getCurrentSession,
  getRuntimeSessionSnapshot,
  requireCurrentSession,
  setRuntimeSession,
} from "./auth/session-service";
export * from "./permissions/permission-resolver";

export const SAAS_RUNTIME_VERSION = "v48-saas-runtime-p2" as const;
export const SAAS_RUNTIME_P2_TAG = "v48-saas-runtime-p2" as const;
