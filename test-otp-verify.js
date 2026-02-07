// 测试脚本：测试 POST /api/auth/otp/verify
// 使用方法：node test-otp-verify.js

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.argv[2] || "test@example.com";
const CODE = process.argv[3] || "123456";
const PLAN_ID = process.argv[4] || "attaguy-plan";

async function testOtpVerify() {
  console.log(`\n🧪 测试 OTP 验证接口`);
  console.log(`📧 邮箱: ${EMAIL}`);
  console.log(`🔢 验证码: ${CODE}`);
  console.log(`📋 PlanId: ${PLAN_ID}`);
  console.log(`\n`);

  try {
    // 1. 先发送验证码（如果需要）
    console.log("1️⃣ 发送验证码...");
    const sendRes = await fetch(`${BASE_URL}/api/auth/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL }),
    });

    const sendData = await sendRes.json().catch(() => ({}));
    console.log(`   状态: ${sendRes.status}`);
    console.log(`   响应:`, JSON.stringify(sendData, null, 2));

    if (!sendRes.ok) {
      console.error(`❌ 发送验证码失败`);
      return;
    }

    console.log(`✅ 验证码已发送（请检查邮箱或数据库）\n`);

    // 2. 等待用户输入验证码（或使用提供的验证码）
    console.log("2️⃣ 验证验证码...");
    console.log(`   使用验证码: ${CODE}\n`);

    const verifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        code: CODE,
        planId: PLAN_ID,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    const cookies = verifyRes.headers.get("set-cookie");

    console.log(`   状态: ${verifyRes.status}`);
    console.log(`   响应:`, JSON.stringify(verifyData, null, 2));
    if (cookies) {
      console.log(`   Cookie: ${cookies.substring(0, 50)}...`);
    }

    if (verifyRes.ok) {
      console.log(`\n✅ 验证成功！`);
      console.log(`   DownloadToken: ${verifyData.downloadToken?.substring(0, 20)}...`);
      console.log(`   过期时间: ${verifyData.expAt ? new Date(verifyData.expAt).toLocaleString() : "N/A"}`);
      console.log(`   最大使用次数: ${verifyData.maxUses || "N/A"}`);
    } else {
      console.log(`\n❌ 验证失败`);
      console.log(`   错误码: ${verifyData.code || "UNKNOWN"}`);
      console.log(`   错误信息: ${verifyData.message || verifyData.msg || "未知错误"}`);
    }
  } catch (error) {
    console.error(`\n❌ 请求失败:`, error.message);
    console.error(error.stack);
  }
}

testOtpVerify();

