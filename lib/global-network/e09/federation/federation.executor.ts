/**
 * E09-P4 — Federation Executor
 * Executes federation actions: register / link / evaluate / adjust
 */

import {
  linkFederations,
  type LinkFederationsInput,
  type TrustEdge,
} from "./federation.graph";
import {
  listFederations,
  registerFederation,
} from "./federation.registry";
import {
  adjustTrustLevel,
  evaluateTrust,
  type TrustEvaluation,
} from "./federation.trust";
import type {
  FederatedIdentity,
  RegisterFederationInput,
} from "./federation.types";

export type FederationActionKind =
  | "register"
  | "link"
  | "evaluate"
  | "adjust";

export type FederationAction =
  | {
      kind: "register";
      input: RegisterFederationInput;
    }
  | {
      kind: "link";
      input: LinkFederationsInput;
    }
  | {
      kind: "evaluate";
      sourceId: string;
      targetId: string;
      maxDepth?: number;
      minTrust?: number;
    }
  | {
      kind: "adjust";
      federationId: string;
      delta: number;
    };

export type FederationExecutionResult = {
  success: boolean;
  action: FederationActionKind;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
};

export type FederationExecutor = {
  execute: (action: FederationAction) => FederationExecutionResult;
  register: (input: RegisterFederationInput) => FederationExecutionResult;
  link: (input: LinkFederationsInput) => FederationExecutionResult;
  evaluate: (
    sourceId: string,
    targetId: string,
    options?: { maxDepth?: number; minTrust?: number },
  ) => FederationExecutionResult;
  adjust: (federationId: string, delta: number) => FederationExecutionResult;
};

export function createFederationExecutor(input: {
  /** When false, executor refuses actions (runtime not running). */
  isRunning: () => boolean;
}): FederationExecutor {
  const { isRunning } = input;

  function fail(
    action: FederationActionKind,
    startedAt: number,
    message: string,
  ): FederationExecutionResult {
    return {
      success: false,
      action,
      output: {},
      duration: Date.now() - startedAt,
      status: "failed",
      errorMessage: message,
    };
  }

  function ok(
    action: FederationActionKind,
    startedAt: number,
    output: Record<string, unknown>,
  ): FederationExecutionResult {
    return {
      success: true,
      action,
      output: Object.freeze(output),
      duration: Date.now() - startedAt,
      status: "result",
    };
  }

  function execute(action: FederationAction): FederationExecutionResult {
    const startedAt = Date.now();

    if (!isRunning()) {
      return fail(action.kind, startedAt, "runtime is not running");
    }

    try {
      switch (action.kind) {
        case "register": {
          const federation: FederatedIdentity = registerFederation(
            action.input,
          );
          return ok(action.kind, startedAt, {
            federationId: federation.id,
            identityId: federation.identityId,
            ownerNodeId: federation.ownerNodeId,
            scope: federation.scope,
            trustLevel: federation.trustLevel,
            status: federation.status,
            federationCount: listFederations().length,
          });
        }
        case "link": {
          const edge: TrustEdge = linkFederations(action.input);
          return ok(action.kind, startedAt, {
            source: edge.source,
            target: edge.target,
            kind: edge.kind,
            weight: edge.weight,
          });
        }
        case "evaluate": {
          const evaluation: TrustEvaluation = evaluateTrust(
            action.sourceId,
            action.targetId,
            {
              maxDepth: action.maxDepth,
              minTrust: action.minTrust,
            },
          );
          return ok(action.kind, startedAt, {
            sourceId: evaluation.sourceId,
            targetId: evaluation.targetId,
            valid: evaluation.valid,
            trust: evaluation.trust,
            pathCount: evaluation.pathCount,
            reason: evaluation.reason,
            bestPath: evaluation.bestPath
              ? {
                  nodes: evaluation.bestPath.nodes,
                  minWeight: evaluation.bestPath.minWeight,
                  pathTrust: evaluation.bestPath.pathTrust,
                }
              : undefined,
          });
        }
        case "adjust": {
          const federation = adjustTrustLevel(
            action.federationId,
            action.delta,
          );
          return ok(action.kind, startedAt, {
            federationId: federation.id,
            trustLevel: federation.trustLevel,
            status: federation.status,
            delta: action.delta,
          });
        }
      }
    } catch (error) {
      return fail(
        action.kind,
        startedAt,
        error instanceof Error ? error.message : "federation action failed",
      );
    }
  }

  return {
    execute,
    register: (registerInput) =>
      execute({ kind: "register", input: registerInput }),
    link: (linkInput) => execute({ kind: "link", input: linkInput }),
    evaluate: (sourceId, targetId, options) =>
      execute({
        kind: "evaluate",
        sourceId,
        targetId,
        maxDepth: options?.maxDepth,
        minTrust: options?.minTrust,
      }),
    adjust: (federationId, delta) =>
      execute({ kind: "adjust", federationId, delta }),
  };
}
