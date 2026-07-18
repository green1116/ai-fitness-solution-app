/**
 * E09-P2 — Regional Foundation types
 * Regional layer above E09 Global Network Foundation
 */

import type {
  GlobalNode,
  GlobalNodeMetadata,
} from "../core/global.types";
import {
  E09_REGIONAL_BASE,
  E09_REGIONAL_FREEZE_VERSION,
  E09_REGIONAL_ID,
  E09_REGIONAL_VERSION,
  REGIONAL_STATUSES,
} from "./regional.constants";

export type RegionalStatus = (typeof REGIONAL_STATUSES)[number];

export type Region = {
  id: string;
  name: string;
  code: string;
  /** Parent node from e09/core GlobalNode model */
  parentGlobalNode: GlobalNode;
  status: RegionalStatus;
  metadata: GlobalNodeMetadata;
};

export type RegisterRegionInput = {
  id: string;
  name: string;
  code: string;
  parentGlobalNode: GlobalNode;
  status?: RegionalStatus;
  metadata?: GlobalNodeMetadata;
};

export type RegionalRegistryManifest = {
  regionalId: typeof E09_REGIONAL_ID;
  version: typeof E09_REGIONAL_VERSION;
  freezeVersion: typeof E09_REGIONAL_FREEZE_VERSION;
  base: typeof E09_REGIONAL_BASE;
  regionCount: number;
  regions: Region[];
};
