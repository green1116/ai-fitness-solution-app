/**
 * V3.7-H8 Ops Portal — static portal configuration (no real auth)
 */

export const OPS_PORTAL_CONFIG_VERSION = "3.7-h8-config-1" as const;

export type OpsPortalBadgeTone = "info" | "success" | "warn";

export type OpsPortalBadge = {
  id: string;
  label: string;
  tone: OpsPortalBadgeTone;
};

export type OpsPortalEntry = {
  id: string;
  label: string;
  href: string;
  apiHref?: string;
  accessGroup: string;
  badge?: string;
  description: string;
};

export type OpsPortalSection = {
  id: string;
  label: string;
  entries: OpsPortalEntry[];
};

export type OpsPortalConfig = {
  portalVersion: typeof OPS_PORTAL_CONFIG_VERSION;
  defaultLanding: string;
  sections: OpsPortalSection[];
  badges: OpsPortalBadge[];
  accessGroups: string[];
};

export const OPS_PORTAL_ACCESS_GROUPS = [
  "ops",
  "release",
  "audit",
  "ledger",
  "evidence",
  "observability",
] as const;

export type OpsPortalAccessGroup = (typeof OPS_PORTAL_ACCESS_GROUPS)[number];

export const OPS_PORTAL_CONFIG: OpsPortalConfig = {
  portalVersion: OPS_PORTAL_CONFIG_VERSION,
  defaultLanding: "/dashboard/release-ledger",
  accessGroups: [...OPS_PORTAL_ACCESS_GROUPS],
  badges: [
    { id: "readonly", label: "Readonly", tone: "info" },
    { id: "release-ready", label: "Release Ready", tone: "success" },
    { id: "ops-review", label: "Ops Review", tone: "warn" },
  ],
  sections: [
    {
      id: "release",
      label: "Release",
      entries: [
        {
          id: "release-stabilization",
          label: "Stabilization",
          href: "/commercial/v37/stabilization",
          accessGroup: "release",
          badge: "release-ready",
          description: "V3.7 consolidation & release readiness surface.",
        },
        {
          id: "release-ledger",
          label: "Release Ledger",
          href: "/dashboard/release-ledger",
          apiHref: "/api/commercialization/release-ledger",
          accessGroup: "ledger",
          badge: "readonly",
          description: "Production release ledger review.",
        },
      ],
    },
    {
      id: "audit",
      label: "Audit",
      entries: [
        {
          id: "audit-review",
          label: "Audit Review",
          href: "/dashboard/audit-review",
          apiHref: "/api/commercialization/audit",
          accessGroup: "audit",
          badge: "readonly",
          description: "Audit snapshot, trace, and verification lineage.",
        },
      ],
    },
    {
      id: "evidence",
      label: "Evidence",
      entries: [
        {
          id: "evidence-export",
          label: "Evidence Export",
          href: "/dashboard/evidence-export",
          apiHref: "/api/commercialization/evidence-export",
          accessGroup: "evidence",
          badge: "readonly",
          description: "Static evidence chain for audit replay.",
        },
      ],
    },
    {
      id: "ops",
      label: "Operations",
      entries: [
        {
          id: "dashboard",
          label: "Dashboard",
          href: "/dashboard",
          accessGroup: "ops",
          description: "User console entry.",
        },
        {
          id: "commercial-ops",
          label: "Commercial Ops",
          href: "/commercial/v37/operations",
          accessGroup: "observability",
          badge: "ops-review",
          description: "Post-launch commercial operations surface.",
        },
      ],
    },
  ],
};

export function getOpsPortalConfig(): OpsPortalConfig {
  return OPS_PORTAL_CONFIG;
}
