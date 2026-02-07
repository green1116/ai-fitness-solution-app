// 测试脚本：测试 GET /api/pdf
// 使用方法：node test-pdf-download.js <planId> <downloadToken> [mode]

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
// 参数解析：node test-pdf-download.js <planId> [downloadToken] [mode]
const PLAN_ID = process.argv[2] || "attaguy-plan";
const DOWNLOAD_TOKEN = process.argv[3] && process.argv[3] !== "preview" && process.argv[3] !== "full" 
  ? process.argv[3] 
  : (process.argv[4] === "preview" || process.argv[4] === "full" ? "" : process.argv[3] || "");
const MODE = process.argv[3] === "preview" || process.argv[3] === "full" 
  ? process.argv[3] 
  : (process.argv[4] === "preview" || process.argv[4] === "full" ? process.argv[4] : "full");

async function testPdfDownload() {
  console.log(`\n🧪 测试 PDF 下载接口`);
  console.log(`📋 PlanId: ${PLAN_ID}`);
  if (DOWNLOAD_TOKEN) {
    console.log(`🎫 DownloadToken: ${DOWNLOAD_TOKEN.substring(0, 20)}...`);
  } else {
    console.log(`🎫 DownloadToken: (无)`);
  }
  console.log(`📄 Mode: ${MODE}`);
  console.log(`\n`);

  try {
    let url = `${BASE_URL}/api/pdf?planId=${encodeURIComponent(PLAN_ID)}&mode=${encodeURIComponent(MODE)}`;
    if (DOWNLOAD_TOKEN) {
      url += `&downloadToken=${encodeURIComponent(DOWNLOAD_TOKEN)}`;
    }
    console.log(`📡 请求 URL: ${url}\n`);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "test-script/1.0",
      },
    });

    const contentType = res.headers.get("content-type");
    const contentLength = res.headers.get("content-length");
    const contentDisposition = res.headers.get("content-disposition");

    console.log(`   状态: ${res.status} ${res.statusText}`);
    console.log(`   Content-Type: ${contentType || "N/A"}`);
    console.log(`   Content-Length: ${contentLength || "N/A"}`);
    console.log(`   Content-Disposition: ${contentDisposition || "N/A"}`);

    if (res.ok && contentType?.includes("application/pdf")) {
      const buffer = await res.arrayBuffer();
      console.log(`\n✅ PDF 下载成功！`);
      console.log(`   文件大小: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
      console.log(`   文件已保存到内存（实际应用中应保存到文件）`);
      
      // 可选：保存到文件
      if (process.argv.includes("--save")) {
        const fs = await import("fs");
        const filename = `${PLAN_ID}-${MODE}.pdf`;
        fs.writeFileSync(filename, Buffer.from(buffer));
        console.log(`   已保存到: ${filename}`);
      }
    } else {
      // 错误响应
      const text = await res.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch {
        errorData = { raw: text.substring(0, 200) };
      }

      console.log(`\n❌ 下载失败`);
      console.log(`   错误码: ${errorData.code || errorData.error || "UNKNOWN"}`);
      console.log(`   错误信息: ${errorData.message || errorData.msg || text.substring(0, 100)}`);
      console.log(`   完整响应:`, JSON.stringify(errorData, null, 2));
    }
  } catch (error) {
    console.error(`\n❌ 请求失败:`, error.message);
    console.error(error.stack);
  }
}

testPdfDownload();

