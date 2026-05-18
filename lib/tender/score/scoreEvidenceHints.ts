export type ScoreEvidenceBucket =
  | "after_sales"
  | "implementation"
  | "team"
  | "technical"
  | "training"
  | "quality"
  | "business"
  | "case"
  | "risk_control"
  | "pricing"
  | "general";

export type ScoreEvidenceHint = {
  bucket: ScoreEvidenceBucket;
  keywords: string[];
  preferPrefixes?: Array<"T" | "B" | "A">;
  maxItems?: number;
};

export const SCORE_EVIDENCE_HINTS: Record<ScoreEvidenceBucket, ScoreEvidenceHint> = {
  after_sales: {
    bucket: "after_sales",
    keywords: ["售后", "维保", "保修", "维修", "响应", "服务承诺", "故障处理", "巡检", "服务方案"],
    preferPrefixes: ["T", "A"],
    maxItems: 3,
  },
  implementation: {
    bucket: "implementation",
    keywords: ["实施", "交付", "进度", "工期", "安装", "部署", "项目计划", "里程碑", "验收", "实施方案"],
    preferPrefixes: ["T", "A"],
    maxItems: 3,
  },
  team: {
    bucket: "team",
    keywords: ["团队", "项目经理", "人员", "工程师", "组织架构", "资质", "证书", "经验", "履历"],
    preferPrefixes: ["T", "A"],
    maxItems: 3,
  },
  technical: {
    bucket: "technical",
    keywords: ["技术参数", "参数", "性能", "功能", "配置", "兼容", "规格", "指标", "技术响应", "设备"],
    preferPrefixes: ["T", "A"],
    maxItems: 3,
  },
  training: {
    bucket: "training",
    keywords: ["培训", "培训计划", "培训方案", "使用培训", "运维培训", "交接培训"],
    preferPrefixes: ["T", "A"],
    maxItems: 3,
  },
  quality: {
    bucket: "quality",
    keywords: ["质量", "质保", "检验", "检测", "认证", "合规", "标准", "安全", "环保"],
    preferPrefixes: ["T", "A"],
    maxItems: 3,
  },
  business: {
    bucket: "business",
    keywords: ["商务", "付款", "支付", "账期", "质保期", "交货", "供货", "售后条款", "商务响应", "合同条款"],
    preferPrefixes: ["B", "A"],
    maxItems: 3,
  },
  case: {
    bucket: "case",
    keywords: ["业绩", "案例", "项目经验", "类似项目", "客户案例", "实施经验"],
    preferPrefixes: ["A", "T"],
    maxItems: 3,
  },
  risk_control: {
    bucket: "risk_control",
    keywords: ["风险", "应急", "预案", "保障", "控制措施", "风险控制", "异常处理"],
    preferPrefixes: ["T", "A"],
    maxItems: 3,
  },
  pricing: {
    bucket: "pricing",
    keywords: ["报价", "价格", "单价", "总价", "成本", "预算", "优惠", "价格合理性"],
    preferPrefixes: ["B", "A"],
    maxItems: 3,
  },
  general: {
    bucket: "general",
    keywords: [],
    preferPrefixes: ["T", "B", "A"],
    maxItems: 3,
  },
};

export function resolveScoreEvidenceBucket(input: {
  key?: string;
  label?: string;
  keywords?: string[];
}): ScoreEvidenceBucket {
  const text = [input.key, input.label, ...(input.keywords || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (/[售后维保保修服务响应]/.test(text)) return "after_sales";
  if (/[实施交付工期安装验收进度]/.test(text)) return "implementation";
  if (/[团队人员项目经理工程师资质证书经验]/.test(text)) return "team";
  if (/[技术参数性能功能兼容配置规格指标设备]/.test(text)) return "technical";
  if (/[培训]/.test(text)) return "training";
  if (/[质量质保认证合规标准安全环保]/.test(text)) return "quality";
  if (/[商务付款支付账期交货供货合同条款]/.test(text)) return "business";
  if (/[业绩案例类似项目客户案例]/.test(text)) return "case";
  if (/[风险应急预案保障控制措施]/.test(text)) return "risk_control";
  if (/[报价价格单价总价成本预算优惠]/.test(text)) return "pricing";

  return "general";
}
