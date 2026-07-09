/**
 * V67 P3 — Alert severity tier definitions (declarative)
 */
import type { SeverityTierDefinition, SeverityTierManifest } from "./taxonomy.types";
import { V67_ALERT_TAXONOMY_VERSION } from "./taxonomy.types";

export const SEVERITY_TIER_CATALOG: SeverityTierDefinition[] = [
  {
    tier: "P0",
    label: "critical",
    foundationSeverity: "critical",
    responseMinutes: 5,
    pageRequired: true,
    required: true,
    description: "Immediate page; production impact",
  },
  {
    tier: "P1",
    label: "high",
    foundationSeverity: "high",
    responseMinutes: 15,
    pageRequired: true,
    required: true,
    description: "Urgent response; significant degradation",
  },
  {
    tier: "P2",
    label: "medium",
    foundationSeverity: "medium",
    responseMinutes: 60,
    pageRequired: false,
    required: true,
    description: "Business hours response; moderate impact",
  },
  {
    tier: "P3",
    label: "low",
    foundationSeverity: "low",
    responseMinutes: 240,
    pageRequired: false,
    required: true,
    description: "Low priority; track in backlog",
  },
  {
    tier: "P4",
    label: "info",
    foundationSeverity: "info",
    responseMinutes: 0,
    pageRequired: false,
    required: true,
    description: "Informational only; no page",
  },
];

export const SEVERITY_TIER_ORDER: SeverityTierDefinition["tier"][] = [
  "P0",
  "P1",
  "P2",
  "P3",
  "P4",
];

export function buildSeverityTierManifest(): SeverityTierManifest {
  const tiers = SEVERITY_TIER_CATALOG;
  const manifestComplete = tiers.length === 5 && tiers.every((t) => t.foundationSeverity.length > 0);

  return {
    version: V67_ALERT_TAXONOMY_VERSION,
    tierCount: tiers.length,
    manifestComplete,
    tiers,
    summary: [
      `severity-tiers count=${tiers.length}`,
      `complete=${manifestComplete}`,
    ].join(" "),
  };
}

export function mapFoundationSeverityToTier(
  foundationSeverity: string,
): SeverityTierDefinition["tier"] | null {
  const match = SEVERITY_TIER_CATALOG.find((t) => t.foundationSeverity === foundationSeverity);
  return match?.tier ?? null;
}

export function isPageRequiredForTier(tier: SeverityTierDefinition["tier"]): boolean {
  return SEVERITY_TIER_CATALOG.find((t) => t.tier === tier)?.pageRequired === true;
}
