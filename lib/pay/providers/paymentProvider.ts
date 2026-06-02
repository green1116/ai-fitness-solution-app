import type { PaymentSession } from "@/lib/pay/paymentSession";

export type StartPaymentOrderRow = {
  id: string;
  planId: string;
  targetLevel: string;
  amount: number;
  status: string;
};

export type StartPaymentContext = {
  orderId: string;
  planId: string;
  targetLevel: string;
  /** 金额（分） */
  amountCents: number;
  /** 当前站点 origin，如 https://example.com */
  baseUrl: string;
};

export interface PaymentProvider {
  readonly id: string;
  startPayment(
    ctx: StartPaymentContext,
    order: StartPaymentOrderRow,
  ): Promise<PaymentSession>;
}
