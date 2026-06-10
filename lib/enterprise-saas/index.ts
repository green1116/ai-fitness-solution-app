/**
 * V10.5 Enterprise SaaS Foundation — multi-tenant organization model.
 * Read-only runtime style; no real auth/RBAC; no production engine changes.
 */

export * from "./shared/types";
export { runStage, finalizeRuntime, assertRuntimeSuccess } from "./shared/runtime";
export * from "./tenant";
export * from "./workspace";
export * from "./user";
export * from "./role";
export * from "./permission";
export * from "./seat";
export * from "./usage";
export * from "./dashboard";
export {
  ENTERPRISE_SAAS_DOMAINS,
  buildEnterpriseSaasEvidence,
} from "./evidence";
