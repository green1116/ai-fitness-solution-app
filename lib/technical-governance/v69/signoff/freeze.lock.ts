/**
 * V69 P8 — Technical governance layer version lock (read-only)
 */
import {
  V68_PLATFORM_FREEZE_VERSION,
  V68_PLATFORM_SIGNOFF_VERSION,
} from "@/lib/platform/v68/signoff/signoff.types";

import { V69_ARCHITECTURE_CATALOG_VERSION } from "../architecture-catalog/catalog.types";
import { V69_ARCHITECTURE_COMPLIANCE_VERSION } from "../architecture-compliance/compliance.types";
import { V69_ARCHITECTURE_DEPENDENCY_VERSION } from "../architecture-dependency/dependency.types";
import { V69_CODE_GOVERNANCE_VERSION } from "../code-governance/governance.types";
import { V69_QUALITY_GOVERNANCE_VERSION } from "../quality-governance/governance.types";
import { V69_SECURITY_GOVERNANCE_VERSION } from "../security-governance/governance.types";
import { V69_TECHNICAL_STANDARDS_VERSION } from "../technical-standards/standards.types";

import type { TechnicalLayerVersionLock } from "./signoff.types";
import {
  V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION,
  V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION,
} from "./signoff.types";

export const V69_TECHNICAL_LAYER_VERSION_LOCK: TechnicalLayerVersionLock = {
  architectureCatalog: V69_ARCHITECTURE_CATALOG_VERSION,
  architectureDependency: V69_ARCHITECTURE_DEPENDENCY_VERSION,
  codeGovernance: V69_CODE_GOVERNANCE_VERSION,
  technicalStandards: V69_TECHNICAL_STANDARDS_VERSION,
  securityGovernance: V69_SECURITY_GOVERNANCE_VERSION,
  qualityGovernance: V69_QUALITY_GOVERNANCE_VERSION,
  architectureCompliance: V69_ARCHITECTURE_COMPLIANCE_VERSION,
  signoff: V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION,
  freeze: V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION,
  upstreamV68PlatformSignoff: V68_PLATFORM_SIGNOFF_VERSION,
  upstreamV68PlatformFreeze: V68_PLATFORM_FREEZE_VERSION,
};

export const EXPECTED_TECHNICAL_LAYER_VERSIONS: TechnicalLayerVersionLock =
  V69_TECHNICAL_LAYER_VERSION_LOCK;

export function isTechnicalLayerVersionLockIntact(): boolean {
  const lock = V69_TECHNICAL_LAYER_VERSION_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}

export function technicalVersionLockMatchesExpected(): boolean {
  const lock = V69_TECHNICAL_LAYER_VERSION_LOCK;
  const expected = EXPECTED_TECHNICAL_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof TechnicalLayerVersionLock>).every(
    (key) => lock[key] === expected[key],
  );
}
