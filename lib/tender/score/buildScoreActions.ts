export type ScoreActionEvidenceItem = {
  ref: string;
  source?: "note" | "risk" | "response" | "attachment";
  matchedBy?: string;
};

export type BuildScoreActionsInput = {
  label: string;
  score: number;
  maxScore: number;
  keywords?: string[];
  weaknesses?: string[];
  evidence?: ScoreActionEvidenceItem[];
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.map((s) => s.trim()).filter(Boolean)));
}

function hasSource(
  evidence: ScoreActionEvidenceItem[] | undefined,
  source: ScoreActionEvidenceItem["source"]
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

function bucketDefaultActions(bucket: string) {
  switch (bucket) {
    case "after_sales":
      return [
        "补充售后服务承诺，明确响应时限、服务窗口、升级路径与责任分工",
        "细化维保范围、服务频次、巡检机制及故障处理流程",
        "补充与售后服务相关的承诺书、服务方案或保障材料",
      ];
    case "training":
      return [
        "补充培训方案，明确培训对象、培训频次、培训形式及实施阶段",
        "补充培训成果交付说明，如签到、课件、记录或考核方式",
        "补充培训计划或培训承诺相关附件材料",
      ];
    case "implementation":
      return [
        "细化实施计划，明确里程碑、进度安排、交付节点与验收衔接",
        "补充安装部署、现场组织、资源投入及异常处理预案说明",
        "补充实施保障相关附件或项目计划材料",
      ];
    case "team":
      return [
        "补充项目团队配置、职责分工及关键岗位保障机制说明",
        "补充项目经理、工程师等核心人员履历、资质或证书材料",
        "补充类似项目经验与团队履约能力证明",
      ];
    case "technical":
      return [
        "逐项补强技术参数响应，明确关键指标、功能性能及兼容性说明",
        "补充技术方案、配置清单、参数对照或产品说明材料",
        "对关键技术指标提供可核验的支撑附件或说明文件",
      ];
    case "quality":
      return [
        "补充质量控制措施、检验流程、验收标准及质量保障机制说明",
        "补充认证、检测、标准符合性或安全环保相关材料",
        "细化质量风险控制与纠偏机制",
      ];
    case "business":
      return [
        "逐项补充商务条款响应，明确付款、交货、质保期及违约责任说明",
        "补充商务承诺、交付保障或合同条款适配说明",
        "对关键商务条款提供书面承诺或附件支撑",
      ];
    case "case":
      return [
        "补充类似项目业绩，优先提供与本项目场景接近的案例",
        "补充合同首页、验收证明或客户证明等业绩支撑材料",
        "加强案例与本项目需求匹配度的说明",
      ];
    case "risk_control":
      return [
        "补充风险识别与应对措施，明确主要风险点及控制路径",
        "完善应急预案、保障机制与异常升级流程说明",
        "补充风险控制相关的制度、流程或承诺材料",
      ];
    case "pricing":
      return [
        "补充报价测算逻辑，说明价格构成、测算依据与合理性",
        "补充分项报价、优惠依据或关键成本说明",
        "对异常低价或重点价格项提供专项解释材料",
      ];
    default:
      return [
        "围绕评分关注点补充关键说明与直接支撑材料",
        "进一步细化核心条款、实施细节或承诺内容",
        "补充可核验附件，增强交叉支撑",
      ];
  }
}

function weaknessDrivenActions(
  weaknesses: string[] | undefined,
  evidence?: ScoreActionEvidenceItem[]
) {
  const actions: string[] = [];
  const joined = (weaknesses || []).join("；");

  if (/响应时效/.test(joined))
    actions.push("在响应承诺中明确到场时限、反馈时限、处理完成时限及升级机制");
  if (/培训对象|培训频次|培训安排|培训计划/.test(joined))
    actions.push("补充培训对象范围、培训频次、培训形式、实施时间及交付成果说明");
  if (/实施计划|里程碑|进度安排|交付|验收/.test(joined))
    actions.push("补充实施甘特逻辑或节点计划，明确里程碑、责任人及验收标准");
  if (/团队配置|分工|人员资历|证书|经验/.test(joined))
    actions.push("补充核心人员简历、岗位分工、资格证书及类似项目履历材料");
  if (/技术参数|功能性能|兼容性|配置说明|技术指标/.test(joined))
    actions.push("按招标参数逐项对照补充响应说明，并对关键技术指标提供附件证明");
  if (/质量控制|检验|合规|认证|安全环保/.test(joined))
    actions.push("补充质量控制流程、合规说明、认证证明及安全环保相关材料");
  if (/商务条款|付款|交付|质保期|合同条款/.test(joined))
    actions.push("对关键商务条款逐项书面响应，并补充必要的承诺函或偏离说明");
  if (/业绩|案例|类似项目/.test(joined))
    actions.push("补充类似项目业绩表及证明材料，并强调与本项目场景的相似性");
  if (/风险识别|应急预案|保障机制|风险控制/.test(joined))
    actions.push("补充主要风险清单、应急处置流程、升级机制及保障责任安排");
  if (/报价合理性|价格构成|测算逻辑|异常低价/.test(joined))
    actions.push("补充报价构成、测算依据、成本说明及重点价格项解释");
  if (/缺少响应表中的直接对应支撑/.test(joined))
    actions.push("在对应响应表条目中增加直接回应内容，避免仅有附件而无正文响应");
  if (/缺少附件材料的交叉支撑/.test(joined))
    actions.push("补充承诺函、证书、案例证明或技术资料附件，形成正文与附件交叉支撑");
  if (/缺少直接对应的支撑证据/.test(joined))
    actions.push("优先补充与该评分项直接对应的正文响应和附件材料");

  if (!hasSource(evidence, "response"))
    actions.push("补充对应响应表内容，使评分项有明确的正文落点");
  if (!hasSource(evidence, "attachment"))
    actions.push("补充相关附件材料，增强可核验性与交叉支撑强度");

  return actions;
}

export function buildScoreActions(input: BuildScoreActionsInput, maxItems = 3) {
  const { label, score, maxScore, keywords, weaknesses, evidence } = input;
  const gap = Math.max(0, maxScore - score);
  if (gap <= 0) return [];

  const bucket = inferBucket(label, keywords);
  const result: string[] = [];
  result.push(...weaknessDrivenActions(weaknesses, evidence));
  result.push(...bucketDefaultActions(bucket));
  return uniq(result).slice(0, maxItems);
}
