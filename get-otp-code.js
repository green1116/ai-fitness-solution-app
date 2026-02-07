// 从数据库读取验证码
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const email = process.argv[2] || "test@example.com";

async function getOtpCode() {
  try {
    const row = await prisma.emailOtp.findUnique({
      where: { email },
    });

    if (row) {
      console.log(`验证码: ${row.code}`);
      console.log(`过期时间: ${row.expiresAt}`);
      console.log(`创建时间: ${row.createdAt}`);
      return row.code;
    } else {
      console.log("未找到验证码");
      return null;
    }
  } catch (error) {
    console.error("错误:", error.message);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

getOtpCode();

