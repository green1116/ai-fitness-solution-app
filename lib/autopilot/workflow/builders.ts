import { runAiKnowledgeFusionRuntime } from "@/lib/ai-integration/knowledge-fusion";
import { runProposalAssemblyRuntime } from "@/lib/proposal-generation/assembly";
import { runTenderIntelligenceAssemblyRuntime } from "@/lib/tender-intelligence/assembly";
import type { AutopilotWorkflow, WorkflowStep, WorkflowStepId } from "./types";
import { WORKFLOW_STEPS } from "./types";

const STEP_META: Record<WorkflowStepId, { label: string; moduleRef: string }> = {
  "tender-upload": { label: "Tender Upload 招标上传", moduleRef: "tender/intake" },
  "tender-intelligence": { label: "Tender Intelligence 招标理解", moduleRef: "tender-intelligence/assembly" },
  "knowledge-fusion": { label: "Knowledge Fusion 知识融合", moduleRef: "ai-integration/knowledge-fusion" },
  "proposal-generation": { label: "Proposal Generation 方案生成", moduleRef: "proposal-generation/assembly" },
  "proposal-pdf": { label: "Proposal PDF 方案 PDF", moduleRef: "proposal-pdf/assembly" },
  "plan-pdf": { label: "Plan PDF 平面图 PDF", moduleRef: "pdf/tender/plan" },
  "budget-pdf": { label: "Budget PDF 预算 PDF", moduleRef: "pdf/tender/budget" },
  "enterprise-zip": { label: "Enterprise ZIP 企业交付包", moduleRef: "entitlements/zipAccess" },
};

function checkStepReady(stepId: WorkflowStepId, deploymentId: string): boolean {
  switch (stepId) {
    case "tender-upload":
      return true;
    case "tender-intelligence":
      return runTenderIntelligenceAssemblyRuntime({ deploymentId }).status === "success";
    case "knowledge-fusion":
      return runAiKnowledgeFusionRuntime({ deploymentId }).status === "success";
    case "proposal-generation":
      return runProposalAssemblyRuntime({ deploymentId }).status === "success";
    case "proposal-pdf":
    case "plan-pdf":
    case "budget-pdf":
    case "enterprise-zip":
      return true;
    default:
      return false;
  }
}

export function buildWorkflowSteps(deploymentId: string): WorkflowStep[] {
  return WORKFLOW_STEPS.map((stepId, index) => ({
    stepId,
    label: STEP_META[stepId].label,
    order: index + 1,
    moduleRef: STEP_META[stepId].moduleRef,
    ready: checkStepReady(stepId, deploymentId),
  }));
}

export function buildAutopilotWorkflow(input?: {
  deploymentId?: string;
  jobId?: string;
}): AutopilotWorkflow {
  const deploymentId = input?.deploymentId ?? "workflow-default";
  const jobId = input?.jobId ?? `autopilot-job-${deploymentId}`;
  const steps = buildWorkflowSteps(deploymentId);
  const completedSteps = steps.filter((s) => s.ready).length;
  const currentIndex = steps.findIndex((s) => !s.ready);
  const currentStep = currentIndex === -1 ? steps[steps.length - 1].stepId : steps[currentIndex].stepId;

  return {
    workflowId: `workflow-${deploymentId}`,
    jobId,
    steps,
    currentStep,
    totalSteps: steps.length,
    completedSteps,
  };
}

