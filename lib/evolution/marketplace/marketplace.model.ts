/**
 * Evolution P6 — Marketplace Model
 * Integrates global deployment, intelligence dashboard, commercial SLA
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getSlaAgreement } from "../../product/e12/commercial/commercial.sla";
import { getIntelligenceDashboard } from "../dashboard/dashboard.model";
import { getDeploymentIntelligence } from "../global/global.deployment";
import { MARKETPLACE_STATUSES } from "./marketplace.constants";
import type {
  CreateMarketplaceProfileInput,
  MarketplaceProfile,
  MarketplaceStatus,
} from "./marketplace.types";

const marketplaces = new Map<string, MarketplaceProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMarketplace(
  marketplace: MarketplaceProfile,
): MarketplaceProfile {
  return { ...marketplace, metadata: { ...marketplace.metadata } };
}

export function createMarketplaceProfile(
  input: CreateMarketplaceProfileInput,
): MarketplaceProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();

  if (!name) throw new Error("marketplace.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  let deploymentScore = 55;
  if (input.deploymentIntelligenceId) {
    const depl = getDeploymentIntelligence(
      input.deploymentIntelligenceId.trim(),
    );
    if (!depl || depl.productId !== productId) {
      throw new Error(
        `deployment intelligence not found: ${input.deploymentIntelligenceId}`,
      );
    }
    deploymentScore = depl.intelligenceScore;
  }

  let dashboardScore = 55;
  if (input.intelligenceDashboardId) {
    const dash = getIntelligenceDashboard(
      input.intelligenceDashboardId.trim(),
    );
    if (!dash || dash.productId !== productId) {
      throw new Error(
        `intelligence dashboard not found: ${input.intelligenceDashboardId}`,
      );
    }
    dashboardScore = dash.compositeScore;
  }

  let commercialBoost = 0;
  if (input.commercialSlaId) {
    const sla = getSlaAgreement(input.commercialSlaId.trim());
    if (!sla || sla.productId !== productId) {
      throw new Error(`commercial sla not found: ${input.commercialSlaId}`);
    }
    commercialBoost =
      sla.tier === "ENTERPRISE" ? 12 : sla.tier === "PREMIUM" ? 8 : 4;
  }

  const status: MarketplaceStatus = input.status ?? "ACTIVE";
  if (!(MARKETPLACE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid marketplace status: ${status}`);
  }

  const ecosystemScore = Math.round(
    Math.max(
      20,
      Math.min(
        98,
        deploymentScore * 0.4 + dashboardScore * 0.4 + commercialBoost + 10,
      ),
    ),
  );

  const id = input.id?.trim() || createId("mkt");
  if (marketplaces.has(id)) {
    throw new Error(`marketplace profile already exists: ${id}`);
  }

  const now = nowIso();
  const marketplace: MarketplaceProfile = {
    id,
    name,
    productId,
    deploymentIntelligenceId:
      input.deploymentIntelligenceId?.trim() || undefined,
    intelligenceDashboardId:
      input.intelligenceDashboardId?.trim() || undefined,
    commercialSlaId: input.commercialSlaId?.trim() || undefined,
    status,
    ecosystemScore,
    detail: `status=${status} ecosystem=${ecosystemScore}`,
    metadata: {
      ...(input.metadata ?? {}),
      deploymentScore,
      dashboardScore,
      commercialBoost,
    },
    createdAt: now,
    updatedAt: now,
  };
  marketplaces.set(id, marketplace);
  return cloneMarketplace(marketplace);
}

export function getMarketplaceProfile(
  id: string,
): MarketplaceProfile | undefined {
  const marketplace = marketplaces.get(id.trim());
  return marketplace ? cloneMarketplace(marketplace) : undefined;
}

export function listMarketplaceProfiles(filter?: {
  productId?: string;
  status?: MarketplaceStatus;
}): MarketplaceProfile[] {
  let result = [...marketplaces.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((m) => m.productId === pid);
  }
  if (filter?.status) result = result.filter((m) => m.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMarketplace);
}

export function clearMarketplaceProfiles(): void {
  marketplaces.clear();
}
