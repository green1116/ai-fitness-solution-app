/**
 * Product Identity — readiness
 */

import { PRODUCT_ITERATION_FOUNDATION_ID } from "../../iteration/cycle/cycle.constants";
import { listAccess } from "../access/access.registry";
import { listCredentials } from "../credential/credential.registry";
import { listPrincipals } from "../principal/principal.registry";
import { listSessions } from "../session/session.registry";
import { listTokens } from "../token/token.registry";
import { PRODUCT_IDENTITY_FOUNDATION_BASE } from "./authentication.constants";
import { listAuthentications } from "./authentication.registry";
import type {
  IdentityReadinessCheck,
  IdentityReadinessResult,
} from "./authentication.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): IdentityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateIdentityFoundationReadiness(): IdentityReadinessResult {
  const checks: IdentityReadinessCheck[] = [];

  checks.push(
    check(
      "ID-BASE",
      "foundation",
      "Iteration foundation baseline aligned",
      PRODUCT_IDENTITY_FOUNDATION_BASE === PRODUCT_ITERATION_FOUNDATION_ID,
      `base=${PRODUCT_IDENTITY_FOUNDATION_BASE}`,
    ),
  );

  const principals = listPrincipals();
  checks.push(
    check(
      "ID-PRN",
      "principal",
      "Principals present",
      principals.length >= 1,
      `principals=${principals.length}`,
    ),
  );

  const credentials = listCredentials();
  checks.push(
    check(
      "ID-CRD",
      "credential",
      "Credentials present",
      credentials.some((c) => c.active),
      `credentials=${credentials.length}`,
    ),
  );

  const auths = listAuthentications();
  checks.push(
    check(
      "ID-AUTH",
      "authentication",
      "Authentications present",
      auths.some((a) => a.status === "AUTHENTICATED"),
      `authentications=${auths.length}`,
    ),
  );

  const sessions = listSessions();
  checks.push(
    check(
      "ID-SES",
      "session",
      "Sessions present",
      sessions.some((s) => s.status === "ACTIVE"),
      `sessions=${sessions.length}`,
    ),
  );

  const tokens = listTokens();
  checks.push(
    check(
      "ID-TOK",
      "token",
      "Tokens issued",
      tokens.length >= 1,
      `tokens=${tokens.length}`,
    ),
  );

  const access = listAccess();
  checks.push(
    check(
      "ID-ACC",
      "access",
      "Access evaluations present",
      access.some((a) => a.decision === "ALLOW"),
      `access=${access.length}`,
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
    summary: `product-identity readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIdentityFoundationReadinessReady(
  result: IdentityReadinessResult,
): asserts result is IdentityReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product identity foundation not ready: ${result.summary}`,
    );
  }
}
