/**
 * Product Session — readiness
 */

import { PRODUCT_AUTHORIZATION_RBAC_ID } from "../../authorization/rbac/rbac.constants";
import { listSessions } from "../lifecycle/lifecycle.registry";
import { listRefreshes } from "../refresh/refresh.registry";
import { listTokens } from "../token/token.registry";
import { listValidations } from "../validation/validation.registry";
import { PRODUCT_SESSION_CONTROL_BASE } from "./control.constants";
import type {
  SessionReadinessCheck,
  SessionReadinessResult,
} from "./control.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): SessionReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateSessionControlReadiness(): SessionReadinessResult {
  const checks: SessionReadinessCheck[] = [];

  checks.push(
    check(
      "SC-BASE",
      "foundation",
      "Authorization RBAC baseline aligned",
      PRODUCT_SESSION_CONTROL_BASE === PRODUCT_AUTHORIZATION_RBAC_ID,
      `base=${PRODUCT_SESSION_CONTROL_BASE}`,
    ),
  );

  const sessions = listSessions();
  checks.push(
    check(
      "SC-SES",
      "lifecycle",
      "Active sessions present",
      sessions.some((s) => s.status === "ACTIVE"),
      `sessions=${sessions.length}`,
    ),
  );

  const tokens = listTokens();
  checks.push(
    check(
      "SC-TOK",
      "token",
      "Active tokens present",
      tokens.some((t) => t.status === "ACTIVE" && t.kind === "ACCESS"),
      `tokens=${tokens.length}`,
    ),
  );

  const refreshes = listRefreshes();
  checks.push(
    check(
      "SC-REF",
      "refresh",
      "Refresh flow records present",
      refreshes.length >= 1,
      `refreshes=${refreshes.length}`,
    ),
  );

  const validations = listValidations();
  checks.push(
    check(
      "SC-VAL",
      "validation",
      "Valid session validations present",
      validations.some((v) => v.result === "VALID"),
      `validations=${validations.length}`,
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
    summary: `product-session readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertSessionControlReadinessReady(
  result: SessionReadinessResult,
): asserts result is SessionReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product session control not ready: ${result.summary}`,
    );
  }
}
