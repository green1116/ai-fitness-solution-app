export type ScoreWeaknessEvidenceItem = {
  ref: string;
  source?: "note" | "risk" | "response" | "attachment";
  matchedBy?: string;
};

export type BuildScoreWeaknessesInput = {
  label: string;
  score: number;
  maxScore: number;
  keywords?: string[];
  evidence?: ScoreWeaknessEvidenceItem[];
  rawNote?: string;
};

function ratio(score: number, maxScore: number) {
  if (!maxScore) return 0;
  return score / maxScore;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function hasSource(
  evidence: ScoreWeaknessEvidenceItem[] | undefined,
  source: ScoreWeaknessEvidenceItem["source"]
) {
  return !!evidence?.some((e) => e.source === source);
}

function inferBucket(label: string, keywords?: string[]) {
  const text = [label, ...(keywords || [])].join(" ");
  if (/[售后维保保修服务响应]/.test(text)) return "after_sales";
  if (/[培训]/.test(text)) return "training";
  if (/[实施交付工期安装验收进度]/.test(text)) return "implementation";
  if (/[团队人员项目经理工程师资质证书经验]/.test(text)) return "team";
  if (/[技术参数性能功能兼容配置规格指标设备]/.test(text)) return "technical";
  if (/[质量质保认证合规标准安全环保]/.test(text)) return "quality";
  if (/[商务付款支付账期交货供货合同条款]/.test(text)) return "business";
  if (/[业绩案例类似项目客户案例]/.test(text)) return "case";
  if (/[风险应急预案保障控制措施]/.test(text)) return "risk_control";
  if (/[报价价格单价总价成本预算优惠]/.test(text)) return "pricing";
  return "general";
}

function genericWeaknessByGap(score: number, maxScore: number) {
  const r = ratio(score, maxScore);
  const gap = Math.max(0, maxScore - score);
  if (r >= 0.85) return gap > 0 ? ["个别细节仍可进一步补充完善"] : [];
  if (r >= 0.65) return ["部分评分关注点体现尚不够完整", "关键细节描述仍可进一步明确"];
  if (r >= 0.45)
    return [
      "整体支撑基础已有，但完整度不足",
      "部分核心内容缺少充分展开",
      "现有材料对得分形成的支撑仍偏弱",
    ];
  return ["当前关键内容体现不足", "核心支撑材料仍明显不充分", "若不补强，可能对评审得分形成较大影响"];
}

function bucketWeaknessTemplates(bucket: string) {
  switch (bucket) {
    case "after_sales":
      return ["售后响应时效描述不够明确", "维保边界、服务频次或保障机制仍可进一步量化", "服务承诺相关支撑材料仍不够完整"];
    case "training":
      return ["培训对象、频次或实施安排描述不够完整", "培训成果交付与考核方式仍可进一步明确", "培训计划对应支撑材料仍可补充"];
    case "implementation":
      return ["实施计划、里程碑或进度安排仍不够细化", "交付、安装或验收衔接说明仍可进一步明确", "实施保障措施与异常处理预案支撑不足"];
    case "team":
      return ["项目团队配置与分工说明仍不够充分", "人员资历、类似经验或证书材料支撑不足", "关键岗位保障机制仍可进一步明确"];
    case "technical":
      return ["技术参数响应完整度仍有提升空间", "功能性能、兼容性或配置说明不够充分", "关键技术指标对应支撑材料仍可进一步补充"];
    case "quality":
      return ["质量控制、检验或合规说明仍不够完整", "认证、标准或安全环保相关支撑材料不足", "质量保障措施仍可进一步细化"];
    case "business":
      return ["商务条款响应仍不够完整", "付款、交付或质保期等关键条款说明仍可进一步明确", "合同条款对应支撑与承诺材料仍可补充"];
    case "case":
      return ["类似项目业绩展示仍不够充分", "案例与本项目适配性的说明仍可进一步加强", "业绩证明材料支撑仍显不足"];
    case "risk_control":
      return ["风险识别与应对措施体现仍不够完整", "应急预案与保障机制仍可进一步细化", "风险控制相关支撑材料仍可补充"];
    case "pricing":
      return ["报价合理性说明仍不够充分", "价格构成、测算逻辑或优惠依据说明不足", "价格相关支撑材料仍可进一步补充"];
    default:
      return ["部分评分关注点体现仍不够充分", "关键细节支撑仍可进一步补强", "现有材料完整度仍有提升空间"];
  }
}

function evidenceWeaknesses(evidence?: ScoreWeaknessEvidenceItem[]) {
  const out: string[] = [];
  if (!evidence?.length) {
    out.push("当前缺少直接对应的支撑证据");
    return out;
  }
  const hasResponseEvidence = hasSource(evidence, "response");
  const hasAttachmentEvidence = hasSource(evidence, "attachment");
  if (!hasResponseEvidence) out.push("缺少响应表中的直接对应支撑");
  if (!hasAttachmentEvidence) out.push("缺少附件材料的交叉支撑");
  return out;
}

export function buildScoreWeaknesses(input: BuildScoreWeaknessesInput, maxItems = 3) {
  const { label, score, maxScore, keywords, evidence } = input;
  const bucket = inferBucket(label, keywords);
  const gap = Math.max(0, maxScore - score);
  if (gap <= 0) return [];

  const result: string[] = [];
  const bucketTemplates = bucketWeaknessTemplates(bucket);
  const genericTemplates = genericWeaknessByGap(score, maxScore);
  const evidenceTemplates = evidenceWeaknesses(evidence);

  if (gap >= 1) result.push(...bucketTemplates.slice(0, 2));
  if (gap >= 2) result.push(...evidenceTemplates.slice(0, 2));
  if (gap >= 3) result.push(...genericTemplates.slice(0, 2));
  else result.push(...genericTemplates.slice(0, 1));

  return uniq(result).slice(0, maxItems);
}
