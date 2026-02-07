#!/bin/bash
# 自动获取 downloadToken 并生成 curl 命令
# 使用方法: ./get-token-and-curl.sh <email> <planId> <code>

EMAIL=${1:-"test@example.com"}
PLAN_ID=${2:-"attaguy-plan"}
CODE=${3:-""}

BASE_URL="http://localhost:3000"

echo ""
echo "🧪 PDF 下载完整流程"
echo "📧 邮箱: $EMAIL"
echo "📋 PlanId: $PLAN_ID"
echo ""

# 如果没有提供验证码，先发送验证码
if [ -z "$CODE" ]; then
    echo "1️⃣ 发送验证码..."
    curl -s -X POST "$BASE_URL/api/auth/email/send" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\"}" | jq .
    
    echo ""
    echo "✅ 验证码已发送（请检查邮箱或数据库）"
    echo ""
    echo "📋 请提供验证码作为第3个参数："
    echo "   ./get-token-and-curl.sh $EMAIL $PLAN_ID <验证码>"
    echo ""
    exit 0
fi

echo "2️⃣ 验证验证码并获取 downloadToken..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/otp/verify" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"code\":\"$CODE\",\"planId\":\"$PLAN_ID\"}")

echo "$RESPONSE" | jq .

OK=$(echo "$RESPONSE" | jq -r '.ok')
if [ "$OK" != "true" ]; then
    echo ""
    echo "❌ 验证失败"
    exit 1
fi

DOWNLOAD_TOKEN=$(echo "$RESPONSE" | jq -r '.downloadToken')
EXP_AT=$(echo "$RESPONSE" | jq -r '.expAt')
MAX_USES=$(echo "$RESPONSE" | jq -r '.maxUses')

echo ""
echo "✅ 验证成功！"
echo "   DownloadToken: ${DOWNLOAD_TOKEN:0:30}..."
echo "   过期时间: $EXP_AT"
echo "   最大使用次数: $MAX_USES"
echo ""

# 生成 curl 命令
PDF_URL="$BASE_URL/api/pdf?planId=$(echo -n "$PLAN_ID" | jq -sRr @uri)&mode=full&downloadToken=$(echo -n "$DOWNLOAD_TOKEN" | jq -sRr @uri)"

echo "3️⃣ 生成的 curl 命令："
echo ""
echo "curl -L -o out.pdf \"$PDF_URL\""
echo ""

# 询问是否立即执行
read -p "是否立即执行下载？(y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "正在下载..."
    curl -L -o out.pdf "$PDF_URL"
    
    if [ -f "out.pdf" ]; then
        FILE_SIZE=$(stat -f%z "out.pdf" 2>/dev/null || stat -c%s "out.pdf" 2>/dev/null || echo "0")
        if [ "$FILE_SIZE" -gt 0 ]; then
            echo ""
            echo "✅ PDF 下载成功！"
            echo "   文件: out.pdf"
            echo "   大小: $((FILE_SIZE / 1024)) KB"
        else
            echo ""
            echo "⚠️  文件已下载但为空，可能是 JSON 响应"
            head -n 5 out.pdf
        fi
    else
        echo ""
        echo "❌ 文件下载失败"
    fi
fi

