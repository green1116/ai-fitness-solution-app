export type TenderClauseKind = "technical" | "business";

export type TenderResponseStatus =
  | "满足"
  | "响应"
  | "部分满足"
  | "待确认"
  | "偏离";

export type ParsedTenderClause = {
  id?: string;
  kind: TenderClauseKind;
  section?: string;
  clauseNo?: string;
  text: string;
};

export type WrittenTenderResponse = {
  id: string;
  kind: TenderClauseKind;
  section?: string;
  clauseNo?: string;
  requirement: string;
  status: TenderResponseStatus;
  response: string;
  remark: string;
  risk?: "low" | "medium" | "high";
  keywords?: string[];
};

type ClauseCategory =
  | "quantity"
  | "function"
  | "performance"
  | "service"
  | "warranty"
  | "delivery"
  | "training"
  | "qualification"
  | "document"
  | "time"
  | "other";

function normalizeText(input: string) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .replace(/[：:]\s*/g, "：")
    .trim();
}

function safeId(index: number, item?: ParsedTenderClause) {
  return item?.id || `${item?.kind || "technical"}-${index + 1}`;
}

function extractKeywords(text: string): string[] {
  const hits = new Set<string>();
  const rules = [
    "跑步机",
    "椭圆机",
    "动感单车",
    "力量器械",
    "心率监测",
    "安装",
    "调试",
    "培训",
    "售后",
    "质保",
    "维保",
    "认证",
    "ISO",
    "交付",
    "工期",
    "响应时间",
    "清单",
    "参数",
    "证明材料",
  ];

  for (const k of rules) {
    if (text.includes(k)) hits.add(k);
  }
  return Array.from(hits);
}

function detectCategory(text: string, kind: TenderClauseKind): ClauseCategory {
  const t = normalizeText(text);

  if (/(不少于|不低于|不小于|至少|≥|\d+\s*台|\d+\s*套|\d+\s*件)/.test(t)) {
    return "quantity";
  }

  if (/(支持|具备|具有|可实现|能够实现|应实现|功能)/.test(t)) {
    return "function";
  }

  if (/(性能|参数|精度|功率|速度|尺寸|规格|标准)/.test(t)) {
    return "performance";
  }

  if (/(售后|响应|维修|维护|服务)/.test(t)) {
    return "service";
  }

  if (/(质保|保修|维保)/.test(t)) {
    return "warranty";
  }

  if (/(供货|交付|安装|调试|验收)/.test(t)) {
    return "delivery";
  }

  if (/(培训|指导|使用培训)/.test(t)) {
    return "training";
  }

  if (/(资质|认证|证书|ISO|资格)/i.test(t)) {
    return "qualification";
  }

  if (/(证明材料|文件|报告|承诺函|检测报告|说明书)/.test(t)) {
    return "document";
  }

  if (/(工期|期限|时间|天内|工作日|日历日)/.test(t)) {
    return "time";
  }

  if (kind === "business") {
    if (/(付款|支付|合同|发票|税|报价)/.test(t)) {
      return "service";
    }
  }

  return "other";
}

function inferStatus(
  category: ClauseCategory,
  text: string,
  kind: TenderClauseKind
): TenderResponseStatus {
  const t = normalizeText(text);

  if (/(必须提供|须提供|应提供.*证明|需提供.*证书|原件|复印件加盖公章)/.test(t)) {
    return "待确认";
  }

  if (/(唯一|指定品牌|指定型号|完全一致|原厂原装)/.test(t)) {
    return "待确认";
  }

  if (category === "qualification" || category === "document") {
    return "待确认";
  }

  if (category === "warranty" || category === "service") {
    return kind === "business" ? "响应" : "满足";
  }

  if (category === "quantity" || category === "function" || category === "performance") {
    return "满足";
  }

  if (category === "delivery" || category === "training" || category === "time") {
    return "响应";
  }

  return "响应";
}

function inferRisk(
  category: ClauseCategory,
  status: TenderResponseStatus,
  text: string
): "low" | "medium" | "high" {
  if (status === "偏离") return "high";
  if (status === "待确认") return "medium";
  if (/(认证|证明材料|原件|检测报告|资质)/.test(text)) return "medium";
  if (category === "quantity" || category === "function") return "low";
  return "low";
}

function buildRemark(
  category: ClauseCategory,
  status: TenderResponseStatus,
  text: string
) {
  if (status === "待确认") {
    if (/(认证|资质|证书|ISO|检测报告)/i.test(text)) {
      return "建议人工复核证明材料";
    }
    return "建议人工复核条款与附件";
  }

  if (status === "满足") return "无偏离";
  if (status === "响应") return "按招标要求执行";
  if (status === "部分满足") return "存在局部差异，建议人工确认";
  return "存在偏离，需重点复核";
}

function buildResponseByCategory(
  category: ClauseCategory,
  status: TenderResponseStatus,
  requirement: string,
  kind: TenderClauseKind
) {
  const prefix =
    kind === "technical"
      ? "我方拟投方案"
      : "我方将按招标文件商务条款要求";

  if (status === "待确认") {
    return `关于“${requirement}”，我方可按招标文件要求配合提供相应证明文件、承诺资料或响应说明，最终以实际投标材料、资质文件及采购要求为准。`;
  }

  switch (category) {
    case "quantity":
      return `${prefix}满足招标文件关于设备数量、配置规模及供货范围的要求，可按采购清单完成供货、安装、调试及交付。`;

    case "function":
      return `${prefix}满足招标文件关于相关功能配置的要求，能够实现对应使用目标并支持项目实际应用需求。`;

    case "performance":
      return `${prefix}满足招标文件关于设备性能、技术参数及使用标准的要求，具体参数以最终投标配置表及技术资料为准。`;

    case "service":
      return `${prefix}执行相关服务要求，包括但不限于供货配合、售后支持、服务响应及合同履约义务，确保项目顺利实施。`;

    case "warranty":
      return `${prefix}按招标文件售后及质保要求执行，提供相应维保服务与响应保障，具体期限及服务机制以最终投标承诺及合同约定为准。`;

    case "delivery":
      return `${prefix}可按招标文件要求完成供货、安装、调试、验收及交付工作，并配合采购单位推进项目实施。`;

    case "training":
      return `${prefix}可按招标文件要求提供使用培训、操作指导及必要的交付支持，保障设备投入后的正常使用。`;

    case "qualification":
      return `我方将根据招标文件要求提交相应资质、认证或证明材料，相关文件以正式投标文件、附件及资格审查材料为准。`;

    case "document":
      return `我方可按招标文件要求提供对应的说明文件、承诺资料、检测报告或其他证明材料，最终以正式投标文件提交内容为准。`;

    case "time":
      return `${prefix}响应招标文件关于供货周期、实施时限或服务时效的要求，具体安排以项目执行计划及合同约定为准。`;

    default:
      return `${prefix}响应招标文件相关要求，并将结合项目实际情况在正式投标文件中提供对应配置说明、实施承诺及配套材料。`;
  }
}

export function writeTenderResponses(
  items: ParsedTenderClause[]
): WrittenTenderResponse[] {
  return items
    .map((item, index) => {
      const requirement = normalizeText(item.text);
      if (!requirement) return null;

      const category = detectCategory(requirement, item.kind);
      const status = inferStatus(category, requirement, item.kind);
      const response = buildResponseByCategory(
        category,
        status,
        requirement,
        item.kind
      );
      const remark = buildRemark(category, status, requirement);
      const risk = inferRisk(category, status, requirement);

      return {
        id: safeId(index, item),
        kind: item.kind,
        section: item.section,
        clauseNo: item.clauseNo,
        requirement,
        status,
        response,
        remark,
        risk,
        keywords: extractKeywords(requirement),
      } satisfies WrittenTenderResponse;
    })
    .filter(Boolean) as WrittenTenderResponse[];
}