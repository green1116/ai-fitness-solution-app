/**
 * E10-P3 — Platform Resource Manager types
 * Resource layer above E10 Platform Runtime
 */

import type { PlatformMetadata } from "../core/platform.types";
import {
  ALLOCATION_STATUSES,
  E10_RESOURCE_BASE,
  E10_RESOURCE_FREEZE_VERSION,
  E10_RESOURCE_ID,
  E10_RESOURCE_VERSION,
  RESOURCE_MANAGER_STATUSES,
  RESOURCE_POOL_STATUSES,
  RESOURCE_TYPES,
} from "./resource.constants";

export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type ResourcePoolStatus = (typeof RESOURCE_POOL_STATUSES)[number];
export type AllocationStatus = (typeof ALLOCATION_STATUSES)[number];
export type ResourceManagerStatus =
  (typeof RESOURCE_MANAGER_STATUSES)[number];

export type { PlatformMetadata };

export type ResourcePool = {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  reserved: number;
  status: ResourcePoolStatus;
  /** Optional binding to E10-P2 runtime service id */
  serviceId?: string;
  metadata: PlatformMetadata;
};

export type CreateResourcePoolInput = {
  id: string;
  name: string;
  type: ResourceType;
  capacity: number;
  serviceId?: string;
  metadata?: PlatformMetadata;
};

export type ResourceQuota = {
  id: string;
  ownerId: string;
  type: ResourceType;
  limit: number;
  used: number;
  metadata: PlatformMetadata;
};

export type CreateResourceQuotaInput = {
  id: string;
  ownerId: string;
  type: ResourceType;
  limit: number;
  metadata?: PlatformMetadata;
};

export type ResourceAllocation = {
  id: string;
  poolId: string;
  ownerId: string;
  type: ResourceType;
  amount: number;
  status: AllocationStatus;
  quotaId?: string;
  allocatedAt: string;
  releasedAt?: string;
  reason?: string;
  metadata: PlatformMetadata;
};

export type AllocateResourceInput = {
  id?: string;
  poolId: string;
  ownerId: string;
  amount: number;
  quotaId?: string;
  metadata?: PlatformMetadata;
};

export type ResourceUsageSnapshot = {
  managerId: string;
  managerStatus: ResourceManagerStatus;
  poolCount: number;
  openPoolCount: number;
  quotaCount: number;
  activeAllocationCount: number;
  totalCapacity: number;
  totalReserved: number;
  totalAvailable: number;
  capturedAt: string;
};

export type ResourceRegistryManifest = {
  resourceId: typeof E10_RESOURCE_ID;
  version: typeof E10_RESOURCE_VERSION;
  freezeVersion: typeof E10_RESOURCE_FREEZE_VERSION;
  base: typeof E10_RESOURCE_BASE;
  poolCount: number;
  quotaCount: number;
  allocationCount: number;
  pools: ResourcePool[];
};
