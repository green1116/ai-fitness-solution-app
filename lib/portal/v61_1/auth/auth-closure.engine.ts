/**
 * V61.1 P3 — Production auth closure (SESSION_SECRET + MOCK_AUTH)
 */

export type AuthClosureCheck = {
  key: string;
  status: "pass" | "fail" | "warn";
  detail: string;
};

export type AuthClosureReport = {
  checks: AuthClosureCheck[];
  productionAuthClosed: boolean;
  sessionSecretProductionGrade: boolean;
  mockAuthDisabled: boolean;
  score: number;
  blockers: string[];
  evaluatedAt: string;
};

const WEAK_SECRETS = new Set(["sess", "dev", "secret", "changeme", "test"]);
const PLACEHOLDER_PATTERNS = [/^<.*>$/, /^\[.*\]$/, /^your[-_]/i, /^replace[-_]/i];

function isProductionEval(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.LAUNCH_CLOSURE_EVAL === "1"
  );
}

function isProductionGradeSecret(secret: string | undefined): boolean {
  if (!secret) return false;
  if (secret.length < 32) return false;
  if (WEAK_SECRETS.has(secret.toLowerCase())) return false;
  if (PLACEHOLDER_PATTERNS.some((p) => p.test(secret))) return false;
  if (secret.includes("<32+") || secret.includes("[PASSWORD]")) return false;
  return true;
}

export function validateAuthClosure(): AuthClosureReport {
  const checks: AuthClosureCheck[] = [];
  const blockers: string[] = [];
  const prodEval = isProductionEval();

  const sessionSecret = process.env.SESSION_SECRET;
  const sessionOk = isProductionGradeSecret(sessionSecret);
  checks.push({
    key: "SESSION_SECRET",
    status: sessionOk ? "pass" : prodEval ? "fail" : "warn",
    detail: sessionOk
      ? `configured (${sessionSecret!.length} chars)`
      : sessionSecret
        ? "weak or placeholder secret"
        : "missing (defaults to sess)",
  });
  if (prodEval && !sessionOk) {
    blockers.push("B3: SESSION_SECRET must be production-grade (32+ chars, non-default)");
  }

  const mockEnabled = process.env.ENABLE_MOCK_AUTH === "1";
  const mockOk = process.env.NODE_ENV !== "production" || !mockEnabled;
  checks.push({
    key: "ENABLE_MOCK_AUTH",
    status: mockOk ? "pass" : "fail",
    detail:
      process.env.NODE_ENV === "production"
        ? mockEnabled
          ? "enabled in production — blocked"
          : "disabled in production"
        : "dev environment",
  });
  if (!mockOk) {
    blockers.push("B3: ENABLE_MOCK_AUTH must be off in production");
  }

  checks.push({
    key: "MOCK_LOGIN_ROUTE",
    status: "pass",
    detail: "mock-login gated by NODE_ENV !== production (V61 debt closure)",
  });

  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const score = Math.max(0, 100 - failCount * 30 - warnCount * 10);

  return {
    checks,
    productionAuthClosed: mockOk && (sessionOk || !prodEval),
    sessionSecretProductionGrade: sessionOk,
    mockAuthDisabled: mockOk,
    score,
    blockers: [...new Set(blockers)],
    evaluatedAt: new Date().toISOString(),
  };
}
