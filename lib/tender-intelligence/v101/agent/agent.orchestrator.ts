/**
 * E01-P6 — Agent Orchestrator
 * Plans and executes registered tender-intelligence agents in lifecycle order
 */

import { createHash, randomUUID } from "node:crypto";

import { runTenderIntakeKernelOrThrow } from "../intake";
import { runUnderstandingKernelOrThrow } from "../understanding";
import { runIntelligenceKernelOrThrow } from "../intelligence";
import { runStrategyKernelOrThrow } from "../strategy";
import { runProposalKernelOrThrow } from "../proposal";
import {
  buildAgentRegistryManifest,
  getAgentById,
  isAgentDependencyGraphValid,
  listExecutableAgents,
} from "./agent.registry";
import {
  assertValidRegistry,
  ORCHESTRATION_LIFECYCLE_STAGES,
  validateOrchestrationInput,
  validateOrchestrationPlan,
} from "./agent.schema";
import type {
  AgentOrchestrationInput,
  AgentOrchestrationResult,
  AgentRunRecord,
  OrchestrationArtifactRefs,
  OrchestrationLifecycle,
  OrchestrationLifecycleStage,
  OrchestrationLifecycleTransition,
  OrchestrationPlan,
  OrchestrationPlanStep,
} from "./agent.types";
import {
  V101_AGENT_ORCHESTRATION_FREEZE_VERSION,
  V101_AGENT_ORCHESTRATION_VERSION,
} from "./agent.types";

function nowIso(): string {
  return new Date().toISOString();
}

function stableId(prefix: string, seed: string): string {
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `${prefix}_${hash}`;
}

function pushTransition(
  transitions: OrchestrationLifecycleTransition[],
  from: OrchestrationLifecycleStage,
  to: OrchestrationLifecycleStage,
  note?: string,
): void {
  transitions.push({
    from,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  });
}

export function buildOrchestrationPlan(deploymentId: string): OrchestrationPlan {
  const executable = listExecutableAgents();
  const steps: OrchestrationPlanStep[] = executable.map((agent, order) => ({
    id: stableId("step", `${deploymentId}|${agent.id}|${order}`),
    order,
    agentId: agent.id,
    role: agent.role,
    dependsOn: [...agent.dependsOn],
    readOnly: true,
  }));

  const plan: OrchestrationPlan = {
    id: stableId("plan", `${deploymentId}|${steps.map((s) => s.agentId).join("|")}`),
    stepCount: steps.length,
    steps,
    readOnly: true,
  };

  const validated = validateOrchestrationPlan(plan);
  if (!validated.ok) {
    throw new Error(
      `Invalid OrchestrationPlan: ${validated.issues.map((i) => `${i.path}: ${i.message}`).join("; ")}`,
    );
  }
  return plan;
}

function createRun(input: {
  agentId: string;
  role: AgentRunRecord["role"];
  status: AgentRunRecord["status"];
  startedAt: string;
  finishedAt?: string;
  outputRef?: string;
  message: string;
}): AgentRunRecord {
  const durationMs =
    input.finishedAt != null
      ? Math.max(0, Date.parse(input.finishedAt) - Date.parse(input.startedAt))
      : undefined;

  return {
    id: stableId("run", `${input.agentId}|${input.startedAt}|${input.status}`),
    agentId: input.agentId,
    role: input.role,
    status: input.status,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    durationMs,
    outputRef: input.outputRef,
    message: input.message,
    readOnly: true,
  };
}

export function buildOrchestrationLifecycle(input: {
  hasRegistry: boolean;
  hasPlan: boolean;
  executed: boolean;
  assembled: boolean;
}): OrchestrationLifecycle {
  const transitions: OrchestrationLifecycleTransition[] = [];
  let current: OrchestrationLifecycleStage = "registry";

  if (input.hasRegistry) {
    // start already at registry
  }

  if (input.hasPlan) {
    pushTransition(transitions, "registry", "plan", "plan built from registry");
    current = "plan";
  }

  if (input.executed) {
    pushTransition(transitions, "plan", "execute", "agents executed");
    current = "execute";
  }

  if (input.assembled) {
    pushTransition(transitions, "execute", "assemble", "artifacts assembled");
    current = "assemble";
  }

  const complete =
    input.hasRegistry &&
    input.hasPlan &&
    input.executed &&
    input.assembled &&
    current === "assemble";

  return {
    current,
    stages: [...ORCHESTRATION_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function runAgentOrchestration(
  input: AgentOrchestrationInput,
): AgentOrchestrationResult {
  const validatedInput = validateOrchestrationInput(input);
  if (!validatedInput.ok) {
    throw new Error(
      `Invalid orchestration input: ${validatedInput.issues
        .map((i) => `${i.path}: ${i.message}`)
        .join("; ")}`,
    );
  }

  const deploymentId = input.deploymentId?.trim() || "v101-p6-agent-default";
  const generatedAt = nowIso();
  const runs: AgentRunRecord[] = [];
  const artifacts: OrchestrationArtifactRefs = {};

  const registry = buildAgentRegistryManifest();
  assertValidRegistry(registry);
  if (!registry.catalogComplete) {
    throw new Error("Agent registry catalog is incomplete");
  }
  if (!isAgentDependencyGraphValid()) {
    throw new Error("Agent dependency graph is invalid");
  }

  const plan = buildOrchestrationPlan(deploymentId);

  // Execute pipeline agents in plan order (read-only reuse of P1-P5 kernels)
  let intakeResult: ReturnType<typeof runTenderIntakeKernelOrThrow> | null = null;
  let understandingResult: ReturnType<typeof runUnderstandingKernelOrThrow> | null = null;
  let intelligenceResult: ReturnType<typeof runIntelligenceKernelOrThrow> | null = null;
  let strategyResult: ReturnType<typeof runStrategyKernelOrThrow> | null = null;
  let proposalResult: ReturnType<typeof runProposalKernelOrThrow> | null = null;

  for (const step of plan.steps) {
    const agent = getAgentById(step.agentId);
    if (!agent) {
      throw new Error(`Unknown agent in plan: ${step.agentId}`);
    }

    const startedAt = nowIso();
    try {
      if (agent.role === "intake") {
        intakeResult = runTenderIntakeKernelOrThrow({
          deploymentId: `${deploymentId}-intake`,
          projectHint: input.projectHint,
          organizationHint: input.organizationHint,
          source: {
            kind: "paste",
            rawText: input.rawText,
          },
        });
        artifacts.intakeReportId = intakeResult.reportId;
        artifacts.workspaceId = intakeResult.workspace.id;
        runs.push(
          createRun({
            agentId: agent.id,
            role: agent.role,
            status: "succeeded",
            startedAt,
            finishedAt: nowIso(),
            outputRef: intakeResult.reportId,
            message: `intake ready workspace=${intakeResult.workspace.id}`,
          }),
        );
        continue;
      }

      if (agent.role === "understanding") {
        if (!intakeResult) throw new Error("understanding requires intake result");
        understandingResult = runUnderstandingKernelOrThrow({
          deploymentId: `${deploymentId}-understanding`,
          workspace: intakeResult.workspace,
          rawText: input.rawText,
        });
        artifacts.understandingReportId = understandingResult.reportId;
        artifacts.requirementIndexId = understandingResult.requirementIndex.id;
        runs.push(
          createRun({
            agentId: agent.id,
            role: agent.role,
            status: "succeeded",
            startedAt,
            finishedAt: nowIso(),
            outputRef: understandingResult.reportId,
            message: `understanding ready requirements=${understandingResult.requirementIndex.entryCount}`,
          }),
        );
        continue;
      }

      if (agent.role === "intelligence") {
        if (!understandingResult) throw new Error("intelligence requires understanding result");
        intelligenceResult = runIntelligenceKernelOrThrow({
          deploymentId: `${deploymentId}-intelligence`,
          requirementIndex: understandingResult.requirementIndex,
          estimatedValueHint: input.estimatedValueHint,
        });
        artifacts.intelligenceReportId = intelligenceResult.reportId;
        artifacts.opportunityId = intelligenceResult.opportunity.id;
        runs.push(
          createRun({
            agentId: agent.id,
            role: agent.role,
            status: "succeeded",
            startedAt,
            finishedAt: nowIso(),
            outputRef: intelligenceResult.reportId,
            message: `intelligence ready tier=${intelligenceResult.opportunity.tier}`,
          }),
        );
        continue;
      }

      if (agent.role === "strategy") {
        if (!intelligenceResult) throw new Error("strategy requires intelligence result");
        strategyResult = runStrategyKernelOrThrow({
          deploymentId: `${deploymentId}-strategy`,
          opportunity: intelligenceResult.opportunity,
          preferredEmphasis: input.preferredEmphasis,
        });
        artifacts.strategyReportId = strategyResult.reportId;
        artifacts.strategyId = strategyResult.strategy.id;
        runs.push(
          createRun({
            agentId: agent.id,
            role: agent.role,
            status: "succeeded",
            startedAt,
            finishedAt: nowIso(),
            outputRef: strategyResult.reportId,
            message: `strategy ready posture=${strategyResult.strategy.posture}`,
          }),
        );
        continue;
      }

      if (agent.role === "proposal") {
        if (!strategyResult || !understandingResult) {
          throw new Error("proposal requires strategy and understanding results");
        }
        proposalResult = runProposalKernelOrThrow({
          deploymentId: `${deploymentId}-proposal`,
          strategy: strategyResult.strategy,
          requirementIndex: understandingResult.requirementIndex,
          titleHint: input.titleHint,
        });
        artifacts.proposalReportId = proposalResult.reportId;
        artifacts.blueprintId = proposalResult.blueprint.id;
        runs.push(
          createRun({
            agentId: agent.id,
            role: agent.role,
            status: "succeeded",
            startedAt,
            finishedAt: nowIso(),
            outputRef: proposalResult.reportId,
            message: `proposal ready chapters=${proposalResult.blueprint.chapterCount}`,
          }),
        );
        continue;
      }

      runs.push(
        createRun({
          agentId: agent.id,
          role: agent.role,
          status: "skipped",
          startedAt,
          finishedAt: nowIso(),
          message: `role ${agent.role} not executable in this pipeline`,
        }),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "agent failed";
      runs.push(
        createRun({
          agentId: agent.id,
          role: agent.role,
          status: "failed",
          startedAt,
          finishedAt: nowIso(),
          message,
        }),
      );
      throw error;
    }
  }

  const succeeded = runs.filter((r) => r.status === "succeeded").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const assembled =
    Boolean(artifacts.intakeReportId) &&
    Boolean(artifacts.understandingReportId) &&
    Boolean(artifacts.intelligenceReportId) &&
    Boolean(artifacts.strategyReportId) &&
    Boolean(artifacts.proposalReportId) &&
    failed === 0;

  const lifecycle = buildOrchestrationLifecycle({
    hasRegistry: true,
    hasPlan: true,
    executed: runs.length > 0,
    assembled,
  });

  const ready = lifecycle.complete && succeeded === plan.stepCount;

  return {
    version: V101_AGENT_ORCHESTRATION_VERSION,
    freezeVersion: V101_AGENT_ORCHESTRATION_FREEZE_VERSION,
    reportId: `agent-orchestration-${deploymentId}-${randomUUID().slice(0, 8)}`,
    deploymentId,
    generatedAt,
    registry,
    plan,
    runs,
    artifacts,
    lifecycle,
    ready,
    readinessScore: ready ? 100 : Math.round((succeeded / Math.max(plan.stepCount, 1)) * 100),
    summary: [
      `agent-orchestration ready=${ready}`,
      `agents=${registry.agentCount}`,
      `steps=${plan.stepCount}`,
      `succeeded=${succeeded}`,
      `failed=${failed}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${V101_AGENT_ORCHESTRATION_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertAgentOrchestrationPass(
  result: AgentOrchestrationResult,
): asserts result is AgentOrchestrationResult & { ready: true } {
  if (!result.ready) {
    throw new Error(`V101 agent orchestration not ready: ${result.summary}`);
  }
}
