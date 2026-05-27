import type { RuntimeDecision } from "@/lib/tender/runtime/types";
import type {
  DecisionRoute,
  EscalationLevel,
  EscalationResult,
  SubmissionReadiness,
} from "../types";

export type BuildEscalationInput = {
  decision: RuntimeDecision;
  route: DecisionRoute;
  readiness: SubmissionReadiness;
  policy?: { escalateOnWarn?: boolean };
};

/**
 * V3.0 升级引擎 — 按阻断严重程度确定人工介入级别
 */
export function buildEscalation(input: BuildEscalationInput): EscalationResult {
  const { decision, route, readiness, policy } = input;
  const triggers: string[] = [];
  const resolutionHints: string[] = [];

  if (decision.action === "allow" && route.target === "proceed" && readiness.ready) {
    return {
      level: "none",
      required: false,
      triggers: [],
      resolutionHints: [],
      autoResolvable: true,
    };
  }

  let level: EscalationLevel = "none";

  const mandatoryUnsupportedCount = decision.meta.mandatoryUnsupportedCount ?? 0;

  if (mandatoryUnsupportedCount > 0) {
    triggers.push(
      `强制性要求缺证据 ${mandatoryUnsupportedCount} 项`,
    );
    level = "executive";
    resolutionHints.push("由投标负责人确认是否补充硬性资质材料");
  }

  if (decision.action === "block" || route.target === "abort") {
    triggers.push(decision.title);
    if (level !== "executive") level = "supervisor";
    resolutionHints.push(...decision.suggestedNextSteps.slice(0, 2));
  }

  if (
    decision.meta.unsupportedCount >= 5 &&
    level !== "executive"
  ) {
    triggers.push(`无证据要求 ${decision.meta.unsupportedCount} 项`);
    level = "supervisor";
  }

  if (decision.action === "warn" || route.target === "review") {
    if (policy?.escalateOnWarn !== false) {
      triggers.push("统一决策为 warn 或进入复核路径");
      if (level === "none") level = "advisory";
    }
  }

  if (!readiness.ready && readiness.blockers.length > 0) {
    triggers.push(readiness.blockers[0]);
    if (level === "none") level = "advisory";
    resolutionHints.push("完成提交就绪清单中的阻断项");
  }

  if (decision.meta.gateEvidenceWeakCount >= 4) {
    triggers.push(`评分证据薄弱项 ${decision.meta.gateEvidenceWeakCount} 个`);
    if (level === "none") level = "advisory";
  }

  const required = level !== "none";
  const autoResolvable =
    level === "advisory" &&
    decision.action !== "block" &&
    readiness.blockers.length === 0;

  return {
    level,
    required,
    triggers: [...new Set(triggers)].slice(0, 6),
    resolutionHints: [...new Set(resolutionHints)].slice(0, 5),
    autoResolvable,
  };
}
