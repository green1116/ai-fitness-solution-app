/**
 * Product Pricing — Discount types
 */

import type { DISCOUNT_KINDS } from "../management/management.constants";

export type DiscountKind = (typeof DISCOUNT_KINDS)[number];
export type DiscountMetadata = Record<string, unknown>;

export type PricingDiscount = {
  id: string;
  code: string;
  kind: DiscountKind;
  value: number;
  active: boolean;
  detail: string;
  metadata: DiscountMetadata;
  createdAt: string;
};

export type RegisterDiscountInput = {
  id?: string;
  code: string;
  kind: DiscountKind;
  value: number;
  metadata?: DiscountMetadata;
};
