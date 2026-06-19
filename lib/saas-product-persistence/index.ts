export * from "./shared/persistence-constants";
export * from "./shared/persistence-types";
export * from "./shared/persistence-errors";
export { validatePersistenceP1 } from "./validation/validate-persistence-p1";

export const SAAS_PRODUCT_PERSISTENCE_META = {
  version: "v50-production-persistence-p1",
  tag: "v50-production-persistence-p1",
  phases: ["v50-production-persistence-p1"],
} as const;
