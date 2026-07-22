/**
 * Evolution P3 — Customer Intelligence Model
 * Integrates predictive signals, CS ops, growth, commercial
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getSlaAgreement } from "../../product/e12/commercial/commercial.sla";
import { getCustomerLifecycleStage } from "../../product/e12/commercial/commercial.customer";
import { getCustomerHealthProfile } from "../../operations/customer-success/success.health";
import { listAdoptionRecords } from "../../operations/customer-success/success.adoption";
import { getGrowthDashboard } from "../../operations/growth/growth.dashboard";
import { getCustomerRiskSignal } from "../predictive/predictive.customer";
import { getPredictionModel } from "../predictive/predictive.model";
import { CUSTOMER_INTELLIGENCE_MODES } from "./customer.constants";
import type {
  CreateCustomerIntelligenceInput,
  CustomerIntelligenceMode,
  CustomerIntelligenceProfile,
} from "./customer.types";

const profiles = new Map<string, CustomerIntelligenceProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(
  profile: CustomerIntelligenceProfile,
): CustomerIntelligenceProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function createCustomerIntelligenceProfile(
  input: CreateCustomerIntelligenceInput,
): CustomerIntelligenceProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const customerHealthProfileId = input.customerHealthProfileId.trim();

  if (!name) throw new Error("customerIntelligence.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const health = getCustomerHealthProfile(customerHealthProfileId);
  if (!health || health.productId !== productId) {
    throw new Error(
      `customer health profile not found: ${customerHealthProfileId}`,
    );
  }

  if (input.predictionModelId) {
    const model = getPredictionModel(input.predictionModelId.trim());
    if (!model || model.productId !== productId) {
      throw new Error(
        `prediction model not found: ${input.predictionModelId}`,
      );
    }
  }

  let predictiveRisk = 35;
  if (input.customerRiskSignalId) {
    const risk = getCustomerRiskSignal(input.customerRiskSignalId.trim());
    if (!risk) {
      throw new Error(
        `customer risk signal not found: ${input.customerRiskSignalId}`,
      );
    }
    if (
      input.predictionModelId &&
      risk.predictionModelId !== input.predictionModelId.trim()
    ) {
      throw new Error("customer risk signal does not match prediction model");
    }
    predictiveRisk = risk.riskScore;
  }

  let growthScore = 55;
  if (input.growthDashboardId) {
    const dash = getGrowthDashboard(input.growthDashboardId.trim());
    if (!dash || dash.productId !== productId) {
      throw new Error(
        `growth dashboard not found: ${input.growthDashboardId}`,
      );
    }
    growthScore = dash.growthScore;
  }

  if (input.commercialSlaId) {
    const sla = getSlaAgreement(input.commercialSlaId.trim());
    if (!sla || sla.productId !== productId) {
      throw new Error(`commercial sla not found: ${input.commercialSlaId}`);
    }
  }

  const mode: CustomerIntelligenceMode = input.mode ?? "AUTONOMOUS";
  if (!(CUSTOMER_INTELLIGENCE_MODES as readonly string[]).includes(mode)) {
    throw new Error(`invalid customer intelligence mode: ${mode}`);
  }

  const adoptions = listAdoptionRecords({
    customerHealthProfileId: health.id,
  });
  const adoptionBoost = Math.min(20, adoptions.length * 5);
  const lifecycle = getCustomerLifecycleStage(
    health.organizationId,
    productId,
  );
  const lifecycleBoost =
    lifecycle === "ACTIVE" || lifecycle === "ONBOARDING" ? 10 : 0;

  const intelligenceScore = Math.round(
    Math.max(
      20,
      Math.min(
        98,
        health.score * 0.45 +
          growthScore * 0.25 +
          (100 - predictiveRisk) * 0.2 +
          adoptionBoost +
          lifecycleBoost * 0.1,
      ),
    ),
  );

  const id = input.id?.trim() || createId("csintel");
  if (profiles.has(id)) {
    throw new Error(`customer intelligence profile already exists: ${id}`);
  }

  const now = nowIso();
  const profile: CustomerIntelligenceProfile = {
    id,
    name,
    productId,
    customerHealthProfileId: health.id,
    predictionModelId: input.predictionModelId?.trim() || undefined,
    customerRiskSignalId: input.customerRiskSignalId?.trim() || undefined,
    growthDashboardId: input.growthDashboardId?.trim() || undefined,
    commercialSlaId: input.commercialSlaId?.trim() || undefined,
    organizationId: health.organizationId,
    productTenantId: health.productTenantId,
    mode,
    intelligenceScore,
    detail: `score=${intelligenceScore} mode=${mode} health=${health.score}`,
    metadata: {
      ...(input.metadata ?? {}),
      predictiveRisk,
      growthScore,
      lifecycle: lifecycle ?? "UNKNOWN",
    },
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getCustomerIntelligenceProfile(
  id: string,
): CustomerIntelligenceProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listCustomerIntelligenceProfiles(filter?: {
  productId?: string;
  customerHealthProfileId?: string;
}): CustomerIntelligenceProfile[] {
  let result = [...profiles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.customerHealthProfileId) {
    const hid = filter.customerHealthProfileId.trim();
    result = result.filter((p) => p.customerHealthProfileId === hid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearCustomerIntelligenceProfiles(): void {
  profiles.clear();
}
