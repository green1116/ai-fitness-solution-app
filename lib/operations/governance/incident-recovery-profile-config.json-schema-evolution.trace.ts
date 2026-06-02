import type {
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionInput,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionTrace,
} from "./incident-recovery-profile-config.json-schema-evolution.types";

export function buildIncidentRecoveryProfileJsonSchemaEvolutionTrace(input: {
  runtime: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionInput;
  sourceVersion: string;
  targetVersion: string;
  compatibility: string;
  migrations: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration[];
  fallbackUsed: boolean;
}): GovernanceIncidentRecoveryProfileJsonSchemaEvolutionTrace {
  return {
    traceId: `incident-profile-json-schema-evolution-trace-${input.runtime.deploymentId}`,
    sourceVersion: input.sourceVersion,
    targetVersion: input.targetVersion,
    steps: [
      `compatibility=${input.compatibility}`,
      ...input.migrations.flatMap((m) => m.steps),
    ],
    fallback: input.fallbackUsed ? ["fallback to builtin config due to incompatible or invalid schema"] : [],
  };
}
