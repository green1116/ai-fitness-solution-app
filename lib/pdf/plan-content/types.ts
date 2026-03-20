export type Block =
  | { type: "paragraph"; text: string }
  | { type: "bullet_list"; title?: string; items: string[] }
  | { type: "subheading"; text: string }
  | {
      type: "table";
      title?: string;
      columns: string[];
      rows: string[][];
    }
  | {
      type: "callout";
      style: "info" | "warning" | "note";
      title: string;
      lines: string[];
    };

export type PlanModule = {
  id: string;
  toc: { l1: string; l2: string };
  title: string;
  blocks: Block[];
};

export type PlanContent = {
  tier: "lite" | "standard" | "pro";
  recommended?: boolean;
  modules: PlanModule[];
};