export type TenderAttachmentIndexKey =
  | "business_license"
  | "qualification_cert"
  | "product_datasheet"
  | "product_brochure"
  | "test_report"
  | "project_cases"
  | "service_commitment"
  | "delivery_plan"
  | "team_resume"
  | "price_detail";

export type TenderAttachmentIndexRow = {
  key: TenderAttachmentIndexKey;
  code: string;
  name: string;
  purpose: string;
  relatedScoreItems: string;
  relatedScoreIds?: string[];
  relatedResponseRefIds?: string[];
  remark?: string;
};

export type TenderAttachmentRefItem = {
  key: TenderAttachmentIndexKey;
  code: string;
  name: string;
  page?: number;
};

export type TenderAttachmentRefMap = Partial<
  Record<TenderAttachmentIndexKey, TenderAttachmentRefItem>
>;

export function buildDefaultTenderAttachmentIndexRows(): TenderAttachmentIndexRow[] {
  return [
    {
      key: "business_license",
      code: "A-01",
      name: "营业执照",
      purpose: "用于证明投标主体合法设立及基本资格",
      relatedScoreItems: "企业资质与履约能力",
      relatedScoreIds: ["S-07"],
      remark: "建议提供清晰复印件并加盖公章",
    },
    {
      key: "qualification_cert",
      code: "A-02",
      name: "企业资质证书",
      purpose: "用于证明企业资质能力及行业适配性",
      relatedScoreItems: "企业资质与履约能力",
      relatedScoreIds: ["S-07"],
      remark: "如项目无强制资质要求，可提供相关能力说明",
    },
    {
      key: "product_datasheet",
      code: "A-03",
      name: "产品技术参数表",
      purpose: "用于支撑技术参数响应与设备配置合理性",
      relatedScoreItems: "技术参数响应程度；设备配置合理性与适配性",
      relatedScoreIds: ["S-02", "S-03"],
      relatedResponseRefIds: ["T-01", "T-02", "T-03"],
      remark: "建议与技术响应表参数逐项对应",
    },
    {
      key: "product_brochure",
      code: "A-04",
      name: "产品彩页",
      purpose: "用于辅助说明产品形态、功能及品牌信息",
      relatedScoreItems: "设备配置合理性与适配性",
      relatedScoreIds: ["S-02"],
      relatedResponseRefIds: ["T-02"],
      remark: "建议选取核心设备产品彩页",
    },
    {
      key: "test_report",
      code: "A-05",
      name: "检测报告或第三方证明材料",
      purpose: "用于增强技术符合性与性能证明",
      relatedScoreItems: "技术参数响应程度",
      relatedScoreIds: ["S-03"],
      relatedResponseRefIds: ["T-01", "T-03"],
      remark: "如无检测报告，可补充其他等效证明材料",
    },
    {
      key: "project_cases",
      code: "A-06",
      name: "类似项目业绩材料",
      purpose: "用于证明履约经验与项目实施能力",
      relatedScoreItems: "企业资质与履约能力",
      relatedScoreIds: ["S-07"],
      relatedResponseRefIds: ["B-03"],
      remark: "建议附合同首页、关键页或验收证明",
    },
    {
      key: "service_commitment",
      code: "A-07",
      name: "售后服务承诺函",
      purpose: "用于证明售后响应、维保与服务机制",
      relatedScoreItems: "商务条款响应程度；售后服务与运维保障",
      relatedScoreIds: ["S-04", "S-06"],
      relatedResponseRefIds: ["B-01", "B-02"],
      remark: "建议明确响应时效、维保范围与联系人机制",
    },
    {
      key: "delivery_plan",
      code: "A-08",
      name: "项目实施与交付计划",
      purpose: "用于证明实施路径、阶段安排及交付保障",
      relatedScoreItems: "项目理解与总体实施方案；实施进度与交付保障",
      relatedScoreIds: ["S-01", "S-05"],
      relatedResponseRefIds: ["B-02"],
      remark: "建议与实施方案正文保持一致",
    },
    {
      key: "team_resume",
      code: "A-09",
      name: "项目团队与人员说明",
      purpose: "用于证明项目团队配置与执行能力",
      relatedScoreItems: "企业资质与履约能力",
      relatedScoreIds: ["S-07"],
      remark: "建议列明核心岗位职责与经验",
    },
    {
      key: "price_detail",
      code: "A-10",
      name: "报价明细及价格说明",
      purpose: "用于支撑报价口径、构成及预算逻辑",
      relatedScoreItems: "报价完整性与预算逻辑",
      relatedScoreIds: ["S-08"],
      relatedResponseRefIds: ["B-01"],
      remark: "建议与预算书价格口径保持一致",
    },
  ];
}

export function mapAttachmentIndexRowsToRefs(
  rows: TenderAttachmentIndexRow[]
): TenderAttachmentRefMap {
  const refs: TenderAttachmentRefMap = {};
  for (const row of rows || []) {
    refs[row.key] = {
      key: row.key,
      code: row.code,
      name: row.name,
    };
  }
  return refs;
}

