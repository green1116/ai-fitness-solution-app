/**
 * Plan JSON 数据结构定义（唯一事实源）
 * 
 * 所有功能（PDF 渲染、后台留资、销售/升级）都从这个结构读取数据
 */

export interface PlanMeta {
  plan_id: string; // 例如: "ATG-20260120-2744"
  proposalNo?: string; // 兼容旧字段
  generated_at: string; // ISO 日期字符串: "2026-01-20"
  version: string; // 例如: "v1"
  created_at?: string; // 可选：创建时间戳
}

export interface ClientProfile {
  company_size: number; // 公司规模（人数）
  industry?: string; // 行业
  space_area: number; // 空间面积（㎡）
  scene: string; // 场景：办公楼、工厂、酒店等
  budget_range: string; // 预算范围：5-10万
  potential_scope?: string[]; // 潜在业务范围
  // 兼容旧字段
  companySize?: number;
  area?: number;
  scenario?: string;
  budget?: string;
}

export interface SolutionSummary {
  management_conclusion: string[]; // 管理层结论（摘要）
}

export interface EquipmentItem {
  name: string; // 设备名称
  qty: number; // 数量
  price_level?: string; // 价格级别：低、中、高
  purpose?: string; // 用途/理由
  budget?: string; // 预算区间
  reason?: string; // 兼容旧字段
}

export interface EquipmentPlan {
  category: string; // 分类：有氧、力量、拉伸等
  items: EquipmentItem[];
}

export interface Implementation {
  phase_1: string; // 阶段一：例如 "方案确认（7天）"
  phase_2: string; // 阶段二：例如 "采购与安装（30天）"
  phase_3: string; // 阶段三：例如 "运营优化（90天）"
}

export interface UpsellModules {
  layout_design: boolean; // 布局设计深化
  "3d_render": boolean; // 3D 渲染效果图
  rehab_module: boolean; // 康复训练模块
}

export interface PricingBreakdown {
  name: string; // 费用项名称，例如："设备"、"运输安装"、"基础运维"
  range: string; // 价格区间，例如："3-6万"
}

export interface PricingSummary {
  confidence: string; // 价格置信度：低/中/高
  range_total: string; // 总价区间，例如："5-10万"
  breakdown: PricingBreakdown[]; // 价格明细
  assumptions: string[]; // 假设条件
}

export interface Plan {
  meta: PlanMeta;
  client_profile: ClientProfile;
  solution_summary: SolutionSummary;
  equipment_plan: EquipmentPlan[];
  implementation: Implementation;
  upsell_modules: UpsellModules;
  pricing_summary?: PricingSummary; // 价格摘要（v1.1 新增）
  next_actions?: string[]; // 下一步行动建议
}

/**
 * 验证 plan 数据是否完整
 */
export function validatePlan(plan: any): plan is Plan {
  return (
    plan &&
    plan.meta &&
    plan.meta.plan_id &&
    plan.client_profile &&
    plan.solution_summary &&
    plan.equipment_plan &&
    plan.implementation &&
    plan.upsell_modules
  );
}

/**
 * 生成 plan_id（如果缺失）
 */
export function generatePlanId(): string {
  const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const rnd = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `ATG-${date}-${rnd}`;
}

