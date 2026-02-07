// 测试脚本：完整的 PDF 下载流程（获取 token + 下载 PDF）
// 使用方法：node test-pdf-with-token-flow.js <email> <planId>

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.argv[2] || "test@example.com";
const PLAN_ID = process.argv[3] || "attaguy-plan";

async function testFullFlow() {
  console.log(`\n🧪 完整 PDF 下载流程测试`);
  console.log(`📧 邮箱: ${EMAIL}`);
  console.log(`📋 PlanId: ${PLAN_ID}\n`);

  try {
    // 1. 发送验证码
    console.log("1️⃣ 发送验证码...");
    const sendRes = await fetch(`${BASE_URL}/api/auth/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL }),
    });

    const sendData = await sendRes.json().catch(() => ({}));
    if (!sendRes.ok) {
      console.error(`❌ 发送验证码失败:`, sendData);
      return;
    }
    console.log(`✅ 验证码已发送（请检查邮箱或数据库获取验证码）\n`);

    // 2. 提示用户输入验证码
    console.log("2️⃣ 请输入收到的验证码：");
    console.log("   （提示：可以从数据库 EmailOtp 表或邮箱中获取）\n");
    
    // 如果提供了验证码作为参数，使用它
    const code = process.argv[4];
    if (!code) {
      console.log("❌ 请提供验证码作为第4个参数：");
      console.log(`   node test-pdf-with-token-flow.js ${EMAIL} ${PLAN_ID} <验证码>\n`);
      return;
    }

    console.log(`   使用验证码: ${code}\n`);

    // 3. 验证验证码并获取 downloadToken
    console.log("3️⃣ 验证验证码并获取 downloadToken...");
    const verifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        code: code,
        planId: PLAN_ID,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok) {
      console.error(`❌ 验证失败:`, verifyData);
      return;
    }

    const downloadToken = verifyData.downloadToken;
    console.log(`✅ 验证成功！`);
    console.log(`   DownloadToken: ${downloadToken.substring(0, 30)}...`);
    console.log(`   过期时间: ${verifyData.expAt ? new Date(verifyData.expAt).toLocaleString() : "N/A"}`);
    console.log(`   最大使用次数: ${verifyData.maxUses || "N/A"}\n`);

    // 4. 使用 downloadToken 下载 PDF
    console.log("4️⃣ 使用 downloadToken 下载 PDF...");
    const pdfUrl = `${BASE_URL}/api/pdf?planId=${encodeURIComponent(PLAN_ID)}&downloadToken=${encodeURIComponent(downloadToken)}&mode=full`;
    console.log(`   URL: ${pdfUrl.substring(0, 100)}...\n`);

    const pdfRes = await fetch(pdfUrl, {
      method: "GET",
      headers: {
        "User-Agent": "test-script/1.0",
      },
    });

    const contentType = pdfRes.headers.get("content-type");
    console.log(`   状态: ${pdfRes.status} ${pdfRes.statusText}`);
    console.log(`   Content-Type: ${contentType || "N/A"}`);

    if (pdfRes.ok && contentType?.includes("application/pdf")) {
      const buffer = await pdfRes.arrayBuffer();
      console.log(`\n✅ PDF 下载成功！`);
      console.log(`   文件大小: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      
      // 保存到文件
      const fs = await import("fs");
      const filename = `test-${PLAN_ID}.pdf`;
      fs.writeFileSync(filename, Buffer.from(buffer));
      console.log(`   已保存到: ${filename}`);
      
      // 输出 curl 命令
      console.log(`\n📋 对应的 curl 命令：`);
      console.log(`curl -o ${filename} "${pdfUrl}"`);
    } else {
      const text = await pdfRes.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { raw: text.substring(0, 200) };
      }

      console.log(`\n❌ PDF 下载失败`);
      console.log(`   错误码: ${errorData.code || errorData.error || "UNKNOWN"}`);
      console.log(`   错误信息: ${errorData.message || errorData.msg || text.substring(0, 100)}`);
      
      // 即使失败也输出 curl 命令供调试
      console.log(`\n📋 对应的 curl 命令（用于调试）：`);
      console.log(`curl -v "${pdfUrl}"`);
    }
  } catch (error) {
    console.error(`\n❌ 请求失败:`, error.message);
    console.error(error.stack);
  }
}

testFullFlow();

