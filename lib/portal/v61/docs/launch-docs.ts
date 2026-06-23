/**
 * V61 P9 — Launch documentation
 */

export type LaunchDocSection = {
  id: string;
  title: string;
  bullets: string[];
};

export const LAUNCH_DOCUMENTATION: LaunchDocSection[] = [
  {
    id: "architecture",
    title: "Platform Architecture",
    bullets: [
      "V48–V60 frozen layers: SaaS, Workspace, Quote, Delivery, Intelligence, Production Readiness",
      "V61: Launch closure — RBAC, validation, Go/No-Go (no new business modules)",
    ],
  },
  {
    id: "permissions",
    title: "Permissions (V61 RBAC)",
    bullets: [
      "OWNER / ADMIN / MANAGER / MEMBER portal matrix",
      "Executive: MANAGER+ (ADMIN inherits)",
      "Launch & Production Ops: ADMIN+",
      "enforce via requirePortalSurface in API routes",
    ],
  },
  {
    id: "operations",
    title: "Operations",
    bullets: [
      "/launch — Launch Center",
      "/production — Health & readiness",
      "GET /api/launch/operations — ops dashboard",
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    bullets: [
      "npm run verify:v61-launch",
      "Set DATABASE_URL, SESSION_SECRET (non-default)",
      "Production: ENABLE_COMMERCIAL_REGISTER=1 for register",
      "Never ENABLE_MOCK_AUTH in production",
    ],
  },
  {
    id: "runbooks",
    title: "Runbooks",
    bullets: [
      "Schema mismatch → run prisma migrate deploy",
      "Auth failures → verify session cookie + SESSION_SECRET",
      "Empty org data → verify Project.organizationId column",
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    bullets: [
      "403 PORTAL_FORBIDDEN → role lacks surface access",
      "REGISTER_DISABLED → set ENABLE_COMMERCIAL_REGISTER=1 in prod",
      "Integrity degraded → check DB migrations",
    ],
  },
  {
    id: "launch_guide",
    title: "Launch Guide",
    bullets: [
      "1. Run verify:v61-launch",
      "2. Review /launch Go/No-Go",
      "3. Resolve blockers",
      "4. Deploy with production env vars",
      "5. Smoke test Register → Quote → Download journey",
    ],
  },
];

export function getLaunchDocumentation(): LaunchDocSection[] {
  return LAUNCH_DOCUMENTATION;
}
