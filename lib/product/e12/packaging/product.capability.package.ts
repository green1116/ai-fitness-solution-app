/**
 * E12-P1 — Capability Packaging
 * Packages product features with Platform v1 capability references
 */

import { ENTERPRISE_CAPABILITY_CATALOG } from "../../../platform/v1/capability.index";
import { CAPABILITY_PACKAGE_KINDS } from "../core/product.constants";
import { getProductIdentity } from "../identity/product.identity";
import { getProductFeature, listProductFeatures } from "../catalog/product.feature.catalog";
import type {
  CapabilityPackage,
  CapabilityPackageKind,
  CreateCapabilityPackageInput,
} from "../types/product.types";

const packages = new Map<string, CapabilityPackage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePackage(pkg: CapabilityPackage): CapabilityPackage {
  return {
    ...pkg,
    featureIds: [...pkg.featureIds],
    capabilityRefs: [...pkg.capabilityRefs],
    metadata: { ...pkg.metadata },
  };
}

function resolveCapabilityRefs(featureIds: string[]): string[] {
  const refs = new Set<string>();
  for (const fid of featureIds) {
    const feature = getProductFeature(fid);
    if (feature?.capabilityRef) refs.add(feature.capabilityRef);
  }
  return [...refs].sort();
}

export function createCapabilityPackage(
  input: CreateCapabilityPackageInput,
): CapabilityPackage {
  const productId = input.productId.trim();
  if (!productId) throw new Error("package.productId is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const name = input.name.trim();
  if (!name) throw new Error("package.name is required");

  const kind = input.kind ?? "BUNDLE";
  if (!(CAPABILITY_PACKAGE_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid package kind: ${kind}`);
  }

  const featureIds = [...(input.featureIds ?? [])];
  for (const fid of featureIds) {
    if (!getProductFeature(fid)) {
      throw new Error(`feature not found: ${fid}`);
    }
  }

  const capabilityRefs = [
    ...new Set([
      ...resolveCapabilityRefs(featureIds),
      ...(input.capabilityRefs ?? []).map((r) => r.trim()).filter(Boolean),
    ]),
  ];

  for (const ref of capabilityRefs) {
    if (!ENTERPRISE_CAPABILITY_CATALOG.some((c) => c.id === ref)) {
      throw new Error(`platform capability not found: ${ref}`);
    }
  }

  const id = input.id?.trim() || createId("pkg");
  if (packages.has(id)) throw new Error(`package already exists: ${id}`);

  const pkg: CapabilityPackage = {
    id,
    productId,
    kind,
    name,
    featureIds,
    capabilityRefs,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  packages.set(id, pkg);
  return clonePackage(pkg);
}

export function getCapabilityPackage(id: string): CapabilityPackage | undefined {
  const pkg = packages.get(id.trim());
  return pkg ? clonePackage(pkg) : undefined;
}

export function listCapabilityPackages(filter?: {
  productId?: string;
  kind?: CapabilityPackageKind;
}): CapabilityPackage[] {
  let result = [...packages.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePackage);
}

export function packageFeaturesForEdition(
  productId: string,
  editionFeatureIds: string[],
  options?: { name?: string; kind?: CapabilityPackageKind },
): CapabilityPackage {
  const included = editionFeatureIds.filter((fid) =>
    listProductFeatures().some((f) => f.id === fid),
  );
  return createCapabilityPackage({
    productId,
    kind: options?.kind ?? "BUNDLE",
    name: options?.name ?? "Edition capability bundle",
    featureIds: included,
  });
}

export function clearCapabilityPackages(): void {
  packages.clear();
}
