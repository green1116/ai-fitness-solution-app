/**
 * Server-side financial safety gate for self-service PRO purchases.
 * Used by POST /api/pay/create-order (targetLevel=pro) and POST /api/pay/start-payment
 * (any PRO order, including orders created through legacy paths).
 *
 * Fail-closed: any lookup failure rejects the purchase.
 */

export type ProPurchaseRejectCode =
  | "AUTH_REQUIRED"
  | "ORGANIZATION_REQUIRED"
  | "PROJECT_NOT_FOUND"
  | "ORDER_USER_MISMATCH"
  | "ALREADY_ENTITLED"
  | "ENTITLEMENT_UNAVAILABLE";

export type ProPurchaseEligibility =
  | { ok: true; userId: string; organizationId: string }
  | {
      ok: false;
      status: 401 | 403 | 404 | 409 | 503;
      code: ProPurchaseRejectCode;
      message: string;
    };

export type ProPurchaseEligibilityDeps = {
  getCurrentUserId: () => Promise<string | null>;
  resolveOrganizationId: (userId: string) => Promise<string | null>;
  /** null/undefined when the project does not exist. */
  getProjectOrganizationId: (projectId: string) => Promise<string | null | undefined>;
  getCurrentPlan: (organizationId: string) => Promise<string>;
};

const UNAVAILABLE: ProPurchaseEligibility = {
  ok: false,
  status: 503,
  code: "ENTITLEMENT_UNAVAILABLE",
  message: "暂时无法确认当前套餐权益，请稍后重试",
};

export async function evaluateProPurchaseEligibility(
  input: { projectId?: string | null; orderUserId?: string | null },
  deps: ProPurchaseEligibilityDeps,
): Promise<ProPurchaseEligibility> {
  let userId: string | null;
  try {
    userId = (await deps.getCurrentUserId())?.trim() || null;
  } catch {
    return UNAVAILABLE;
  }
  if (!userId) {
    return { ok: false, status: 401, code: "AUTH_REQUIRED", message: "请先登录后再升级" };
  }

  const orderUserId = input.orderUserId?.trim() || "";
  if (orderUserId && orderUserId !== userId) {
    return {
      ok: false,
      status: 403,
      code: "ORDER_USER_MISMATCH",
      message: "订单不属于当前登录用户",
    };
  }

  let organizationId: string | null;
  try {
    organizationId = (await deps.resolveOrganizationId(userId))?.trim() || null;
  } catch {
    return UNAVAILABLE;
  }
  if (!organizationId) {
    return {
      ok: false,
      status: 403,
      code: "ORGANIZATION_REQUIRED",
      message: "未找到当前账户所属组织",
    };
  }

  const projectId = input.projectId?.trim() || "";
  if (projectId) {
    let projectOrganizationId: string | null | undefined;
    try {
      projectOrganizationId = await deps.getProjectOrganizationId(projectId);
    } catch {
      return UNAVAILABLE;
    }
    if (!projectOrganizationId || projectOrganizationId !== organizationId) {
      return { ok: false, status: 404, code: "PROJECT_NOT_FOUND", message: "项目不存在" };
    }
  }

  let plan: string;
  try {
    plan = String(await deps.getCurrentPlan(organizationId)).trim().toUpperCase();
  } catch {
    return UNAVAILABLE;
  }
  if (plan === "PRO" || plan === "ENTERPRISE") {
    return {
      ok: false,
      status: 409,
      code: "ALREADY_ENTITLED",
      message: "当前组织已开通专业版或企业版，无需重复购买",
    };
  }
  if (plan !== "BASIC") return UNAVAILABLE;

  return { ok: true, userId, organizationId };
}

export async function resolveProPurchaseEligibility(input: {
  projectId?: string | null;
  orderUserId?: string | null;
}): Promise<ProPurchaseEligibility> {
  // Lazy imports keep the evaluator importable without DB/session modules.
  const [{ getCurrentUser }, { resolveExactSingleOrganizationIdForUser }, { prisma }, { resolveOrganizationFeatures }] =
    await Promise.all([
      import("@/lib/auth/currentUser"),
      import("@/lib/organization/single-org-context"),
      import("@/lib/prisma"),
      import("@/lib/billing/subscription/subscription.resolver"),
    ]);

  return evaluateProPurchaseEligibility(input, {
    getCurrentUserId: async () => (await getCurrentUser())?.id ?? null,
    resolveOrganizationId: (userId) => resolveExactSingleOrganizationIdForUser(userId),
    getProjectOrganizationId: async (projectId) =>
      (
        await prisma.project.findUnique({
          where: { id: projectId },
          select: { organizationId: true },
        })
      )?.organizationId,
    getCurrentPlan: async (organizationId) =>
      (await resolveOrganizationFeatures(organizationId)).plan,
  });
}
