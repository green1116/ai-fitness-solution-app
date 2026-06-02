import { createHash } from "crypto";
import { GOVERNANCE_CHECKPOINT_VERSION, type GovernanceCheckpoint, type GovernanceSnapshot } from "./persistence.types";

function stableHash(snapshot: GovernanceSnapshot): string {
  const payload = JSON.stringify({
    snapshotId: snapshot.snapshotId,
    runtimeName: snapshot.runtimeName,
    runtimeVersion: snapshot.runtimeVersion,
    deploymentId: snapshot.inputSnapshot.deploymentId,
    orchestration: snapshot.orchestrationSnapshot,
    lifecycle: snapshot.lifecycleSnapshot,
    timestamp: snapshot.timestamp,
  });
  return createHash("sha256").update(payload).digest("hex").slice(0, 24);
}

export function buildGovernanceCheckpoint(input: {
  snapshot: GovernanceSnapshot;
  reason: string;
}): GovernanceCheckpoint {
  return {
    checkpointId: `gcp-${input.snapshot.inputSnapshot.deploymentId.slice(0, 10)}-${Date.now()}`,
    checkpointVersion: GOVERNANCE_CHECKPOINT_VERSION,
    checkpointReason: input.reason,
    checkpointStatus: "restorable",
    checkpointSource: "runtime-memory",
    checkpointHash: stableHash(input.snapshot),
    checkpointCreatedAt: new Date().toISOString(),
  };
}
