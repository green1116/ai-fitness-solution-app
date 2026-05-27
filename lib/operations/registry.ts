/**
 * V4-A1 Production Operations Registry
 */

import { V37_ENTERPRISE_LAYER_VERSIONS } from "../release/shared";
import {
  V4_OPERATION_DOMAINS,
  V4_OPERATION_TIMESTAMP,
  V4_OPERATIONS_VERSION,
  type V4OperationDomainId,
} from "./shared";
import { getReleaseFoundationForOperations } from "./operations-context";

export const PRODUCTION_OPERATIONS_REGISTRY_VERSION = "4-a1-operations-registry-1" as const;

export type ProductionOperationStatus =
  | "planned"
  | "active"
  | "degraded"
  | "maintenance"
  | "stabilizing"
  | "frozen"
  | "retired";

export type ProductionOperationRecord = {
  id: string;
  domain: string;
  owner: string;
  stage: string;
  status: ProductionOperationStatus;

  stabilityScore: number;
  operationalConfidence: number;

  createdAt: string;
  updatedAt: string;

  metadata?: Record<string, unknown>;
};

export type ProductionOperationsRegistry = {
  version: typeof PRODUCTION_OPERATIONS_REGISTRY_VERSION;
  registryId: string;
  records: ProductionOperationRecord[];
  activeCount: number;
  frozenCount: number;
  operationalCount: number;
  summary: string;
};

const ENTERPRISE_DOMAIN_IDS = Object.keys(V37_ENTERPRISE_LAYER_VERSIONS) as (keyof typeof V37_ENTERPRISE_LAYER_VERSIONS)[];

function resolveEnterpriseStatus(
  productionReady: boolean,
  locked: boolean,
): ProductionOperationStatus {
  if (locked && productionReady) return "active";
  if (productionReady) return "stabilizing";
  return "maintenance";
}

function resolveFreezeStatus(integritySealed: boolean, locked: boolean): ProductionOperationStatus {
  if (integritySealed && locked) return "frozen";
  if (integritySealed) return "active";
  return "degraded";
}

function resolveIntegrityStatus(verified: boolean): ProductionOperationStatus {
  return verified ? "active" : "degraded";
}

function buildRecord(
  id: string,
  domainKey: V4OperationDomainId,
  status: ProductionOperationStatus,
  stabilityScore: number,
  operationalConfidence: number,
  metadata: Record<string, unknown>,
): ProductionOperationRecord {
  const config = V4_OPERATION_DOMAINS[domainKey];
  return {
    id,
    domain: config.label,
    owner: config.owner,
    stage: config.stage,
    status,
    stabilityScore,
    operationalConfidence,
    createdAt: V4_OPERATION_TIMESTAMP,
    updatedAt: V4_OPERATION_TIMESTAMP,
    metadata,
  };
}

export function buildProductionOperationsRegistry(input?: {
  deploymentId?: string;
}): ProductionOperationsRegistry {
  const deploymentId = input?.deploymentId ?? "production-operations-registry";
  const registryId = `POR-V4A1-${deploymentId.slice(0, 8)}`;
  const release = getReleaseFoundationForOperations(deploymentId);

  const productionReady = release.final.productionReady;
  const locked = release.lock.locked;
  const confidence = release.final.readiness.confidenceScore;
  const enterpriseStatus = resolveEnterpriseStatus(productionReady, locked);

  const records: ProductionOperationRecord[] = [];

  for (const layerId of ENTERPRISE_DOMAIN_IDS) {
    const config = V4_OPERATION_DOMAINS[layerId as V4OperationDomainId];
    records.push(
      buildRecord(
        `op-${layerId}`,
        layerId as V4OperationDomainId,
        enterpriseStatus,
        confidence,
        confidence,
        {
          layerVersion: V37_ENTERPRISE_LAYER_VERSIONS[layerId],
          generation: release.freeze.releaseGeneration,
          phase: config.stage,
        },
      ),
    );
  }

  records.push(
    buildRecord(
      "op-production-freeze",
      "productionFreeze",
      resolveFreezeStatus(release.freeze.integrityState === "sealed", locked),
      locked ? 100 : confidence,
      confidence,
      {
        freezeId: release.freeze.freezeId,
        integrityState: release.freeze.integrityState,
        baselineHash: release.freeze.baselineHash,
      },
    ),
  );

  records.push(
    buildRecord(
      "op-release-baseline",
      "releaseBaseline",
      release.baseline.baseline.readyForProduction ? "active" : "degraded",
      confidence,
      confidence,
      {
        baselineId: release.baseline.baseline.baselineId,
        layerCount: release.baseline.baseline.layerCount,
        registeredCount: release.baseline.registry.registeredCount,
      },
    ),
  );

  records.push(
    buildRecord(
      "op-integrity-layer",
      "integrityLayer",
      resolveIntegrityStatus(
        release.integrity.baselineVerified && release.integrity.preservationVerified,
      ),
      confidence,
      confidence,
      {
        verificationId: release.integrity.verificationId,
        baselineVerified: release.integrity.baselineVerified,
        preservationVerified: release.integrity.preservationVerified,
      },
    ),
  );

  records.push(
    buildRecord(
      "op-snapshot-runtime",
      "snapshotRuntime",
      release.snapshots.snapshotCount >= 3 ? "active" : "degraded",
      confidence,
      confidence,
      {
        manifestId: release.snapshots.manifestId,
        snapshotCount: release.snapshots.snapshotCount,
        rollbackLineage: release.snapshots.rollbackLineage,
      },
    ),
  );

  records.push(
    buildRecord(
      "op-release-governance",
      "releaseGovernance",
      release.governance.allEnforced ? "active" : "degraded",
      confidence,
      confidence,
      {
        bundleId: release.governance.bundleId,
        allEnforced: release.governance.allEnforced,
      },
    ),
  );

  records.push(
    buildRecord(
      "op-production-operations",
      "productionOperations",
      productionReady && locked ? "active" : "stabilizing",
      confidence,
      confidence,
      {
        generation: "V4-A1",
        productionReady,
        locked,
        readinessScore: confidence,
      },
    ),
  );

  const activeCount = records.filter((r) => r.status === "active").length;
  const frozenCount = records.filter((r) => r.status === "frozen").length;
  const operationalCount = records.filter(
    (r) => r.status === "active" || r.status === "frozen" || r.status === "stabilizing",
  ).length;

  return {
    version: PRODUCTION_OPERATIONS_REGISTRY_VERSION,
    registryId,
    records,
    activeCount,
    frozenCount,
    operationalCount,
    summary: `production-operations-registry id=${registryId} records=${records.length} active=${activeCount} frozen=${frozenCount} operational=${operationalCount} confidence=${confidence}`,
  };
}

export function getProductionOperationRecord(
  recordId: string,
  input?: { deploymentId?: string },
): ProductionOperationRecord | undefined {
  const registry = buildProductionOperationsRegistry(input);
  return registry.records.find((r) => r.id === recordId);
}
