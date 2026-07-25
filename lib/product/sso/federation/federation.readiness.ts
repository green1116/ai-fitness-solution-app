/**
 * Product SSO — readiness
 */

import { PRODUCT_MFA_SECURITY_ID } from "../../mfa/factor/factor.constants";
import { listAssertions } from "../assertion/assertion.registry";
import { listConnections } from "../connection/connection.registry";
import { listExchanges } from "../exchange/exchange.registry";
import { listProviders } from "../provider/provider.registry";
import { PRODUCT_SSO_FEDERATION_BASE } from "./federation.constants";
import type {
  SsoReadinessCheck,
  SsoReadinessResult,
} from "./federation.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): SsoReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateSsoFederationReadiness(): SsoReadinessResult {
  const checks: SsoReadinessCheck[] = [];

  checks.push(
    check(
      "SSO-BASE",
      "foundation",
      "MFA security baseline aligned",
      PRODUCT_SSO_FEDERATION_BASE === PRODUCT_MFA_SECURITY_ID,
      `base=${PRODUCT_SSO_FEDERATION_BASE}`,
    ),
  );

  const providers = listProviders();
  checks.push(
    check(
      "SSO-PRV",
      "provider",
      "Active SSO providers present",
      providers.some((p) => p.status === "ACTIVE"),
      `providers=${providers.length}`,
    ),
  );

  const connections = listConnections();
  checks.push(
    check(
      "SSO-CONN",
      "connection",
      "Linked federated connections present",
      connections.some((c) => c.status === "LINKED"),
      `connections=${connections.length}`,
    ),
  );

  const assertions = listAssertions();
  checks.push(
    check(
      "SSO-AST",
      "assertion",
      "Accepted SSO assertions present",
      assertions.some((a) => a.result === "ACCEPT"),
      `assertions=${assertions.length}`,
    ),
  );

  const exchanges = listExchanges();
  checks.push(
    check(
      "SSO-XCH",
      "exchange",
      "Session exchanges present",
      exchanges.length >= 1,
      `exchanges=${exchanges.length}`,
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
    summary: `product-sso readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertSsoFederationReadinessReady(
  result: SsoReadinessResult,
): asserts result is SsoReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product sso federation not ready: ${result.summary}`,
    );
  }
}
