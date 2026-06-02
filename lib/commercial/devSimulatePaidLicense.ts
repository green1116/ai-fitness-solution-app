/**
 * 薄封装：与 executePayPurchaseAndIssueLicense 相同，便于旧代码引用。
 */
import {
  executePayPurchaseAndIssueLicense,
  type ExecutePayPurchaseInput,
} from "@/lib/commercial/payOrderFulfillment";

export type SimulatePayWebhookFulfillmentInput = ExecutePayPurchaseInput;

export type SimulatePayWebhookFulfillmentResult = {
  orderId: string;
  licenseKey: string;
};

export async function simulatePayWebhookFulfillment(
  input: SimulatePayWebhookFulfillmentInput,
): Promise<SimulatePayWebhookFulfillmentResult> {
  return executePayPurchaseAndIssueLicense(input);
}
