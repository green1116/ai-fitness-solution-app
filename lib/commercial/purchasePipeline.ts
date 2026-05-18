/**
 * 正式购买管线占位：真实支付接入时只替换「收银 / 回调」层，
 * 前后端下载仍依赖已持久化的 license（与 issue-license 履约结果写入一致）。
 *
 * 推荐顺序：
 * 1) POST /api/pay/create-order — 创建待支付订单
 * 2) 第三方支付 → 平台 webhook → POST /api/pay/webhook — 验签后履约、发证
 * 3) 服务端 issue-license（含在 fulfill 内）— 与现有下载头校验对齐
 */

export const PURCHASE_PIPELINE_STAGES = [
  "create-order",
  "webhook",
  "issue-license",
] as const;

/** 在接入真实收银前调用一次即可；下载逻辑无需改。 */
export function logPurchaseEntryPrepared(meta?: Record<string, unknown>) {
  console.info("[purchase-entry-prepared]", {
    stages: [...PURCHASE_PIPELINE_STAGES],
    note:
      "Swap payment provider only; persist license then reuse existing Pro/Enterprise download path.",
    ...meta,
  });
}
