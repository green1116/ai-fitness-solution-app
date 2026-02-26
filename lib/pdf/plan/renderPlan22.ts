// lib/pdf/plan/renderPlan22.ts
import fs from "fs/promises";
import path from "path";

/**
 * ✅ A方案：22页“金样板”回放引擎（止血版）
 * - 不做任何结构优化
 * - 不依赖当前 render.ts 的模块系统
 * - 直接读取你确认可用的 22 页 PDF
 *
 * 约定：
 *  - planId=attaguy-plan -> public/golden/plan_attaguy-plan.pdf
 *  - 其他 planId -> public/golden/plan_<planId>.pdf （可选）
 */
function resolveGoldenPath(planId: string) {
  // 你现在只要先救活 attaguy-plan，后续再扩展映射
  if (planId === "attaguy-plan") {
    return path.join(process.cwd(), "public", "golden", "plan_attaguy-plan.pdf");
  }
  // 可选：允许你把其它 planId 的金样板也放进来
  return path.join(process.cwd(), "public", "golden", `plan_${planId}.pdf`);
}

export async function renderPlan22PdfBytes(planId: string): Promise<Uint8Array> {
  const p = resolveGoldenPath(planId);
  const buf = await fs.readFile(p);
  return new Uint8Array(buf);
}