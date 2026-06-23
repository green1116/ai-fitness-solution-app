/**
 * V60 P1 — Security hardening audit (static + runtime signals)
 */

import fs from "node:fs";
import path from "node:path";

export type SecurityRiskLevel = "critical" | "high" | "medium" | "low";

export type SecurityFinding = {
  id: string;
  area: string;
  title: string;
  level: SecurityRiskLevel;
  recommendation: string;
};

export type SecurityAuditReport = {
  findings: SecurityFinding[];
  byLevel: Record<SecurityRiskLevel, number>;
  score: number;
  auditedAt: string;
};

const ROOT = path.resolve(process.cwd());

const PORTAL_API_PREFIXES = [
  "app/api/workspace",
  "app/api/documents",
  "app/api/intelligence",
  "app/api/auth",
  "app/api/register",
  "app/api/onboarding",
  "app/api/quote/generate",
];

function readIfExists(rel: string): string | null {
  const full = path.join(ROOT, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : null;
}

function scanRouteAuth(rel: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const src = readIfExists(rel);
  if (!src) return findings;

  const hasGetOrPost = src.includes("export async function GET") || src.includes("export async function POST");
  if (!hasGetOrPost) return findings;

  const protected_ =
    src.includes("getPortalUserContext") ||
    src.includes("authenticateRequest") ||
    src.includes("runApiProtection") ||
    src.includes("enforceTenantScope");

  if (!protected_ && !rel.includes("auth/") && !rel.includes("register")) {
    findings.push({
      id: `sec_auth_${rel}`,
      area: "API Protection",
      title: `Route may lack auth guard: ${rel}`,
      level: rel.includes("debug") ? "critical" : "high",
      recommendation: "Add getPortalUserContext or api-gate protection",
    });
  }

  if (src.includes("localStorage") && src.includes("auth")) {
    findings.push({
      id: `sec_ls_${rel}`,
      area: "Session Handling",
      title: "localStorage auth pattern detected",
      level: "high",
      recommendation: "Use server session cookies only",
    });
  }

  return findings;
}

export function runSecurityAudit(): SecurityAuditReport {
  const findings: SecurityFinding[] = [];

  const authCtx = readIfExists("lib/portal/v57/auth-context.ts");
  if (authCtx?.includes("getCurrentUser")) {
    findings.push({
      id: "sec_session_ok",
      area: "Session Handling",
      title: "Portal session uses server-side getCurrentUser",
      level: "low",
      recommendation: "Maintain httpOnly session cookies in production",
    });
  }

  const tenantGuard = readIfExists("lib/tenancy/tenant.guard.ts");
  if (!tenantGuard?.includes("assertResourceBelongsToTenant")) {
    findings.push({
      id: "sec_tenant_missing",
      area: "Organization Isolation",
      title: "Tenant guard module incomplete",
      level: "critical",
      recommendation: "Ensure tenant.guard is deployed",
    });
  }

  for (const prefix of PORTAL_API_PREFIXES) {
    const dir = path.join(ROOT, prefix);
    if (!fs.existsSync(dir)) continue;
    const walk = (d: string) => {
      for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, ent.name);
        if (ent.isDirectory()) walk(full);
        else if (ent.name === "route.ts") {
          const rel = path.relative(ROOT, full).replace(/\\/g, "/");
          findings.push(...scanRouteAuth(rel));
        }
      }
    };
    walk(dir);
  }

  const cookieNotes = readIfExists("lib/auth/session.service.ts");
  if (cookieNotes && !cookieNotes.includes("httpOnly") && !cookieNotes.includes("secure")) {
    findings.push({
      id: "sec_cookie_flags",
      area: "Cookie Security",
      title: "Review cookie security flags for production",
      level: "medium",
      recommendation: "Set httpOnly, secure, sameSite in production",
    });
  }

  const byLevel: Record<SecurityRiskLevel, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const f of findings) byLevel[f.level]++;

  const penalty = byLevel.critical * 25 + byLevel.high * 12 + byLevel.medium * 5;
  const score = Math.max(0, Math.min(100, 98 - penalty + byLevel.low));

  return {
    findings,
    byLevel,
    score,
    auditedAt: new Date().toISOString(),
  };
}
