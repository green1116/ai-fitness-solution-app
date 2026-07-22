/**
 * Evolution P7 — Evolution Orchestration
 * Binds optimization / predictive / customer / dashboard / global / marketplace
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getOperationsIntelligenceProfile } from "../evolution.intelligence";
import { getCustomerIntelligenceProfile } from "../customer/customer.intelligence";
import { getIntelligenceDashboard } from "../dashboard/dashboard.model";
import { getDeploymentIntelligence } from "../global/global.deployment";
import { getMarketplaceProfile } from "../marketplace/marketplace.model";
import { getPredictionModel } from "../predictive/predictive.model";
import {
  EVO_ORCHESTRATION_DOMAINS,
  EVO_ORCHESTRATION_STATUSES,
} from "./control.constants";
import type {
  CreateEvolutionOrchestrationInput,
  EvoDomainBinding,
  EvoOrchestrationDomain,
  EvoOrchestrationStatus,
  EvolutionOrchestration,
} from "./control.types";

const orchestrations = new Map<string, EvolutionOrchestration>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOrchestration(
  orchestration: EvolutionOrchestration,
): EvolutionOrchestration {
  return {
    ...orchestration,
    domains: orchestration.domains.map((d) => ({ ...d })),
    metadata: { ...orchestration.metadata },
  };
}

function buildDomains(
  input: CreateEvolutionOrchestrationInput,
  scores: Record<EvoOrchestrationDomain, number>,
): EvoDomainBinding[] {
  const bindings: Array<{
    domain: EvoOrchestrationDomain;
    refId?: string;
    label: string;
    present: boolean;
  }> = [
    {
      domain: "OPTIMIZATION",
      refId: input.operationsIntelligenceId,
      label: "AI operations optimization",
      present: !!input.operationsIntelligenceId,
    },
    {
      domain: "PREDICTIVE",
      refId: input.predictionModelId,
      label: "Predictive intelligence",
      present: !!input.predictionModelId,
    },
    {
      domain: "CUSTOMER",
      refId: input.customerIntelligenceId,
      label: "Autonomous customer success",
      present: !!input.customerIntelligenceId,
    },
    {
      domain: "DASHBOARD",
      refId: input.intelligenceDashboardId,
      label: "Enterprise intelligence dashboard",
      present: !!input.intelligenceDashboardId,
    },
    {
      domain: "GLOBAL",
      refId: input.deploymentIntelligenceId,
      label: "Global deployment network",
      present: !!input.deploymentIntelligenceId,
    },
    {
      domain: "MARKETPLACE",
      refId: input.marketplaceId,
      label: "Marketplace ecosystem",
      present: !!input.marketplaceId,
    },
  ];

  return bindings.map((b) => ({
    domain: b.domain,
    refId: b.refId?.trim() || "",
    label: b.label,
    present: b.present,
    score: b.present ? scores[b.domain] : 0,
  }));
}

export function createEvolutionOrchestration(
  input: CreateEvolutionOrchestrationInput,
): EvolutionOrchestration {
  const name = input.name.trim();
  const productId = input.productId.trim();

  if (!name) throw new Error("evolutionOrchestration.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const scores: Record<EvoOrchestrationDomain, number> = {
    OPTIMIZATION: 0,
    PREDICTIVE: 0,
    CUSTOMER: 0,
    DASHBOARD: 0,
    GLOBAL: 0,
    MARKETPLACE: 0,
  };

  if (input.operationsIntelligenceId) {
    const intel = getOperationsIntelligenceProfile(
      input.operationsIntelligenceId.trim(),
    );
    if (!intel || intel.productId !== productId) {
      throw new Error(
        `operations intelligence not found: ${input.operationsIntelligenceId}`,
      );
    }
    scores.OPTIMIZATION = intel.intelligenceScore;
  }

  if (input.predictionModelId) {
    const model = getPredictionModel(input.predictionModelId.trim());
    if (!model || model.productId !== productId) {
      throw new Error(
        `prediction model not found: ${input.predictionModelId}`,
      );
    }
    scores.PREDICTIVE = model.confidence;
  }

  if (input.customerIntelligenceId) {
    const cs = getCustomerIntelligenceProfile(
      input.customerIntelligenceId.trim(),
    );
    if (!cs || cs.productId !== productId) {
      throw new Error(
        `customer intelligence not found: ${input.customerIntelligenceId}`,
      );
    }
    scores.CUSTOMER = cs.intelligenceScore;
  }

  if (input.intelligenceDashboardId) {
    const dash = getIntelligenceDashboard(
      input.intelligenceDashboardId.trim(),
    );
    if (!dash || dash.productId !== productId) {
      throw new Error(
        `intelligence dashboard not found: ${input.intelligenceDashboardId}`,
      );
    }
    scores.DASHBOARD = dash.compositeScore;
  }

  if (input.deploymentIntelligenceId) {
    const depl = getDeploymentIntelligence(
      input.deploymentIntelligenceId.trim(),
    );
    if (!depl || depl.productId !== productId) {
      throw new Error(
        `deployment intelligence not found: ${input.deploymentIntelligenceId}`,
      );
    }
    scores.GLOBAL = depl.intelligenceScore;
  }

  if (input.marketplaceId) {
    const mkt = getMarketplaceProfile(input.marketplaceId.trim());
    if (!mkt || mkt.productId !== productId) {
      throw new Error(`marketplace not found: ${input.marketplaceId}`);
    }
    scores.MARKETPLACE = mkt.ecosystemScore;
  }

  const domains = buildDomains(input, scores);
  for (const domain of domains) {
    if (
      !(EVO_ORCHESTRATION_DOMAINS as readonly string[]).includes(domain.domain)
    ) {
      throw new Error(`invalid evolution domain: ${domain.domain}`);
    }
  }

  const status: EvoOrchestrationStatus = "DRAFT";
  if (!(EVO_ORCHESTRATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid orchestration status: ${status}`);
  }

  const id = input.id?.trim() || createId("evoorch");
  if (orchestrations.has(id)) {
    throw new Error(`evolution orchestration already exists: ${id}`);
  }

  const presentCount = domains.filter((d) => d.present).length;
  const now = nowIso();
  const orchestration: EvolutionOrchestration = {
    id,
    name,
    productId,
    operationsIntelligenceId:
      input.operationsIntelligenceId?.trim() || undefined,
    predictionModelId: input.predictionModelId?.trim() || undefined,
    customerIntelligenceId:
      input.customerIntelligenceId?.trim() || undefined,
    intelligenceDashboardId:
      input.intelligenceDashboardId?.trim() || undefined,
    deploymentIntelligenceId:
      input.deploymentIntelligenceId?.trim() || undefined,
    marketplaceId: input.marketplaceId?.trim() || undefined,
    status,
    domains,
    detail: `status=${status} domains=${presentCount}/${domains.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  orchestrations.set(id, orchestration);
  return cloneOrchestration(orchestration);
}

export function activateEvolutionOrchestration(
  id: string,
): EvolutionOrchestration {
  const orchestration = orchestrations.get(id.trim());
  if (!orchestration) {
    throw new Error(`evolution orchestration not found: ${id}`);
  }
  const present = orchestration.domains.filter((d) => d.present).length;
  if (present < 4) {
    throw new Error(
      `activate requires at least 4 bound domains (have=${present})`,
    );
  }
  orchestration.status = "ACTIVE";
  orchestration.activatedAt = nowIso();
  orchestration.updatedAt = orchestration.activatedAt;
  orchestration.detail = `status=ACTIVE domains=${present}/${orchestration.domains.length}`;
  orchestrations.set(orchestration.id, orchestration);
  return cloneOrchestration(orchestration);
}

export function getEvolutionOrchestration(
  id: string,
): EvolutionOrchestration | undefined {
  const orchestration = orchestrations.get(id.trim());
  return orchestration ? cloneOrchestration(orchestration) : undefined;
}

export function listEvolutionOrchestrations(filter?: {
  productId?: string;
  status?: EvoOrchestrationStatus;
}): EvolutionOrchestration[] {
  let result = [...orchestrations.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((o) => o.productId === pid);
  }
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOrchestration);
}

export function clearEvolutionOrchestrations(): void {
  orchestrations.clear();
}
