/**
 * Evolution P6 — Marketplace Ecosystem Readiness
 */

import { listApiCatalogEntries } from "../../product/e12/api/api.catalog";
import { getSlaAgreement } from "../../product/e12/commercial/commercial.sla";
import { getIntelligenceDashboard } from "../dashboard/dashboard.model";
import { EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID } from "../global/global.constants";
import { getDeploymentIntelligence } from "../global/global.deployment";
import { EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE } from "./marketplace.constants";
import { listEcosystemAnalytics } from "./marketplace.analytics";
import { listExtensions } from "./marketplace.extension";
import { listIntegrationCatalogEntries } from "./marketplace.integration";
import { getMarketplaceProfile } from "./marketplace.model";
import { listPartners } from "./marketplace.partner";
import type {
  MarketplaceReadinessCheck,
  MarketplaceReadinessResult,
} from "./marketplace.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): MarketplaceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateMarketplaceReadiness(
  marketplaceId: string,
): MarketplaceReadinessResult {
  const marketplace = getMarketplaceProfile(marketplaceId.trim());
  if (!marketplace) {
    return {
      marketplaceId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "MKT-MODEL",
          "marketplace",
          "Marketplace profile exists",
          false,
          `marketplace not found: ${marketplaceId}`,
        ),
      ],
      summary: "marketplace readiness not ready: profile missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: MarketplaceReadinessCheck[] = [];

  checks.push(
    check(
      "MKT-BASE",
      "evolution",
      "P5 global deployment network baseline aligned",
      EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE ===
        EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID,
      `base=${EVOLUTION_MARKETPLACE_ECOSYSTEM_BASE}`,
    ),
  );

  if (marketplace.deploymentIntelligenceId) {
    const depl = getDeploymentIntelligence(
      marketplace.deploymentIntelligenceId,
    );
    checks.push(
      check(
        "MKT-GLOBAL",
        "global",
        "Global deployment intelligence bound",
        !!depl && depl.productId === marketplace.productId,
        depl
          ? `depl=${depl.id} score=${depl.intelligenceScore}`
          : "deployment intelligence missing",
      ),
    );
  } else {
    checks.push(
      check(
        "MKT-GLOBAL",
        "global",
        "Global deployment intelligence bound",
        false,
        "deploymentIntelligenceId missing",
      ),
    );
  }

  if (marketplace.intelligenceDashboardId) {
    const dash = getIntelligenceDashboard(
      marketplace.intelligenceDashboardId,
    );
    checks.push(
      check(
        "MKT-DASHBOARD",
        "dashboard",
        "Enterprise intelligence dashboard bound",
        !!dash && dash.productId === marketplace.productId,
        dash
          ? `dashboard=${dash.id} score=${dash.compositeScore}`
          : "intelligence dashboard missing",
      ),
    );
  } else {
    checks.push(
      check(
        "MKT-DASHBOARD",
        "dashboard",
        "Enterprise intelligence dashboard bound",
        false,
        "intelligenceDashboardId missing",
      ),
    );
  }

  if (marketplace.commercialSlaId) {
    const sla = getSlaAgreement(marketplace.commercialSlaId);
    checks.push(
      check(
        "MKT-COMMERCIAL",
        "commercial",
        "Commercial control SLA bound",
        !!sla && sla.productId === marketplace.productId,
        sla ? `sla=${sla.id} tier=${sla.tier}` : "commercial sla missing",
      ),
    );
  } else {
    checks.push(
      check(
        "MKT-COMMERCIAL",
        "commercial",
        "Commercial control SLA bound",
        false,
        "commercialSlaId missing",
      ),
    );
  }

  const apis = listApiCatalogEntries({ productId: marketplace.productId });
  checks.push(
    check(
      "MKT-API",
      "api",
      "API product catalog available",
      apis.length >= 1,
      `apiEntries=${apis.length}`,
    ),
  );

  const partners = listPartners({ marketplaceId: marketplace.id });
  checks.push(
    check(
      "MKT-PARTNER",
      "partner",
      "Partner ecosystem present",
      partners.length >= 1,
      `partners=${partners.length}`,
    ),
  );

  const extensions = listExtensions({ marketplaceId: marketplace.id });
  checks.push(
    check(
      "MKT-EXTENSION",
      "extension",
      "Extension registry present",
      extensions.length >= 1,
      `extensions=${extensions.length}`,
    ),
  );

  const integrations = listIntegrationCatalogEntries({
    marketplaceId: marketplace.id,
  });
  checks.push(
    check(
      "MKT-INTEGRATION",
      "integration",
      "Integration catalog present",
      integrations.length >= 1,
      `integrations=${integrations.length}`,
    ),
  );

  const analytics = listEcosystemAnalytics({
    marketplaceId: marketplace.id,
  });
  checks.push(
    check(
      "MKT-ANALYTICS",
      "analytics",
      "Ecosystem analytics present",
      analytics.length >= 1,
      `analytics=${analytics.length}`,
    ),
  );

  checks.push(
    check(
      "MKT-SCORE",
      "marketplace",
      "Marketplace ecosystem score acceptable",
      marketplace.ecosystemScore >= 40,
      `ecosystem=${marketplace.ecosystemScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    marketplaceId: marketplace.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `marketplace readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertMarketplaceReadinessReady(
  result: MarketplaceReadinessResult,
): asserts result is MarketplaceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`marketplace ecosystem not ready: ${result.summary}`);
  }
}
