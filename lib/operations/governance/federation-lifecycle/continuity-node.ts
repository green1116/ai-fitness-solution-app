import type { FederationLifecyclePhase, FederationNodeLifecycleState } from "./continuity-types";
import type { FederationNode } from "../federation/federation-types";

export function buildFederationNodeLifecycle(input: {
  nodes: FederationNode[];
  globalPhase: FederationLifecyclePhase;
}): FederationNodeLifecycleState[] {
  return input.nodes.map((node) => {
    let phase: FederationLifecyclePhase = input.globalPhase;
    if (node.status === "failed") phase = "retiring";
    else if (node.status === "degraded" && phase === "active") phase = "degraded";

    return {
      nodeId: node.nodeId,
      domainId: node.domainId,
      phase,
      active: phase === "active" || phase === "degraded" || phase === "recovering",
    };
  });
}
