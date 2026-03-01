// lib/pdf/budget/types.ts

/**
 * 预算级别
 * - brand: 2 页紧凑商业版
 * - government: 4-6 页严格政府招标版
 */
export type BudgetLevel = "brand" | "government";

/**
 * 严格预算项（Government 必需）
 * 所有数值字段必须明确，小计自动计算
 */
export type BudgetItemStrict = {
  // 基础信息
  category: string;        // 类别（有氧、力量、配件等）
  name: string;           // 设备名称
  
  // 数量区间
  qtyMin: number;         // 最小数量
  qtyMax: number;         // 最大数量
  
  // 单价区间（CNY）
  priceMin: number;       // 最小单价
  priceMax: number;       // 最大单价
  
  // 小计区间（CNY）- 自动计算
  subtotalMin: number;    // = qtyMin * priceMin
  subtotalMax: number;    // = qtyMax * priceMax
  
  // 可选字段
  unit?: string;          // 单位（台、套、平方米等）
  brand?: string;         // 品牌要求
  spec?: string;          // 规格说明
  note?: string;          // 备注
  sequence?: number;      // 序号（用于排序）
};

/**
 * 可选地面方案
 */
export type OptionalSurface = {
  rubberMat?: boolean;    // 橡胶垫
  sportFloor?: boolean;   // 运动地板
};

/**
 * 政府级预算输入
 */
export type GovernmentBudgetInput = {
  // 基础信息
  planId: string;
  companyName: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
  
  // 可选地面
  optionalSurface?: OptionalSurface;
  
  // 项目信息（政府专用）
  projectName?: string;
  projectCode?: string;
  department?: string;
  
  // 日期
  dateYmd?: string;
  
  // 预期总计（用于校验）
  expectedTotalMin?: number;
  expectedTotalMax?: number;
};

/**
 * 文档编号结构
 * 格式：AFS-GOV-YYYYMMDD-PLANID-01
 */
export type BudgetDocNumber = {
  prefix: "AFS-GOV";      // 固定前缀
  date: string;           // YYYYMMDD
  planId: string;         // PLANID（大写）
  sequence: string;       // 序号（01, 02...）
};

/**
 * 生成政府级预算文档编号
 * @param planId 方案 ID
 * @param sequence 序号（默认 1）
 * @returns 文档编号，如 "AFS-GOV-20260301-ATTAGUY-01"
 */
export function generateDocNumber(planId: string, sequence: number = 1): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(sequence).padStart(2, "0");
  return `AFS-GOV-${date}-${planId.toUpperCase()}-${seq}`;
}

/**
 * 从对象中提取最小值
 * 支持多种字段名和数据格式
 */
export function extractMin(obj: any, keys: string[]): number {
  for (const key of keys) {
    const val = obj?.[key];
    if (val == null) continue;
    
    // 直接是数字
    if (typeof val === "number") return val;
    
    // {min, max} 对象
    if (typeof val === "object" && typeof val.min === "number") {
      return val.min;
    }
    
    // [min, max] 数组
    if (Array.isArray(val) && typeof val[0] === "number") {
      return val[0];
    }
  }
  
  return 0; // 默认值
}

/**
 * 从对象中提取最大值
 * 支持多种字段名和数据格式
 */
export function extractMax(obj: any, keys: string[]): number {
  for (const key of keys) {
    const val = obj?.[key];
    if (val == null) continue;
    
    // 直接是数字
    if (typeof val === "number") return val;
    
    // {min, max} 对象
    if (typeof val === "object" && typeof val.max === "number") {
      return val.max;
    }
    
    // [min, max] 数组
    if (Array.isArray(val) && typeof val[1] === "number") {
      return val[1];
    }
  }
  
  return 0; // 默认值
}

/**
 * 创建橡胶地垫项
 * @param companySize 企业规模（人数）
 * @returns 严格预算项
 */
export function createRubberMatItem(companySize: number): BudgetItemStrict {
  // 按 200 人 = 120m² 估算
  const areaSqm = Math.ceil((companySize / 200) * 120);
  
  return {
    category: "地面配套",
    name: "橡胶地垫（可选）",
    qtyMin: areaSqm,
    qtyMax: areaSqm,
    priceMin: 80,   // CNY/m²
    priceMax: 150,  // CNY/m²
    subtotalMin: areaSqm * 80,
    subtotalMax: areaSqm * 150,
    unit: "m²",
    spec: "厚度 8-15mm，环保无味，防滑系数 ≥ 0.5",
    note: "可选项，根据实际需求确定",
  };
}

/**
 * 创建运动地板项
 * @param companySize 企业规模（人数）
 * @returns 严格预算项
 */
export function createSportFloorItem(companySize: number): BudgetItemStrict {
  const areaSqm = Math.ceil((companySize / 200) * 120);
  
  return {
    category: "地面配套",
    name: "运动地板（可选）",
    qtyMin: areaSqm,
    qtyMax: areaSqm,
    priceMin: 200,  // CNY/m²
    priceMax: 400,  // CNY/m²
    subtotalMin: areaSqm * 200,
    subtotalMax: areaSqm * 400,
    unit: "m²",
    spec: "PVC 运动地板或实木复合，耐磨等级 T 级",
    note: "可选项，根据实际需求确定",
  };
}

/**
 * 强制校验总计
 * @param items 预算项列表
 * @param expectedMin 预期最小值
 * @param expectedMax 预期最大值
 * @throws Error 如果总计不匹配
 */
export function validateTotals(
  items: BudgetItemStrict[],
  expectedMin?: number,
  expectedMax?: number
): void {
  const sumMin = items.reduce((acc, item) => acc + item.subtotalMin, 0);
  const sumMax = items.reduce((acc, item) => acc + item.subtotalMax, 0);
  
  console.log("[VALIDATE] Calculated total range:", sumMin, "-", sumMax);
  
  if (expectedMin != null && Math.abs(sumMin - expectedMin) > 1) {
    throw new Error(
      `Total min mismatch: calculated ${sumMin}, expected ${expectedMin}`
    );
  }
  
  if (expectedMax != null && Math.abs(sumMax - expectedMax) > 1) {
    throw new Error(
      `Total max mismatch: calculated ${sumMax}, expected ${expectedMax}`
    );
  }
  
  console.log("[VALIDATE] ✅ Totals validated successfully");
}
