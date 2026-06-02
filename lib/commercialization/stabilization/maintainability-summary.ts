export const MAINTAINABILITY_SUMMARY_VERSION = "3.7-maintainability-1" as const;

export type MaintainabilityBullet = {
  id: string;
  text: string;
};

export type MaintainabilitySummary = {
  version: typeof MAINTAINABILITY_SUMMARY_VERSION;
  maintainId: string;
  bullets: MaintainabilityBullet[];
  bulletCount: number;
  maintainable: boolean;
  summary: string;
};

export function buildMaintainabilitySummary(input: {
  deploymentId: string;
  stabilizationReady: boolean;
}): MaintainabilitySummary {
  const maintainId = `MAINT-V37-${input.deploymentId.slice(0, 8)}`;

  const bullets: MaintainabilityBullet[] = [
    { id: "readonly", text: "Commercial surfaces remain read-only description layers." },
    { id: "verify", text: "Regression baseline scripts guard hub and product foundations." },
    { id: "canonical", text: "Canonical entry at /commercial/v37/hub is the stable navigation root." },
    { id: "freeze", text: "Freeze boundary blocks civilization/swarm/autonomous expansion." },
    { id: "docs", text: "Documentation-only changes allowed within sealed boundaries." },
  ];

  return {
    version: MAINTAINABILITY_SUMMARY_VERSION,
    maintainId,
    bullets,
    bulletCount: bullets.length,
    maintainable: input.stabilizationReady && bullets.length >= 4,
    summary: `maintainability id=${maintainId} maintainable=${input.stabilizationReady}`,
  };
}
