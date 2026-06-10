import type {
  ApiInventoryEntry,
  CapabilityInventoryEntry,
  CommercialPlatformInventories,
  DependencyInventoryEntry,
  DocumentationInventoryEntry,
  RuntimeInventoryEntry,
  VerifyInventoryEntry,
} from "../shared/types";
import {
  COMMERCIAL_LAYER_ORDER,
  COMMERCIAL_MODULE_REGISTRY,
  assertRegistryDomainAlignment,
} from "./modules";

function buildCapabilityInventory(): CapabilityInventoryEntry[] {
  return COMMERCIAL_MODULE_REGISTRY.flatMap((module) =>
    module.domains.map((domain) => ({
      layer: module.layer,
      moduleId: module.moduleId,
      domainId: domain.domainId,
      capability: domain.capability,
      version: module.version,
      tag: module.tag,
      status: "frozen" as const,
    })),
  );
}

function buildDependencyInventory(): DependencyInventoryEntry[] {
  return COMMERCIAL_MODULE_REGISTRY.flatMap((module) =>
    module.dependencies.map((dep) => ({
      fromModule: module.moduleId,
      toModule: dep,
      layer: module.layer,
      dependencyType: "read-only-bridge" as const,
      description: `${module.moduleId} read-only bridge to ${dep}`,
    })),
  );
}

function buildRuntimeInventory(): RuntimeInventoryEntry[] {
  return COMMERCIAL_MODULE_REGISTRY.flatMap((module) =>
    module.domains.map((domain) => ({
      layer: module.layer,
      moduleId: module.moduleId,
      domainId: domain.domainId,
      runtimeFn: domain.runtimeFn,
      version: module.version,
      status: "frozen" as const,
    })),
  );
}

function buildApiInventory(): ApiInventoryEntry[] {
  return COMMERCIAL_MODULE_REGISTRY.flatMap((module) =>
    module.domains.map((domain) => ({
      layer: module.layer,
      moduleId: module.moduleId,
      domainId: domain.domainId,
      method: "GET" as const,
      path: `/api/${module.moduleId}/${domain.apiSlug}/run`,
      status: "frozen" as const,
    })),
  );
}

function buildVerifyInventory(): VerifyInventoryEntry[] {
  return COMMERCIAL_MODULE_REGISTRY.flatMap((module) =>
    module.domains.map((domain) => ({
      layer: module.layer,
      moduleId: module.moduleId,
      domainId: domain.domainId,
      script: `scripts/${domain.verifyScript.replace("verify:", "verify-")}.ts`,
      npmCommand: `npm run ${domain.verifyScript}`,
      status: "registered" as const,
    })),
  );
}

function buildDocumentationInventory(): DocumentationInventoryEntry[] {
  const layerDocs = new Map<string, DocumentationInventoryEntry>();
  for (const module of COMMERCIAL_MODULE_REGISTRY) {
    const key = `${module.layer}:${module.docPath}`;
    if (!layerDocs.has(key)) {
      layerDocs.set(key, {
        layer: module.layer,
        version: module.version,
        tag: module.tag,
        docPath: module.docPath,
        status: "frozen",
      });
    }
  }
  layerDocs.set("freeze:v18", {
    layer: "revenue",
    version: "v18.0-commercial-platform-freeze-1",
    tag: "v18-commercial-platform-freeze",
    docPath: "docs/commercialization/V18-COMMERCIAL-PLATFORM-FREEZE.md",
    status: "frozen",
  });
  return [...layerDocs.values()];
}

export function buildCommercialPlatformInventories(): CommercialPlatformInventories {
  assertRegistryDomainAlignment();
  return {
    capability: buildCapabilityInventory(),
    dependency: buildDependencyInventory(),
    runtime: buildRuntimeInventory(),
    api: buildApiInventory(),
    verify: buildVerifyInventory(),
    documentation: buildDocumentationInventory(),
  };
}

export function countInventoryTotals(inventories: CommercialPlatformInventories): {
  moduleCount: number;
  domainCount: number;
  layerCount: number;
} {
  return {
    moduleCount: COMMERCIAL_MODULE_REGISTRY.length,
    domainCount: inventories.capability.length,
    layerCount: COMMERCIAL_LAYER_ORDER.length,
  };
}
