import type { RuntimeDecision, RuntimeGateAction } from "@/lib/tender/runtime/types";
import type { DecisionRoute, DecisionRouteTarget, DecisionRouteTrigger } from "../types";

export type BuildDecisionRouteInput = {
  decision: RuntimeDecision;
  forceAllow?: boolean;
};

function routeFromAction(
  action: RuntimeGateAction,
  allowConditional: boolean,
): DecisionRouteTarget {
  if (action === "block") return "abort";
  if (action === "warn") return allowConditional ? "review" : "hold";
  return "proceed";
}

function pickTrigger(decision: RuntimeDecision): DecisionRouteTrigger {
  if (decision.sources.gate === "block") return "gate";
  if (decision.sources.evidence === "block") return "evidence";
  return "unified";
}

/**
 * V3.0 决策路由 — 将统一决策映射为系统执行路径
 */
export function buildDecisionRoute(
  input: BuildDecisionRouteInput,
): DecisionRoute {
  const { decision, forceAllow = false } = input;

  if (forceAllow) {
    return {
      routeId: "route-force-proceed",
      target: "proceed",
      label: "强制放行路径",
      reason: "编排策略启用 forceAllow，绕过阻断路由",
      triggeredBy: "force",
      priority: 0,
    };
  }

  const target = routeFromAction(decision.action, true);
  const trigger = pickTrigger(decision);

  const labels: Record<DecisionRouteTarget, string> = {
    proceed: "标准投标准备路径",
    review: "人工复核路径",
    hold: "暂缓投路径",
    abort: "终止投标准备路径",
  };

  return {
    routeId: `route-${target}-${decision.action}`,
    target,
    label: labels[target],
    reason:
      decision.reasons[0] ||
      decision.message ||
      `统一决策为 ${decision.action}`,
    triggeredBy: trigger,
    priority: target === "abort" ? 100 : target === "hold" ? 80 : target === "review" ? 50 : 10,
  };
}

/** 根据提交就绪度修正路由 */
export function adjustRouteForReadiness(
  route: DecisionRoute,
  readiness: { ready: boolean; blockers: string[] },
): DecisionRoute {
  if (route.target === "proceed" && !readiness.ready && readiness.blockers.length > 0) {
    return {
      ...route,
      routeId: "route-readiness-hold",
      target: "hold",
      label: "就绪度不足暂缓路径",
      reason: readiness.blockers[0] || "提交就绪检查未通过",
      triggeredBy: "readiness",
      priority: 70,
    };
  }
  if (route.target === "abort" && readiness.ready) {
    return {
      ...route,
      target: "review",
      label: "就绪但决策阻断 — 复核路径",
      triggeredBy: "readiness",
      priority: 60,
    };
  }
  return route;
}
