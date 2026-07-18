/**
 * E09-P2 — Regional Registry
 * Registers regions bound to e09/core GlobalNode parents
 */

import { GLOBAL_NODE_TYPES } from "../core/global.constants";
import type { GlobalNode } from "../core/global.types";
import {
  E09_REGIONAL_BASE,
  E09_REGIONAL_FREEZE_VERSION,
  E09_REGIONAL_ID,
  E09_REGIONAL_VERSION,
  REGIONAL_STATUSES,
} from "./regional.constants";
import type {
  Region,
  RegionalRegistryManifest,
  RegionalStatus,
  RegisterRegionInput,
} from "./regional.types";

const regions = new Map<string, Region>();
const codeIndex = new Map<string, string>();

function cloneRegion(region: Region): Region {
  return {
    ...region,
    parentGlobalNode: {
      ...region.parentGlobalNode,
      metadata: { ...region.parentGlobalNode.metadata },
    },
    metadata: { ...region.metadata },
  };
}

function assertParentGlobalNode(node: GlobalNode): void {
  if (!node.id.trim()) throw new Error("parentGlobalNode.id is required");
  if (!(GLOBAL_NODE_TYPES as readonly string[]).includes(node.type)) {
    throw new Error(`invalid parentGlobalNode.type: ${node.type}`);
  }
}

function assertRegionalStatus(
  status: string,
): asserts status is RegionalStatus {
  if (!(REGIONAL_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid regional status: ${status}`);
  }
}

export function registerRegion(input: RegisterRegionInput): Region {
  const id = input.id.trim();
  const name = input.name.trim();
  const code = input.code.trim().toUpperCase();

  if (!id) throw new Error("region.id is required");
  if (!name) throw new Error("region.name is required");
  if (!code) throw new Error("region.code is required");
  assertParentGlobalNode(input.parentGlobalNode);

  const status = input.status ?? "CONNECTED";
  assertRegionalStatus(status);

  if (regions.has(id)) {
    throw new Error(`region already registered: ${id}`);
  }
  if (codeIndex.has(code)) {
    throw new Error(`region code already registered: ${code}`);
  }

  const region: Region = {
    id,
    name,
    code,
    parentGlobalNode: {
      id: input.parentGlobalNode.id.trim(),
      type: input.parentGlobalNode.type,
      status: input.parentGlobalNode.status,
      metadata: { ...(input.parentGlobalNode.metadata ?? {}) },
    },
    status,
    metadata: { ...(input.metadata ?? {}) },
  };

  regions.set(id, region);
  codeIndex.set(code, id);
  return cloneRegion(region);
}

export function getRegion(
  idOrCode: string,
  options?: { by?: "id" | "code" },
): Region | undefined {
  const key = idOrCode.trim();
  const by = options?.by ?? "id";

  if (by === "code") {
    const id = codeIndex.get(key.toUpperCase());
    if (!id) return undefined;
    const region = regions.get(id);
    return region ? cloneRegion(region) : undefined;
  }

  const region = regions.get(key);
  return region ? cloneRegion(region) : undefined;
}

export function listRegions(filter?: {
  status?: RegionalStatus;
  parentNodeId?: string;
  parentNodeType?: GlobalNode["type"];
}): Region[] {
  let result = [...regions.values()];
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  if (filter?.parentNodeId) {
    result = result.filter(
      (r) => r.parentGlobalNode.id === filter.parentNodeId,
    );
  }
  if (filter?.parentNodeType) {
    result = result.filter(
      (r) => r.parentGlobalNode.type === filter.parentNodeType,
    );
  }
  return result.map(cloneRegion);
}

export function removeRegion(id: string): boolean {
  const region = regions.get(id.trim());
  if (!region) return false;
  regions.delete(region.id);
  codeIndex.delete(region.code);
  return true;
}

export function buildRegionalRegistryManifest(): RegionalRegistryManifest {
  const list = listRegions();
  return {
    regionalId: E09_REGIONAL_ID,
    version: E09_REGIONAL_VERSION,
    freezeVersion: E09_REGIONAL_FREEZE_VERSION,
    base: E09_REGIONAL_BASE,
    regionCount: list.length,
    regions: list,
  };
}

export function clearRegions(): void {
  regions.clear();
  codeIndex.clear();
}
