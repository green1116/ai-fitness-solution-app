export * from "./shared/persistence-constants";
export * from "./shared/persistence-types";
export * from "./shared/persistence-errors";
export * from "./contracts/persistence-contracts";
export * from "./mappers";
export * from "./repositories";
export * from "./runtime";
export * from "./parity";
export * from "./audit";
export * from "./freeze";
export { validatePersistenceP1 } from "./validation/validate-persistence-p1";
export { validatePersistenceP2 } from "./validation/validate-persistence-p2";
export { validatePersistenceP3 } from "./validation/validate-persistence-p3";
export { validatePersistenceP4 } from "./validation/validate-persistence-p4";
export { validatePersistenceP5 } from "./validation/validate-persistence-p5";
export { validatePersistenceP6 } from "./validation/validate-persistence-p6";
export { validatePersistenceP7 } from "./validation/validate-persistence-p7";
export {
  validatePersistenceP8Freeze,
  validatePersistenceP8Runtime,
} from "./validation/validate-persistence-p8";

import {
  SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
  SAAS_PRODUCT_PERSISTENCE_P8_TAG,
} from "./shared/persistence-constants";

export const SAAS_PRODUCT_PERSISTENCE_META = {
  version: SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
  tag: SAAS_PRODUCT_PERSISTENCE_FINAL_TAG,
  p8Tag: SAAS_PRODUCT_PERSISTENCE_P8_TAG,
  status: "frozen",
  readyToFreeze: false,
  frozen: true,
  phases: [
    "v50-production-persistence-p1",
    "v50-production-persistence-p2",
    "v50-production-persistence-p3",
    "v50-production-persistence-p4",
    "v50-production-persistence-p5",
    "v50-production-persistence-p6",
    "v50-production-persistence-p7",
    "v50-production-persistence-p8",
    "v50-production-persistence-final",
  ],
  nextHorizon: "V51 API Exposure Layer",
} as const;
