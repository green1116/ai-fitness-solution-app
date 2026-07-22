/**
 * Commercialization P1 — Offer catalog
 */

import { OFFER_KINDS } from "../sales/sales.constants";
import type {
  CommercialOffer,
  OfferKind,
  RegisterOfferInput,
} from "./offer.types";

const offers = new Map<string, CommercialOffer>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOffer(offer: CommercialOffer): CommercialOffer {
  return { ...offer, metadata: { ...offer.metadata } };
}

export function registerOffer(input: RegisterOfferInput): CommercialOffer {
  const name = input.name.trim();
  if (!name) throw new Error("offer.name is required");
  if (!(OFFER_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid offer kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("offer");
  if (offers.has(id)) {
    throw new Error(`offer already exists: ${id}`);
  }

  const now = nowIso();
  const offer: CommercialOffer = {
    id,
    name,
    kind: input.kind,
    description: (input.description ?? "").trim(),
    active: input.active ?? true,
    detail: `kind=${input.kind} active=${input.active ?? true}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  offers.set(id, offer);
  return cloneOffer(offer);
}

export function getCommercialOffer(id: string): CommercialOffer | undefined {
  const offer = offers.get(id.trim());
  return offer ? cloneOffer(offer) : undefined;
}

export function listCommercialOffers(filter?: {
  kind?: OfferKind;
  active?: boolean;
}): CommercialOffer[] {
  let result = [...offers.values()];
  if (filter?.kind) result = result.filter((o) => o.kind === filter.kind);
  if (filter?.active !== undefined) {
    result = result.filter((o) => o.active === filter.active);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOffer);
}

export function clearCommercialOffers(): void {
  offers.clear();
}
