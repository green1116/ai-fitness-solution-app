import { requireEmailFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const email = await requireEmailFromSession();
  if (!email) return new Response("Need verify", { status: 402 });

  const body = await req.json().catch(() => ({}));
  const planId = body?.planId ?? null;
  const intent = body?.intent ?? "contact_consultant";
  const payload = body?.payload ?? null;

  await prisma.lead.create({
    data: {
      email,
      planId,
      payload,
    },
  });

  return Response.json({ ok: true });
}

