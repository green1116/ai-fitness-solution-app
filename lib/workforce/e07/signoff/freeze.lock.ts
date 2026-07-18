/**
 * E07-P8 — Digital Workforce Platform layer version lock (read-only)
 */

import {
  E07_WORKFORCE_FREEZE_VERSION,
  E07_WORKFORCE_VERSION,
} from "../core/workforce.constants";
import {
  E07_EMPLOYEE_FREEZE_VERSION,
  E07_EMPLOYEE_VERSION,
} from "../employee/employee.constants";
import {
  E07_MARKETPLACE_FREEZE_VERSION,
  E07_MARKETPLACE_VERSION,
} from "../marketplace/role.constants";
import {
  E07_ORCHESTRATION_FREEZE_VERSION,
  E07_ORCHESTRATION_VERSION,
} from "../orchestration/orchestration.constants";
import {
  E07_COLLABORATION_FREEZE_VERSION,
  E07_COLLABORATION_VERSION,
} from "../collaboration/collaboration.constants";
import {
  E07_LEARNING_FREEZE_VERSION,
  E07_LEARNING_VERSION,
} from "../learning/learning.constants";
import {
  E07_ORGANIZATION_FREEZE_VERSION,
  E07_ORGANIZATION_VERSION,
} from "../organization/organization.constants";

import type { LockVersion } from "./signoff.types";
import {
  E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
  E07_WORKFORCE_SIGNOFF_VERSION,
} from "./signoff.types";

export const E07_WORKFORCE_LAYER_VERSION_LOCK: LockVersion = {
  workforce: E07_WORKFORCE_VERSION,
  employee: E07_EMPLOYEE_VERSION,
  marketplace: E07_MARKETPLACE_VERSION,
  orchestration: E07_ORCHESTRATION_VERSION,
  collaboration: E07_COLLABORATION_VERSION,
  learning: E07_LEARNING_VERSION,
  organization: E07_ORGANIZATION_VERSION,
  workforceFreeze: E07_WORKFORCE_FREEZE_VERSION,
  employeeFreeze: E07_EMPLOYEE_FREEZE_VERSION,
  marketplaceFreeze: E07_MARKETPLACE_FREEZE_VERSION,
  orchestrationFreeze: E07_ORCHESTRATION_FREEZE_VERSION,
  collaborationFreeze: E07_COLLABORATION_FREEZE_VERSION,
  learningFreeze: E07_LEARNING_FREEZE_VERSION,
  organizationFreeze: E07_ORGANIZATION_FREEZE_VERSION,
  signoff: E07_WORKFORCE_SIGNOFF_VERSION,
  freeze: E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
};

export const EXPECTED_WORKFORCE_LAYER_VERSIONS: LockVersion =
  E07_WORKFORCE_LAYER_VERSION_LOCK;

export function isWorkforceLayerVersionLockIntact(): boolean {
  const lock = E07_WORKFORCE_LAYER_VERSION_LOCK;
  return Object.values(lock).every(
    (v) => typeof v === "string" && v.length > 0,
  );
}

export function workforceVersionLockMatchesExpected(): boolean {
  const lock = E07_WORKFORCE_LAYER_VERSION_LOCK;
  const expected = EXPECTED_WORKFORCE_LAYER_VERSIONS;
  return (Object.keys(lock) as Array<keyof LockVersion>).every(
    (key) => lock[key] === expected[key],
  );
}
