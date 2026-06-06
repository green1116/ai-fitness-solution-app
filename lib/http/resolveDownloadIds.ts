/**
 * 下载接口统一 ID 解析：以 projectId 为唯一主键。
 * planId 若传入必须与 projectId 相同（兼容旧客户端）。
 */
export type ResolvedDownloadIds =
  | { ok: true; projectId: string; entitlementId: string }
  | { ok: false; status: number; error: string; message: string };

export function resolveDownloadIds(body: {
  projectId?: string;
  planId?: string;
}): ResolvedDownloadIds {
  const projectId = String(body.projectId ?? "").trim();
  const planId = String(body.planId ?? "").trim();

  if (!projectId) {
    return {
      ok: false,
      status: 400,
      error: "PROJECT_ID_REQUIRED",
      message: "projectId is required",
    };
  }

  if (planId && planId !== projectId) {
    return {
      ok: false,
      status: 400,
      error: "ID_MISMATCH",
      message: "projectId 与 planId 不一致，请从生成流程重新进入结果页",
    };
  }

  return {
    ok: true,
    projectId,
    entitlementId: projectId,
  };
}
