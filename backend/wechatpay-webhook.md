# 微信支付回调处理说明

## 概述

`/webhook/wechatpay` 路由用于处理微信支付完成后的回调通知。微信支付使用 XML 格式传输数据。

## 配置

在 `.env` 文件中添加：

```env
# 微信支付 API Key（用于验证签名）
WECHAT_PAY_API_KEY=你的微信支付API密钥
```

## 安装依赖

```bash
npm install xml2js
```

## 工作流程

1. **接收回调**：微信支付 POST XML 数据到 `/webhook/wechatpay`
2. **解析 XML**：使用 `xml2js` 解析 XML 数据
3. **验证签名**：使用 API Key 验证回调数据的签名
4. **检查订单**：验证 `out_trade_no` 和金额是否匹配
5. **更新状态**：将订单标记为已支付
6. **返回成功**：返回 XML 格式的 `SUCCESS` 告诉微信处理成功

## 回调参数说明

微信支付会发送以下 XML 参数：

- `return_code` - 返回状态码（SUCCESS/FAIL）
- `result_code` - 业务结果（SUCCESS/FAIL）
- `out_trade_no` - 商户订单号（对应我们的 order_no）
- `total_fee` - 订单金额（分）
- `transaction_id` - 微信支付订单号
- `openid` - 用户 openid
- `time_end` - 支付完成时间
- `sign` - 签名

## 签名验证

当前代码中签名验证部分是伪码，实际生产环境需要使用微信支付 SDK 或手动实现。

### 手动验证签名

微信支付使用 MD5 或 HMAC-SHA256 签名：

```javascript
const crypto = require('crypto');

function verifyWeChatPaySign(params, apiKey, signType = 'MD5') {
  // 1. 过滤 sign 和空值
  const filtered = {};
  Object.keys(params).forEach(key => {
    if (key !== 'sign' && params[key] !== '') {
      filtered[key] = params[key];
    }
  });

  // 2. 排序并构建签名字符串
  const sorted = Object.keys(filtered).sort();
  const signStr = sorted.map(key => `${key}=${filtered[key]}`).join('&');
  const signStrWithKey = `${signStr}&key=${apiKey}`;

  // 3. 计算签名
  let calculatedSign;
  if (signType === 'MD5') {
    calculatedSign = crypto.createHash('md5').update(signStrWithKey, 'utf8').digest('hex').toUpperCase();
  } else if (signType === 'HMAC-SHA256') {
    calculatedSign = crypto.createHmac('sha256', apiKey).update(signStr, 'utf8').digest('hex').toUpperCase();
  }

  // 4. 比较签名
  return calculatedSign === params.sign.toUpperCase();
}
```

在 webhook 中使用：

```javascript
const signType = data.sign_type || 'MD5';
const isValid = verifyWeChatPaySign(data, process.env.WECHAT_PAY_API_KEY, signType);
if (!isValid) {
  return res.send('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[Invalid signature]]></return_msg></xml>');
}
```

## 响应格式

微信支付要求回调处理必须返回 XML 格式：

**成功：**
```xml
<xml>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <return_msg><![CDATA[OK]]></return_msg>
</xml>
```

**失败：**
```xml
<xml>
  <return_code><![CDATA[FAIL]]></return_code>
  <return_msg><![CDATA[错误信息]]></return_msg>
</xml>
```

## 安全注意事项

1. **必须验证签名**：生产环境必须验证签名，防止伪造回调
2. **幂等性处理**：同一订单可能收到多次回调，需要判断订单状态
3. **返回格式**：无论成功或失败都应返回 XML 格式响应
4. **记录日志**：记录所有回调数据，便于排查问题
5. **HTTPS**：生产环境必须使用 HTTPS，保护回调数据

## 测试

可以使用微信支付沙箱环境进行测试：

1. 注册微信支付商户平台账号
2. 获取沙箱参数（商户号、API Key 等）
3. 配置 `WECHAT_PAY_API_KEY`
4. 使用沙箱环境进行支付测试

## 常见问题

### 1. 回调未收到

- 检查服务器是否能被外网访问
- 检查回调 URL 是否正确配置在微信支付商户平台
- 检查防火墙设置
- 微信支付回调需要 HTTPS

### 2. 签名验证失败

- 确认使用的是正确的 API Key（商户平台设置的密钥）
- 确认签名类型匹配（MD5 或 HMAC-SHA256）
- 检查参数编码是否正确
- 注意签名需要转换为大写

### 3. XML 解析错误

- 确认安装了 `xml2js` 依赖
- 检查 XML 格式是否正确
- 检查字符编码（应该是 UTF-8）

### 4. 重复通知

- 实现幂等性检查（检查订单状态）
- 记录通知 ID，避免重复处理
- 微信支付会重复发送通知直到收到成功响应

## 与支付宝回调的区别

| 特性 | 微信支付 | 支付宝 |
|------|----------|--------|
| 数据格式 | XML | URL-encoded |
| 签名算法 | MD5/HMAC-SHA256 | RSA/RSA2 |
| 返回格式 | XML | 纯文本 'success' |
| 金额单位 | 分 | 元 |

