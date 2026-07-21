/**
 * Enterprise Platform v1 — Layer Registry
 * Read-only catalog of frozen E09 / E10 / E11 enterprise stacks
 */

import { E09_CIVILIZATION_ID } from "../../global-network/e09/civilization/civilization.constants";
import { E09_GLOBAL_NETWORK_PLATFORM_ID } from "../../global-network/e09/core/global.constants";
import {
  E09_P8_GOVERNANCE_BASE,
  E09_P8_PLATFORM_FREEZE_VERSION,
} from "../../global-network/e09/signoff/governance.freeze.lock";
import { E11_CONTROL_PLANE_ID } from "../../cloud-runtime/e11/control-plane/control-plane.constants";
import { E11_CLOUD_RUNTIME_ID } from "../../cloud-runtime/e11/core/cloud.constants";
import {
  E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
  E11_P8_GOVERNANCE_BASE,
} from "../../cloud-runtime/e11/signoff/governance.freeze.lock";
import { E10_OS_ID } from "../e10/os/os.constants";
import { E10_PLATFORM_ID } from "../e10/core/platform.constants";
import {
  E10_P8_GOVERNANCE_BASE,
  E10_P8_PLATFORM_FREEZE_VERSION,
} from "../e10/signoff/governance.freeze.lock";
import {
  E09_ENTERPRISE_COMPLETE_ID,
  E10_ENTERPRISE_COMPLETE_ID,
  E11_ENTERPRISE_COMPLETE_ID,
} from "./platform.v1.constants";
import type { EnterpriseLayerCode, EnterpriseLayerEntry } from "./platform.v1.types";

export const ENTERPRISE_LAYER_REGISTRY: EnterpriseLayerEntry[] = [
  {
    code: "E09",
    label: "Global Autonomous Enterprise Network",
    completeId: E09_ENTERPRISE_COMPLETE_ID,
    freezeVersion: E09_P8_PLATFORM_FREEZE_VERSION,
    governanceBase: E09_P8_GOVERNANCE_BASE,
    rootPath: "lib/global-network/e09/",
    signoffPath: "lib/global-network/e09/signoff/",
    primaryId: E09_GLOBAL_NETWORK_PLATFORM_ID,
    secondaryId: E09_CIVILIZATION_ID,
  },
  {
    code: "E10",
    label: "Autonomous Platform",
    completeId: E10_ENTERPRISE_COMPLETE_ID,
    freezeVersion: E10_P8_PLATFORM_FREEZE_VERSION,
    governanceBase: E10_P8_GOVERNANCE_BASE,
    rootPath: "lib/platform/e10/",
    signoffPath: "lib/platform/e10/signoff/",
    primaryId: E10_PLATFORM_ID,
    secondaryId: E10_OS_ID,
  },
  {
    code: "E11",
    label: "Cloud Runtime",
    completeId: E11_ENTERPRISE_COMPLETE_ID,
    freezeVersion: E11_P8_CLOUD_RUNTIME_FREEZE_VERSION,
    governanceBase: E11_P8_GOVERNANCE_BASE,
    rootPath: "lib/cloud-runtime/e11/",
    signoffPath: "lib/cloud-runtime/e11/signoff/",
    primaryId: E11_CLOUD_RUNTIME_ID,
    secondaryId: E11_CONTROL_PLANE_ID,
  },
];

export function getEnterpriseLayer(
  code: EnterpriseLayerCode,
): EnterpriseLayerEntry | undefined {
  return ENTERPRISE_LAYER_REGISTRY.find((layer) => layer.code === code);
}

export function listEnterpriseLayers(): EnterpriseLayerEntry[] {
  return ENTERPRISE_LAYER_REGISTRY.map((layer) => ({ ...layer }));
}

export function getPlatformV1UpstreamLayer(): EnterpriseLayerEntry {
  const e11 = getEnterpriseLayer("E11");
  if (!e11) throw new Error("E11 layer missing from registry");
  return e11;
}

export function isEnterpriseLayerRegistryComplete(): boolean {
  const codes: EnterpriseLayerCode[] = ["E09", "E10", "E11"];
  return codes.every((code) =>
    ENTERPRISE_LAYER_REGISTRY.some(
      (layer) =>
        layer.code === code &&
        layer.completeId.length > 0 &&
        layer.rootPath.startsWith("lib/"),
    ),
  );
}
