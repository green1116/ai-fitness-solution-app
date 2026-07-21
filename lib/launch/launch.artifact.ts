/**
 * Launch P1 — Production Artifact Registry
 * Integrates E12 deployment package / release artifact refs
 */

import { getReleaseArtifact } from "../product/e12/deployment/deployment.artifact";
import { getDeploymentPackage } from "../product/e12/deployment/deployment.package";
import {
  PRODUCTION_ARTIFACT_KINDS,
  PRODUCTION_ARTIFACT_STATUSES,
} from "./launch.constants";
import { getProductionProfile } from "./launch.profile";
import type {
  ProductionArtifact,
  ProductionArtifactKind,
  ProductionArtifactStatus,
  RegisterProductionArtifactInput,
} from "./launch.types";

const artifacts = new Map<string, ProductionArtifact>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneArtifact(artifact: ProductionArtifact): ProductionArtifact {
  return { ...artifact, metadata: { ...artifact.metadata } };
}

export function registerProductionArtifact(
  input: RegisterProductionArtifactInput,
): ProductionArtifact {
  const productionProfileId = input.productionProfileId.trim();
  const kind = input.kind;
  const refId = input.refId.trim();

  const profile = getProductionProfile(productionProfileId);
  if (!profile) {
    throw new Error(`production profile not found: ${productionProfileId}`);
  }
  if (!(PRODUCTION_ARTIFACT_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid artifact kind: ${kind}`);
  }
  if (!refId) throw new Error("artifact.refId is required");

  if (kind === "DEPLOYMENT_PACKAGE") {
    const pkg = getDeploymentPackage(refId);
    if (!pkg || pkg.productId !== profile.productId) {
      throw new Error(`deployment package not found: ${refId}`);
    }
  }

  if (kind === "RELEASE_ARTIFACT") {
    const artifact = getReleaseArtifact(refId);
    if (!artifact) throw new Error(`release artifact not found: ${refId}`);
  }

  const status = input.status ?? "REGISTERED";
  if (!(PRODUCTION_ARTIFACT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid artifact status: ${status}`);
  }

  const id = input.id?.trim() || createId("prodartifact");
  if (artifacts.has(id)) throw new Error(`artifact already exists: ${id}`);

  const record: ProductionArtifact = {
    id,
    productionProfileId,
    kind,
    refId,
    checksum: input.checksum?.trim() || undefined,
    status,
    uri:
      input.uri?.trim() ||
      `launch://production/${productionProfileId}/${kind}/${refId}`,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };
  artifacts.set(id, record);
  return cloneArtifact(record);
}

export function promoteProductionArtifact(id: string): ProductionArtifact {
  const artifact = artifacts.get(id.trim());
  if (!artifact) throw new Error(`artifact not found: ${id}`);
  if (artifact.status === "REGISTERED") artifact.status = "VERIFIED";
  else if (artifact.status === "VERIFIED") artifact.status = "PROMOTED";
  else throw new Error(`cannot promote from status: ${artifact.status}`);
  artifacts.set(artifact.id, artifact);
  return cloneArtifact(artifact);
}

export function getProductionArtifact(
  id: string,
): ProductionArtifact | undefined {
  const artifact = artifacts.get(id.trim());
  return artifact ? cloneArtifact(artifact) : undefined;
}

export function listProductionArtifacts(filter?: {
  productionProfileId?: string;
  kind?: ProductionArtifactKind;
  status?: ProductionArtifactStatus;
}): ProductionArtifact[] {
  let result = [...artifacts.values()];
  if (filter?.productionProfileId) {
    const pid = filter.productionProfileId.trim();
    result = result.filter((a) => a.productionProfileId === pid);
  }
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneArtifact);
}

export function clearProductionArtifacts(): void {
  artifacts.clear();
}
