/**
 * E08-P1 — Ecosystem Executor
 * Bridges ecosystem partners onto E07 digital worker execute()
 */

import { getWorkerById } from "../../../workforce/e07/core/workforce.registry";
import { createWorkforceExecutionContext } from "../../../workforce/e07/runtime/workforce.context";
import {
  executeWorker,
  type WorkforceExecuteBundle,
} from "../../../workforce/e07/runtime/workforce.executor";
import { getRelationshipById } from "../relationship/relationship.registry";
import type { EcosystemPartnerDefinition } from "../core/ecosystem.types";
import {
  assertValidEcosystemContext,
  type EcosystemExecutionContext,
} from "./ecosystem.context";

export type EcosystemExecutionResult = {
  success: boolean;
  partnerId: string;
  workerId: string;
  relationshipId?: string;
  output: Readonly<Record<string, unknown>>;
  workforce: WorkforceExecuteBundle;
  duration: number;
  status: "result" | "blocked" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type EcosystemExecuteBundle = {
  result: EcosystemExecutionResult;
  context: EcosystemExecutionContext;
};

export function executeEcosystemPartner(
  partner: EcosystemPartnerDefinition,
  context: EcosystemExecutionContext,
): EcosystemExecuteBundle {
  assertValidEcosystemContext(context);

  if (partner.id !== context.partnerId) {
    throw new Error(
      `partner/context mismatch: partner.id=${partner.id} context.partnerId=${context.partnerId}`,
    );
  }
  if (partner.workerId !== context.workerId) {
    throw new Error(
      `worker binding mismatch: partner.workerId=${partner.workerId} context.workerId=${context.workerId}`,
    );
  }

  const startedAt = Date.now();

  try {
    if (
      context.relationshipId &&
      !partner.relationshipIds.includes(context.relationshipId)
    ) {
      throw new Error(
        `relationship ${context.relationshipId} is not owned by ${partner.id}`,
      );
    }

    const worker = getWorkerById(partner.workerId);
    if (!worker) {
      throw new Error(`E07 worker missing: ${partner.workerId}`);
    }

    const relationship = context.relationshipId
      ? getRelationshipById(context.relationshipId)
      : undefined;

    const skillId = worker.skillIds[0];
    const workforceContext = createWorkforceExecutionContext({
      workerId: worker.id,
      operationId: worker.operationId,
      skillId,
      taskId: context.taskId,
      executionId: context.executionId,
      input: {
        ...context.input,
        partnerId: partner.id,
        partnerDomain: partner.domain,
        relationshipId: context.relationshipId,
        relationshipKind: relationship?.kind,
        goal:
          typeof context.input.goal === "string"
            ? context.input.goal
            : `ecosystem:${partner.domain}`,
      },
      metadata: {
        ...context.metadata,
        layer: "e08-ecosystem",
        partnerId: partner.id,
      },
    });

    const workforce = executeWorker(worker, workforceContext);
    const duration = Date.now() - startedAt;

    if (!workforce.result.success) {
      const status =
        workforce.result.status === "blocked" ? "blocked" : "failed";
      return {
        context,
        result: {
          success: false,
          partnerId: partner.id,
          workerId: partner.workerId,
          relationshipId: context.relationshipId,
          output: {},
          workforce,
          duration,
          status,
          errorMessage:
            workforce.result.errorMessage ?? "workforce worker failed",
          readOnly: true,
        },
      };
    }

    return {
      context,
      result: {
        success: true,
        partnerId: partner.id,
        workerId: partner.workerId,
        relationshipId: context.relationshipId,
        output: Object.freeze({
          domain: partner.domain,
          relationshipId: context.relationshipId ?? null,
          relationshipKind: relationship?.kind ?? null,
          workforceOutput: workforce.result.output,
        }),
        workforce,
        duration,
        status: "result",
        readOnly: true,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ecosystem partner failed";
    const duration = Date.now() - startedAt;
    throw Object.assign(new Error(message), {
      duration,
      partnerId: partner.id,
    });
  }
}

export function executeEcosystemPartnerOrThrow(
  partner: EcosystemPartnerDefinition,
  context: EcosystemExecutionContext,
): EcosystemExecuteBundle & {
  result: EcosystemExecutionResult & { success: true; status: "result" };
} {
  try {
    const bundle = executeEcosystemPartner(partner, context);
    if (!bundle.result.success || bundle.result.status !== "result") {
      throw new Error(
        `E08 ecosystem execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
      );
    }
    return bundle as EcosystemExecuteBundle & {
      result: EcosystemExecutionResult & {
        success: true;
        status: "result";
      };
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ecosystem partner failed";
    throw new Error(`E08 ecosystem execution failed: ${message}`);
  }
}
