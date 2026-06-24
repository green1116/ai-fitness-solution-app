/**
 * V60 P14 — Production documentation (structured)
 */

export type PlatformDocSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
};

export const PLATFORM_DOCUMENTATION: PlatformDocSection[] = [
  {
    id: "architecture",
    title: "Platform Architecture",
    summary: "Layered SaaS: Runtime → Persistence → API → Portal → Intelligence",
    bullets: [
      "V48–V51: Production SaaS, Runtime, Persistence, API Exposure",
      "V52–V57: Portal UI, Workspace, Quote, Product Experience",
      "V58: Document & Delivery Platform",
      "V59: Enterprise Delivery Intelligence",
      "V60: Production Hardening & Readiness (this layer)",
    ],
  },
  {
    id: "security",
    title: "Security Model",
    summary: "Session auth + tenant isolation + RBAC + API protection",
    bullets: [
      "getPortalUserContext / authenticateRequest for portal APIs",
      "tenant.guard assertResourceBelongsToTenant for cross-org prevention",
      "rate-limit + api-protection pipeline on SaaS routes",
      "httpOnly session cookies (verify flags in production)",
    ],
  },
  {
    id: "permissions",
    title: "Permission Model",
    summary: "OWNER > ADMIN > MANAGER (portal) > MEMBER",
    bullets: [
      "Frozen RBAC: OWNER, ADMIN, MEMBER in role.service",
      "V60 matrix: MANAGER for executive surfaces",
      "MEMBER: workspace, projects, quotes, documents",
      "ADMIN/OWNER: production ops + billing (where enabled)",
    ],
  },
  {
    id: "workspace",
    title: "Workspace Model",
    summary: "Organization → Project → Quote journey",
    bullets: [
      "Register → Onboarding → Dashboard",
      "Session via /api/auth/me + workspace summary",
      "Product analytics in-memory (V57)",
    ],
  },
  {
    id: "delivery",
    title: "Delivery Model",
    summary: "Read-only synthesis from Export/Tender/Quote",
    bullets: [
      "Document Center /documents/*",
      "Delivery orchestrator wraps existing artifacts",
      "No Prisma schema changes in V58",
    ],
  },
  {
    id: "intelligence",
    title: "Intelligence Model",
    summary: "Read-only scoring, risk, recommendations",
    bullets: [
      "/intelligence/* UI + GET /api/intelligence/*",
      "Aggregates V57/V58 analytics logs",
      "Executive dashboard for management view",
    ],
  },
  {
    id: "deployment",
    title: "Deployment Notes",
    summary: "Production checklist",
    bullets: [
      "npm run verify:v60-production before deploy",
      "DISABLE ENABLE_MOCK_AUTH in production",
      "Run prisma migrations; verify organizationId columns",
      "Configure DATABASE_URL pooler; enable secure cookies",
      "Horizontal scaling: replace in-memory caches with Redis",
    ],
  },
];

export function getPlatformDocumentation(): PlatformDocSection[] {
  return PLATFORM_DOCUMENTATION;
}
