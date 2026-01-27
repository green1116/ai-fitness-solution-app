/**
 * Plan CTA 判断工具函数
 * 
 * 用于判断是否显示工程类 CTA（如室外篮球场、运动地坪施工等）
 */

import { Plan } from "@/lib/types/plan";

const ENGINEERING_KEYWORDS = [
  "篮球",
  "足球",
  "匹克球",
  "网球",
  "羽毛球",
  "球场",
  "地坪",
  "塑胶",
  "硅PU",
  "EPDM",
  "丙烯酸",
  "室外",
  "园区",
  "操场",
];

/**
 * 判断是否应该显示工程类 CTA
 * 
 * 规则：
 * 1. 用户明确勾选工程类（potential_scope 中包含工程关键词）
 * 2. 场景暗示园区/室外/操场（scene 中包含工程关键词）
 * 3. 公司规模很大（>= 500人）
 */
export function shouldShowEngineeringCTA(plan: Plan): boolean {
  const scope = plan.client_profile.potential_scope ?? [];
  const scene = plan.client_profile.scene ?? "";
  const companySize = plan.client_profile.company_size ?? 0;

  // 规则1：用户明确勾选工程类
  const scopeHit = scope.some((s) =>
    ENGINEERING_KEYWORDS.some((k) => s.includes(k))
  );

  // 规则2：场景暗示园区/室外/操场
  const sceneHit = ENGINEERING_KEYWORDS.some((k) => scene.includes(k));

  // 规则3：公司规模很大（可选阈值，先保守）
  const sizeHit = companySize >= 500;

  return scopeHit || sceneHit || sizeHit;
}

