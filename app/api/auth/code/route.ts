export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return new Response(JSON.stringify({ ok: false, message: "Invalid email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 生成6位验证码（演示：直接返回给前端；生产：这里应该发到邮箱）
  const code = String(Math.floor(100000 + Math.random() * 900000));

  // 演示：把验证码返回给前端
  return new Response(JSON.stringify({ ok: true, code }), {
    headers: { "Content-Type": "application/json" },
  });
}

