// 测试脚本：获取有效 token 并测试 PDF 下载
// 使用方法：node test-pdf-with-token.js <email> <code> <planId>

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const EMAIL = process.argv[2] || "test@example.com";
const CODE = process.argv[3] || null; // 如果未提供，会从数据库读取
const PLAN_ID = process.argv[4] || "attaguy-plan";

async function testPdfWithToken() {
  console.log(`\n🧪 测试完整 PDF 下载流程（使用有效 token）`);
  console.log(`📧 邮箱: ${EMAIL}`);
  console.log(`📋 PlanId: ${PLAN_ID}`);
  console.log(`\n`);

  try {
    let verificationCode = CODE;

    // 1. 如果没有提供验证码，先发送验证码
    if (!verificationCode) {
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

      console.log(`✅ 验证码已发送，请检查邮箱或数据库\n`);
      console.log(`⚠️  请提供验证码作为参数：node test-pdf-with-token.js ${EMAIL} <验证码> ${PLAN_ID}`);
      return;
    }

    // 2. 验证 OTP 获取 downloadToken
    console.log("2️⃣ 验证 OTP 获取 downloadToken...");
    const verifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: EMAIL,
        code: verificationCode,
        planId: PLAN_ID,
      }),
    });

    const verifyData = await verifyRes.json().catch(() => ({}));
    console.log(`   状态: ${verifyRes.status}`);
    console.log(`   响应:`, JSON.stringify(verifyData, null, 2));

    if (!verifyRes.ok) {
      console.log(`\n❌ OTP 验证失败`);
      console.log(`   错误码: ${verifyData.code || "UNKNOWN"}`);
      console.log(`   错误信息: ${verifyData.message || verifyData.msg || "未知错误"}`);
      return;
    }

    const downloadToken = verifyData.downloadToken;
    if (!downloadToken) {
      console.error(`\n❌ 未获取到 downloadToken`);
      return;
    }

    console.log(`\n✅ OTP 验证成功！`);
    console.log(`   DownloadToken: ${downloadToken.substring(0, 30)}...`);
    console.log(`   过期时间: ${verifyData.expAt ? new Date(verifyData.expAt).toLocaleString() : "N/A"}`);
    console.log(`   最大使用次数: ${verifyData.maxUses || "N/A"}\n`);

    // 3. 使用 downloadToken 下载 PDF
    console.log("3️⃣ 使用 downloadToken 下载 PDF...");
    const pdfUrl = `${BASE_URL}/api/pdf?planId=${encodeURIComponent(PLAN_ID)}&downloadToken=${encodeURIComponent(downloadToken)}&mode=full`;
    console.log(`   请求 URL: ${pdfUrl.replace(downloadToken, downloadToken.substring(0, 20) + "...")}\n`);

    const pdfRes = await fetch(pdfUrl, {
      method: "GET",
    });

    const contentType = pdfRes.headers.get("content-type");
    const contentLength = pdfRes.headers.get("content-length");
    const contentDisposition = pdfRes.headers.get("content-disposition");

    console.log(`   状态: ${pdfRes.status} ${pdfRes.statusText}`);
    console.log(`   Content-Type: ${contentType || "N/A"}`);
    console.log(`   Content-Length: ${contentLength || "N/A"}`);
    console.log(`   Content-Disposition: ${contentDisposition || "N/A"}`);

    if (!pdfRes.ok) {
      const errorText = await pdfRes.text();
      let errorData = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { raw: errorText.substring(0, 200) };
      }
      console.log(`\n❌ PDF 下载失败`);
      console.log(`   错误:`, JSON.stringify(errorData, null, 2));
      return;
    }

    const pdfBuffer = await pdfRes.arrayBuffer();
    const pdfSize = (pdfBuffer.byteLength / 1024).toFixed(2);

    console.log(`\n✅ PDF 下载成功！`);
    console.log(`   文件大小: ${pdfSize} KB`);
    console.log(`   是否为 PDF: ${contentType?.includes("application/pdf") ? "是" : "否"}`);
    console.log(`   文件头: ${new Uint8Array(pdfBuffer.slice(0, 4)).map(b => String.fromCharCode(b)).join("")}`);

  } catch (error) {
    console.error(`\n❌ 请求失败:`, error.message);
    console.error(error.stack);
  }
}

testPdfWithToken();

