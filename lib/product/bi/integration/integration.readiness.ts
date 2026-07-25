/**
 * Product BI — readiness
 */

import { PRODUCT_FORECAST_TREND_ID } from "../../forecast/trend/trend.constants";
import { listCatalogEntries } from "../catalog/catalog.registry";
import { listConnectors } from "../connector/connector.registry";
import { listBiQueries } from "../query/query.registry";
import { listBiSyncs } from "../sync/sync.registry";
import { PRODUCT_BI_INTEGRATION_BASE } from "./integration.constants";
import type {
  BiReadinessCheck,
  BiReadinessResult,
} from "./integration.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): BiReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateBiIntegrationReadiness(): BiReadinessResult {
  const checks: BiReadinessCheck[] = [];

  checks.push(
    check(
      "BI-BASE",
      "integration",
      "Forecast trend aligned",
      PRODUCT_BI_INTEGRATION_BASE === PRODUCT_FORECAST_TREND_ID,
      `base=${PRODUCT_BI_INTEGRATION_BASE}`,
    ),
  );

  const connectors = listConnectors();
  checks.push(
    check(
      "BI-CN",
      "connector",
      "Connected connectors present",
      connectors.some((c) => c.status === "CONNECTED"),
      `connectors=${connectors.length}`,
    ),
  );

  const catalog = listCatalogEntries();
  checks.push(
    check(
      "BI-CAT",
      "catalog",
      "Catalog entries present",
      catalog.length >= 1,
      `catalog=${catalog.length}`,
    ),
  );

  const syncs = listBiSyncs();
  checks.push(
    check(
      "BI-SYNC",
      "sync",
      "Successful syncs present",
      syncs.some((s) => s.result === "SUCCESS"),
      `syncs=${syncs.length}`,
    ),
  );

  const queries = listBiQueries();
  checks.push(
    check(
      "BI-QRY",
      "query",
      "BI queries present",
      queries.some((q) => q.matchCount >= 1),
      `queries=${queries.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-bi readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertBiIntegrationReadinessReady(
  result: BiReadinessResult,
): asserts result is BiReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product bi integration not ready: ${result.summary}`,
    );
  }
}
