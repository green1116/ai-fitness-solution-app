// 测试 preview 模式（需要 session cookie）
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.argv[2] || "test@example.com";
const CODE = process.argv[3] || null;
const PLAN_ID = process.argv[4] || "attaguy-plan";

async function testPreviewWithSession() {
  console.log(`\n🧪 测试 Preview 模式（需要 session cookie）`);
  console.log(`📧 邮箱: ${EMAIL}`);
  console.log(`📋 PlanId: ${PLAN_ID}\n`);

  try {
    if (!CODE) {
      console.log("⚠️  请提供验证码：node test-preview-with-session.js <email> <code> <planId>");
      return;
    }

    // 1. 先通过 OTP 验证获取 session cookie
    console.log("1️⃣ 验证 OTP 获取 session cookie...");
    const verifyRes = await fetch(`${BASE_URL}/api/auth/email/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        code: CODE,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    console.log(`   状态: ${verifyRes.status}`);
    console.log(`   响应:`, JSON.stringify(verifyData, null, 2));

    if (!verifyRes.ok) {
      console.log(`\n❌ OTP 验证失败`);
      return;
    }

    // 2. 提取 session cookie
    const setCookie = verifyRes.headers.get("set-cookie");
    if (!setCookie) {
      console.log(`\n❌ 未获取到 session cookie`);
      return;
    }

    const sessionMatch = setCookie.match(/session=([^;]+)/);
    if (!sessionMatch) {
      console.log(`\n❌ 无法解析 session cookie`);
      return;
    }

    const sessionToken = sessionMatch[1];
    console.log(`\n✅ Session cookie 获取成功`);
    console.log(`   Session token: ${sessionToken.substring(0, 20)}...\n`);

    // 3. 使用 session cookie 访问 preview 端点
    console.log("2️⃣ 使用 session cookie 访问 preview 端点...");
    const previewUrl = `${BASE_URL}/api/pdf?planId=${encodeURIComponent(PLAN_ID)}&mode=preview`;
    console.log(`   请求 URL: ${previewUrl}\n`);

    const previewRes = await fetch(previewUrl, {
      method: "GET",
      headers: {
        "Cookie": `session=${sessionToken}`,
      },
    });

    const contentType = previewRes.headers.get("content-type");
    console.log(`   状态: ${previewRes.status} ${previewRes.statusText}`);
    console.log(`   Content-Type: ${contentType || "N/A"}`);

    if (previewRes.ok) {
      if (contentType?.includes("application/json")) {
        const data = await previewRes.json();
        console.log(`\n✅ Preview 访问成功！`);
        console.log(`   响应:`, JSON.stringify(data, null, 2));
      } else if (contentType?.includes("application/pdf")) {
        const buffer = await previewRes.arrayBuffer();
        console.log(`\n✅ PDF 下载成功！`);
        console.log(`   文件大小: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      }
    } else {
      const errorData = await previewRes.json().catch(() => ({}));
      console.log(`\n❌ Preview 访问失败`);
      console.log(`   错误:`, JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error(`\n❌ 请求失败:`, error.message);
    console.error(error.stack);
  }
}

testPreviewWithSession();

