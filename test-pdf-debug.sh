#!/usr/bin/env bash
# test-pdf-debug.sh
# 用法: ./test-pdf-debug.sh test@example.com attaguy-plan

EMAIL=${1:-test@example.com}
PLANID=${2:-attaguy-plan}
BASE="http://localhost:3000"

echo "1) 发送验证码到 $EMAIL ..."
curl -s -X POST "$BASE/api/auth/email/send" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\"}" -o /dev/null
echo "  -> 已请求发送，检查邮箱获取验证码。"

read -p "2) 输入你收到的验证码并回车: " CODE

echo "3) 验证验证码并获取 downloadToken ..."
VERIFY_JSON=$(curl -s -X POST "$BASE/api/auth/otp/verify" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\",\"planId\":\"$PLANID\"}")

echo "  -> verify 返回："
echo "$VERIFY_JSON" | jq . 2>/dev/null || echo "$VERIFY_JSON"

DOWNLOAD_TOKEN=$(echo "$VERIFY_JSON" | node -e "const s = require('fs').readFileSync(0,'utf8'); try{console.log(JSON.parse(s).downloadToken||'');}catch(e){console.log('');}")

if [ -z "$DOWNLOAD_TOKEN" ]; then
  echo "ERROR: 没拿到 downloadToken，停止。完整 verify 输出:"
  echo "$VERIFY_JSON"
  exit 1
fi

DOWNLOAD_URL="$BASE/api/pdf?planId=$PLANID&mode=full&downloadToken=$DOWNLOAD_TOKEN"
echo "4) 使用 downloadToken 下载并保存 full_attaguy-plan.pdf"
curl -L -o full_attaguy-plan.pdf "$DOWNLOAD_URL"

echo
echo "检查：生成的文件 full_attaguy-plan.pdf（当前目录）请尝试打开。"
echo "如果 status 403 或 JSON 返回，请复制上面 curl 的完整输出并贴给我。"
