/**
 * E12-P1 — Product Feature Catalog
 * Maps enterprise platform capabilities to product features
 */

import {
  FEATURE_AVAILABILITY,
  FEATURE_CATEGORIES,
} from "../core/product.constants";
import type {
  FeatureAvailability,
  FeatureCategory,
  ProductFeature,
  RegisterProductFeatureInput,
} from "../types/product.types";

const features = new Map<string, ProductFeature>();

/** Seed catalog aligned with Platform v1 capability domains. */
export const PRODUCT_FEATURE_CATALOG: ProductFeature[] = [
  {
    id: "feat.core.foundation",
    key: "core.foundation",
    name: "Product Foundation",
    category: "CORE",
    availability: "INCLUDED",
    description: "E12 product identity and registry",
    metadata: {},
  },
  {
    id: "feat.network.global",
    key: "network.global",
    name: "Global Network",
    category: "NETWORK",
    availability: "INCLUDED",
    capabilityRef: "e09.global-network",
    metadata: {},
  },
  {
    id: "feat.platform.kernel",
    key: "platform.kernel",
    name: "Platform Kernel",
    category: "PLATFORM",
    availability: "INCLUDED",
    capabilityRef: "e10.foundation",
    metadata: {},
  },
  {
    id: "feat.runtime.cloud",
    key: "runtime.cloud",
    name: "Cloud Runtime",
    category: "RUNTIME",
    availability: "INCLUDED",
    capabilityRef: "e11.foundation",
    metadata: {},
  },
  {
    id: "feat.runtime.execution",
    key: "runtime.execution",
    name: "Cloud Execution",
    category: "RUNTIME",
    availability: "INCLUDED",
    capabilityRef: "e11.execution",
    metadata: {},
  },
  {
    id: "feat.governance.tenant",
    key: "governance.tenant",
    name: "Tenant Isolation",
    category: "GOVERNANCE",
    availability: "INCLUDED",
    capabilityRef: "e11.tenant",
    metadata: {},
  },
  {
    id: "feat.governance.resource",
    key: "governance.resource",
    name: "Resource Governance",
    category: "GOVERNANCE",
    availability: "INCLUDED",
    capabilityRef: "e11.governance",
    metadata: {},
  },
  {
    id: "feat.observability.cloud",
    key: "observability.cloud",
    name: "Cloud Observability",
    category: "OBSERVABILITY",
    availability: "INCLUDED",
    capabilityRef: "e11.observability",
    metadata: {},
  },
  {
    id: "feat.autonomous.ops",
    key: "autonomous.ops",
    name: "Autonomous Operations",
    category: "AUTONOMOUS",
    availability: "OPTIONAL",
    capabilityRef: "e11.autonomous",
    metadata: {},
  },
  {
    id: "feat.control.plane",
    key: "control.plane",
    name: "Enterprise Control Plane",
    category: "CONTROL",
    availability: "OPTIONAL",
    capabilityRef: "e11.control-plane",
    metadata: {},
  },
];

function cloneFeature(feature: ProductFeature): ProductFeature {
  return { ...feature, metadata: { ...feature.metadata } };
}

export function seedProductFeatureCatalog(): ProductFeature[] {
  clearProductFeatures();
  const seeded: ProductFeature[] = [];
  for (const entry of PRODUCT_FEATURE_CATALOG) {
    seeded.push(registerProductFeature(entry));
  }
  return seeded;
}

export function registerProductFeature(
  input: RegisterProductFeatureInput,
): ProductFeature {
  const key = input.key.trim();
  const name = input.name.trim();
  if (!key) throw new Error("feature.key is required");
  if (!name) throw new Error("feature.name is required");

  const category = input.category;
  if (!(FEATURE_CATEGORIES as readonly string[]).includes(category)) {
    throw new Error(`invalid feature category: ${category}`);
  }

  const availability = input.availability ?? "INCLUDED";
  if (!(FEATURE_AVAILABILITY as readonly string[]).includes(availability)) {
    throw new Error(`invalid feature availability: ${availability}`);
  }

  const id = input.id?.trim() || `feat.${key.replace(/\./g, "-")}`;
  if (features.has(id)) throw new Error(`feature already exists: ${id}`);

  for (const existing of features.values()) {
    if (existing.key === key) {
      throw new Error(`feature key already registered: ${key}`);
    }
  }

  const feature: ProductFeature = {
    id,
    key,
    name,
    category,
    availability,
    capabilityRef: input.capabilityRef?.trim() || undefined,
    description: input.description?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
  };
  features.set(id, feature);
  return cloneFeature(feature);
}

export function getProductFeature(id: string): ProductFeature | undefined {
  const feature = features.get(id.trim());
  return feature ? cloneFeature(feature) : undefined;
}

export function getProductFeatureByKey(
  key: string,
): ProductFeature | undefined {
  const k = key.trim();
  for (const feature of features.values()) {
    if (feature.key === k) return cloneFeature(feature);
  }
  return undefined;
}

export function listProductFeatures(filter?: {
  category?: FeatureCategory;
  availability?: FeatureAvailability;
}): ProductFeature[] {
  let result = [...features.values()];
  if (filter?.category) {
    result = result.filter((f) => f.category === filter.category);
  }
  if (filter?.availability) {
    result = result.filter((f) => f.availability === filter.availability);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFeature);
}

export function clearProductFeatures(): void {
  features.clear();
}

export function isProductFeatureCatalogComplete(): boolean {
  return (
    features.size >= PRODUCT_FEATURE_CATALOG.length &&
    PRODUCT_FEATURE_CATALOG.every((entry) => features.has(entry.id))
  );
}
