/**
 * E07-P3 — Role Agent Marketplace types
 * Role marketplace above E07 AI Employee Runtime
 */

import type { EmployeeExecutionResult } from "../employee/employee.types";
import {
  E07_MARKETPLACE_BASE,
  E07_MARKETPLACE_FREEZE_VERSION,
  E07_MARKETPLACE_ID,
  E07_MARKETPLACE_VERSION,
  ROLE_CATEGORIES,
  ROLE_DEPLOY_PHASES,
  ROLE_LISTING_STATUSES,
} from "./role.constants";

export type RoleCategory = (typeof ROLE_CATEGORIES)[number];
export type RoleListingStatus = (typeof ROLE_LISTING_STATUSES)[number];
export type RoleDeployPhase = (typeof ROLE_DEPLOY_PHASES)[number];

export type RoleListing = {
  id: string;
  name: string;
  category: RoleCategory;
  title: string;
  description: string;
  /** Bound E07 AI employee id */
  employeeId: string;
  listingStatus: RoleListingStatus;
  /** Declarative deploy tags for marketplace filtering */
  tags: string[];
  optional: boolean;
  readOnly: true;
};

export type RoleDeploymentResult = {
  success: boolean;
  roleId: string;
  category: RoleCategory;
  employeeId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  employee?: EmployeeExecutionResult;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type RoleRegistryManifest = {
  marketplaceId: typeof E07_MARKETPLACE_ID;
  version: typeof E07_MARKETPLACE_VERSION;
  freezeVersion: typeof E07_MARKETPLACE_FREEZE_VERSION;
  base: typeof E07_MARKETPLACE_BASE;
  roleCount: number;
  categories: RoleCategory[];
  roles: RoleListing[];
  catalogComplete: boolean;
  readOnly: true;
};
