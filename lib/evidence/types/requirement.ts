/**
 * V3.4-E3 Requirement Runtime Types
 */

export type RequirementCategory =
  | "qualification"
  | "technical"
  | "commercial"
  | "scoring"
  | "delivery"
  | "other";

export type RequirementItem = {
  id: string;
  section?: string;
  title: string;
  text: string;
  keywords: string[];
  mandatory?: boolean;
  category?: RequirementCategory;
};

/** 从招标/合规层导入前的规范化输入 */
export type RequirementInput = {
  id: string;
  section?: string;
  title?: string;
  text: string;
  keywords?: string[];
  mandatory?: boolean;
  category?: RequirementCategory;
};
