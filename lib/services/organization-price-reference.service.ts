/**
 * C.6-A — Organization estimate price reference cells (subcategory × budget tier).
 *
 * Every read/write is scoped by organizationId. A reference is an ESTIMATE source only: Budget rows
 * snapshot the reference they were priced from and never resolve these rows again. `revision`
 * increments only when the range or sourceNote changes; deactivation is soft, idempotent and never
 * bumps revision; setting a deactivated cell again reactivates the same row.
 */

import { Prisma } from "@prisma/client";

import {
  validateEstimatePriceReferenceInput,
  type EstimatePriceReferenceInput,
} from "@/lib/budget/estimate-price-reference";
import type { PriceBand } from "@/lib/domain/tender";
import { prisma } from "@/lib/prisma";

export class PriceReferenceInputError extends Error {
  readonly status = 400;
  readonly code = "PRICE_REFERENCE_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "PriceReferenceInputError";
  }
}

export class PriceReferenceNotFoundError extends Error {
  readonly status = 404;
  readonly code = "PRICE_REFERENCE_NOT_FOUND";

  constructor() {
    super("组织价目不存在");
    this.name = "PriceReferenceNotFoundError";
  }
}

export class PriceReferenceConflictError extends Error {
  readonly status = 409;
  readonly code = "PRICE_REFERENCE_CONFLICT";

  constructor() {
    super("组织价目已被修改，请刷新后重试");
    this.name = "PriceReferenceConflictError";
  }
}

export type OrganizationPriceReferenceView = {
  id: string;
  subcategoryKey: string;
  budgetTier: PriceBand;
  unitPriceMin: number;
  unitPriceMax: number;
  sourceNote: string;
  revision: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

type PriceReferenceRow = {
  id: string;
  subcategoryKey: string;
  budgetTier: PriceBand;
  unitPriceMin: number;
  unitPriceMax: number;
  sourceNote: string;
  revision: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toView(row: PriceReferenceRow): OrganizationPriceReferenceView {
  return {
    id: row.id,
    subcategoryKey: row.subcategoryKey,
    budgetTier: row.budgetTier,
    unitPriceMin: row.unitPriceMin,
    unitPriceMax: row.unitPriceMax,
    sourceNote: row.sourceNote,
    revision: row.revision,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Only the five cell fields are read; anything else in the body (incl. organizationId) is ignored. */
function readInput(body: unknown): EstimatePriceReferenceInput {
  const row =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  const validated = validateEstimatePriceReferenceInput(
    row && {
      subcategoryKey: row.subcategoryKey,
      budgetTier: row.budgetTier,
      unitPriceMin: row.unitPriceMin,
      unitPriceMax: row.unitPriceMax,
      sourceNote: row.sourceNote,
    },
  );
  if (!validated.ok) throw new PriceReferenceInputError(validated.error);
  return validated.value;
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

async function findOwnedReference(organizationId: string, id: string) {
  const row = await prisma.organizationPriceReference.findFirst({ where: { id, organizationId } });
  if (!row) throw new PriceReferenceNotFoundError();
  return row;
}

export async function listActiveOrganizationPriceReferences(
  organizationId: string,
): Promise<OrganizationPriceReferenceView[]> {
  const rows = await prisma.organizationPriceReference.findMany({
    where: { organizationId, active: true },
    orderBy: [{ subcategoryKey: "asc" }, { budgetTier: "asc" }],
  });
  return rows.map(toView);
}

/**
 * Sets one cell (organization × subcategoryKey × budgetTier). Missing → revision 1; unchanged active
 * cell → no write; changed range / sourceNote → revision + 1; a deactivated cell is reactivated,
 * bumping revision only if its content changed. Updates are optimistic on the read revision + active.
 */
export async function setOrganizationPriceReference(input: {
  organizationId: string;
  userId: string;
  body: unknown;
}): Promise<{ reference: OrganizationPriceReferenceView; created: boolean }> {
  const next = readInput(input.body);
  const current = await prisma.organizationPriceReference.findUnique({
    where: {
      organizationId_subcategoryKey_budgetTier: {
        organizationId: input.organizationId,
        subcategoryKey: next.subcategoryKey,
        budgetTier: next.budgetTier,
      },
    },
  });

  if (!current) {
    try {
      const row = await prisma.organizationPriceReference.create({
        data: {
          organizationId: input.organizationId,
          subcategoryKey: next.subcategoryKey,
          budgetTier: next.budgetTier,
          unitPriceMin: next.unitPriceMin,
          unitPriceMax: next.unitPriceMax,
          sourceNote: next.sourceNote,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      });
      return { reference: toView(row), created: true };
    } catch (err) {
      if (isUniqueViolation(err)) throw new PriceReferenceConflictError();
      throw err;
    }
  }

  const contentChanged =
    current.unitPriceMin !== next.unitPriceMin ||
    current.unitPriceMax !== next.unitPriceMax ||
    current.sourceNote !== next.sourceNote;
  if (!contentChanged && current.active) return { reference: toView(current), created: false };

  const result = await prisma.organizationPriceReference.updateMany({
    where: {
      id: current.id,
      organizationId: input.organizationId,
      revision: current.revision,
      active: current.active,
    },
    data: {
      unitPriceMin: next.unitPriceMin,
      unitPriceMax: next.unitPriceMax,
      sourceNote: next.sourceNote,
      active: true,
      updatedBy: input.userId,
      ...(contentChanged ? { revision: { increment: 1 } } : {}),
    },
  });
  if (result.count !== 1) throw new PriceReferenceConflictError();
  return {
    reference: toView(await findOwnedReference(input.organizationId, current.id)),
    created: false,
  };
}

/** Soft deactivation; idempotent and never bumps revision. Budget snapshots are unaffected. */
export async function deactivateOrganizationPriceReference(input: {
  organizationId: string;
  userId: string;
  id: string;
}): Promise<OrganizationPriceReferenceView> {
  const current = await findOwnedReference(input.organizationId, input.id);
  if (!current.active) return toView(current);
  await prisma.organizationPriceReference.updateMany({
    where: { id: current.id, organizationId: input.organizationId, active: true },
    data: { active: false, updatedBy: input.userId },
  });
  return toView(await findOwnedReference(input.organizationId, current.id));
}
