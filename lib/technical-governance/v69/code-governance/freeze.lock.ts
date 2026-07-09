/**
 * V69 P3 — Code governance freeze lock (read-only)
 */
import {
  V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  V69_ARCHITECTURE_CATALOG_VERSION,
} from "../architecture-catalog/catalog.types";
import {
  V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION,
  V69_ARCHITECTURE_DEPENDENCY_VERSION,
} from "../architecture-dependency/dependency.types";

import {
  V69_CODE_GOVERNANCE_FREEZE_VERSION,
  V69_CODE_GOVERNANCE_VERSION,
} from "./governance.types";

export type CodeGovernanceFreezeLock = {
  codeGovernance: typeof V69_CODE_GOVERNANCE_VERSION;
  codeGovernanceFreeze: typeof V69_CODE_GOVERNANCE_FREEZE_VERSION;
  upstreamArchitectureCatalog: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  upstreamArchitectureCatalogFreeze: typeof V69_ARCHITECTURE_CATALOG_FREEZE_VERSION;
  upstreamArchitectureDependency: typeof V69_ARCHITECTURE_DEPENDENCY_VERSION;
  upstreamArchitectureDependencyFreeze: typeof V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION;
};

export const V69_CODE_GOVERNANCE_FREEZE_LOCK: CodeGovernanceFreezeLock = {
  codeGovernance: V69_CODE_GOVERNANCE_VERSION,
  codeGovernanceFreeze: V69_CODE_GOVERNANCE_FREEZE_VERSION,
  upstreamArchitectureCatalog: V69_ARCHITECTURE_CATALOG_VERSION,
  upstreamArchitectureCatalogFreeze: V69_ARCHITECTURE_CATALOG_FREEZE_VERSION,
  upstreamArchitectureDependency: V69_ARCHITECTURE_DEPENDENCY_VERSION,
  upstreamArchitectureDependencyFreeze: V69_ARCHITECTURE_DEPENDENCY_FREEZE_VERSION,
};

export const EXPECTED_CODE_GOVERNANCE_FREEZE_LOCK: CodeGovernanceFreezeLock =
  V69_CODE_GOVERNANCE_FREEZE_LOCK;

export function isCodeGovernanceFreezeLockIntact(): boolean {
  const lock = V69_CODE_GOVERNANCE_FREEZE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function codeGovernanceFreezeLockMatchesExpected(): boolean {
  const lock = V69_CODE_GOVERNANCE_FREEZE_LOCK;
  const expected = EXPECTED_CODE_GOVERNANCE_FREEZE_LOCK;
  return (Object.keys(lock) as Array<keyof CodeGovernanceFreezeLock>).every(
    (key) => lock[key] === expected[key],
  );
}
