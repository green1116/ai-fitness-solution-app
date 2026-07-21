/**
 * E11-P4 — Cloud Resource Governance types
 */

import type { CloudMetadata } from "../types/cloud.types";
import {
  ADMISSION_DECISIONS,
  ALLOCATION_STATUSES,
  E11_GOVERNANCE_BASE,
  E11_GOVERNANCE_FREEZE_VERSION,
  E11_GOVERNANCE_ID,
  E11_GOVERNANCE_VERSION,
  GOVERNANCE_MANAGER_STATUSES,
  GOVERNANCE_RESOURCE_TYPES,
  THROTTLE_MODES,
  WORKLOAD_PRIORITIES,
} from "./governance.constants";

export type GovernanceResourceType =
  (typeof GOVERNANCE_RESOURCE_TYPES)[number];
export type AllocationStatus = (typeof ALLOCATION_STATUSES)[number];
export type WorkloadPriority = (typeof WORKLOAD_PRIORITIES)[number];
export type ThrottleMode = (typeof THROTTLE_MODES)[number];
export type AdmissionDecision = (typeof ADMISSION_DECISIONS)[number];
export type GovernanceManagerStatus =
  (typeof GOVERNANCE_MANAGER_STATUSES)[number];

export type { CloudMetadata };

/** Cloud governance resource pool (capacity model). */
export type GovernanceResource = {
  id: string;
  name: string;
  type: GovernanceResourceType;
  capacity: number;
  allocated: number;
  runtimeId?: string;
  tenantId?: string;
  metadata: CloudMetadata;
  createdAt: string;
};

export type RegisterGovernanceResourceInput = {
  id: string;
  name: string;
  type: GovernanceResourceType;
  capacity: number;
  runtimeId?: string;
  tenantId?: string;
  metadata?: CloudMetadata;
};

export type ResourceAllocation = {
  id: string;
  resourceId: string;
  tenantId: string;
  runtimeId?: string;
  amount: number;
  priority: WorkloadPriority;
  status: AllocationStatus;
  createdAt: string;
  releasedAt?: string;
  reason?: string;
};

export type AllocateResourceInput = {
  id?: string;
  resourceId: string;
  tenantId: string;
  runtimeId?: string;
  amount: number;
  priority?: WorkloadPriority;
};

export type CapacitySnapshot = {
  resourceId: string;
  type: GovernanceResourceType;
  capacity: number;
  allocated: number;
  available: number;
  utilization: number;
  snappedAt: string;
};

export type ThrottlePolicy = {
  id: string;
  name: string;
  mode: ThrottleMode;
  /** Utilization threshold (0-1) that triggers soft/hard throttle. */
  threshold: number;
  /** Max concurrent ACTIVE allocations under HARD mode. */
  maxConcurrent?: number;
  tenantId?: string;
  metadata: CloudMetadata;
  createdAt: string;
};

export type CreateThrottlePolicyInput = {
  id?: string;
  name: string;
  mode?: ThrottleMode;
  threshold?: number;
  maxConcurrent?: number;
  tenantId?: string;
  metadata?: CloudMetadata;
};

export type AdmissionRequest = {
  tenantId: string;
  resourceId: string;
  runtimeId?: string;
  amount: number;
  priority?: WorkloadPriority;
  /** Optional execution task kind hint. */
  workloadKind?: string;
};

export type AdmissionResult = {
  decision: AdmissionDecision;
  tenantId: string;
  resourceId: string;
  reason: string;
  priority: WorkloadPriority;
  checkedAt: string;
};

export type GovernanceMetrics = {
  resourceCount: number;
  totalCapacity: number;
  totalAllocated: number;
  activeAllocations: number;
  deniedAllocations: number;
  admittedCount: number;
  rejectedCount: number;
  throttledCount: number;
  averageUtilization: number;
  byPriority: Record<WorkloadPriority, number>;
  snappedAt: string;
};

export type GovernanceRegistryManifest = {
  governanceId: typeof E11_GOVERNANCE_ID;
  version: typeof E11_GOVERNANCE_VERSION;
  freezeVersion: typeof E11_GOVERNANCE_FREEZE_VERSION;
  base: typeof E11_GOVERNANCE_BASE;
  resourceCount: number;
  allocationCount: number;
  throttlePolicyCount: number;
};
