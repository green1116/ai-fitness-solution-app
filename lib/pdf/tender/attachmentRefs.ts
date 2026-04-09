export type TenderAttachmentRefKey =
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

export type TenderAttachmentRefItem = {
  key: TenderAttachmentRefKey;
  code: string;
  name: string;
  page?: number;
};

export type TenderAttachmentRefMap = Partial<
  Record<TenderAttachmentRefKey, TenderAttachmentRefItem>
>;

export function buildDefaultTenderAttachmentRefs(): TenderAttachmentRefMap {
  return {
    business_license: {
      key: "business_license",
      code: "A-01",
      name: "营业执照",
    },
    qualification_cert: {
      key: "qualification_cert",
      code: "A-02",
      name: "企业资质证书",
    },
    product_datasheet: {
      key: "product_datasheet",
      code: "A-03",
      name: "产品技术参数表",
    },
    product_brochure: {
      key: "product_brochure",
      code: "A-04",
      name: "产品彩页",
    },
    test_report: {
      key: "test_report",
      code: "A-05",
      name: "检测报告或第三方证明材料",
    },
    project_cases: {
      key: "project_cases",
      code: "A-06",
      name: "类似项目业绩材料",
    },
    service_commitment: {
      key: "service_commitment",
      code: "A-07",
      name: "售后服务承诺函",
    },
    delivery_plan: {
      key: "delivery_plan",
      code: "A-08",
      name: "项目实施与交付计划",
    },
    team_resume: {
      key: "team_resume",
      code: "A-09",
      name: "项目团队与人员说明",
    },
    price_detail: {
      key: "price_detail",
      code: "A-10",
      name: "报价明细及价格说明",
    },
  };
}

