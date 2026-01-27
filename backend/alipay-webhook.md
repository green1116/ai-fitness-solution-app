# 支付宝回调处理说明

## 概述

`/webhook/alipay-notify` 路由用于处理支付宝支付完成后的回调通知。

## 配置

在 `.env` 文件中添加：

```env
# 支付宝公钥（用于验证签名）
ALIPAY_PUBLIC_KEY=支付宝公钥内容
```

## 工作流程

1. **接收回调**：支付宝 POST 数据到 `/webhook/alipay-notify`
2. **验证签名**：使用支付宝公钥验证回调数据的签名
3. **检查订单**：验证 `out_trade_no` 和金额是否匹配
4. **更新状态**：将订单标记为已支付
5. **返回成功**：返回 `'success'` 告诉支付宝处理成功

## 回调参数说明

支付宝会发送以下参数：

- `out_trade_no` - 商户订单号（对应我们的 order_no）
- `total_amount` - 订单金额（元）
- `trade_status` - 交易状态
  - `TRADE_SUCCESS` - 交易成功
  - `TRADE_FINISHED` - 交易结束
- `trade_no` - 支付宝交易号
- `buyer_id` - 买家支付宝用户ID
- `notify_time` - 通知时间
- `sign` - 签名
- `sign_type` - 签名类型（通常为 RSA2）

## 签名验证

当前代码中签名验证部分是伪码，实际生产环境需要使用支付宝 SDK。

### 使用支付宝官方 SDK（推荐）

安装 SDK：

```bash
npm install alipay-sdk
```

示例代码：

```javascript
const AlipaySdk = require('alipay-sdk').default;
const AlipayFormData = require('alipay-sdk/lib/form').default;

const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
  signType: 'RSA2'
});

// 在 webhook 中验证
const isValid = alipaySdk.checkNotifySign(params);
if (!isValid) {
  return res.status(400).send('Invalid signature');
}
```

### 手动验证签名

如果需要手动验证，可以使用 `crypto` 模块：

```javascript
const crypto = require('crypto');

function verifyAlipaySign(params, publicKey) {
  // 1. 过滤 sign 和 sign_type
  const filtered = {};
  Object.keys(params).forEach(key => {
    if (key !== 'sign' && key !== 'sign_type') {
      filtered[key] = params[key];
    }
  });

  // 2. 排序并构建签名字符串
  const sorted = Object.keys(filtered).sort();
  const signStr = sorted.map(key => `${key}=${filtered[key]}`).join('&');

  // 3. 验证签名
  const sign = Buffer.from(params.sign, 'base64');
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(signStr, 'utf8');
  return verify.verify(publicKey, sign);
}
```

## 安全注意事项

1. **必须验证签名**：生产环境必须验证签名，防止伪造回调
2. **幂等性处理**：同一订单可能收到多次回调，需要判断订单状态
3. **返回 success**：无论成功或失败都应返回 `'success'`，避免支付宝重复通知
4. **记录日志**：记录所有回调数据，便于排查问题
5. **HTTPS**：生产环境必须使用 HTTPS，保护回调数据

## 测试

可以使用支付宝沙箱环境进行测试：

1. 注册支付宝开放平台账号
2. 创建应用并获取沙箱参数
3. 配置 `ALIPAY_APP_ID`、`ALIPAY_PRIVATE_KEY`、`ALIPAY_PUBLIC_KEY`
4. 使用沙箱环境进行支付测试

## 常见问题

### 1. 回调未收到

- 检查服务器是否能被外网访问
- 检查回调 URL 是否正确配置在支付宝商户平台
- 检查防火墙设置

### 2. 签名验证失败

- 确认使用的是正确的公钥（支付宝公钥，不是应用公钥）
- 确认签名类型匹配（RSA 或 RSA2）
- 检查参数编码是否正确

### 3. 重复通知

- 实现幂等性检查（检查订单状态）
- 记录通知 ID，避免重复处理

## 返回格式

支付宝要求回调处理必须返回 `'success'`（纯文本），否则会重复发送通知。

当前实现已经满足要求，无论成功或失败都会返回 `'success'`，但会在日志中记录错误。

