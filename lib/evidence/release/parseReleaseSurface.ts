import type { ExecutiveReleaseSurface } from "../types";

/**
 * 从请求头解析 Executive Release Surface（交付层透传，确定性 JSON）
 */
export function parseExecutiveReleaseSurfaceHeader(
  raw: string | null | undefined,
): ExecutiveReleaseSurface | undefined {
  const text = String(raw ?? "").trim();
  if (!text) return undefined;
  try {
    const parsed = JSON.parse(text) as ExecutiveReleaseSurface;
    if (!parsed || typeof parsed.decision !== "string") return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}
