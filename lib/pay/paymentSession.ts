/**
 * 服务端返回给前端的「下一步动作」，前端按 kind 分发，不依赖是否 mock。
 */
export type PaymentSession =
  | {
      kind: "client_complete";
      /** 由浏览器代为发起的同步请求（如开发态完成后端 webhook） */
      request: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body: unknown;
      };
    }
  | {
      kind: "redirect";
      url: string;
    }
  | {
      kind: "provider_pending";
      /** 轮询订单 / 发证状态（第三方支付完成后由 webhook 更新库） */
      statusUrl: string;
      pollIntervalMs?: number;
      message?: string;
    };
