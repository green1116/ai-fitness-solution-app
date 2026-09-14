/**
 * WeChat Pay API v3 Native (QR) client helpers.
 * Signs requests with merchant private key; never log secrets.
 */
import crypto from "node:crypto";

const WECHAT_NATIVE_PATH = "/v3/pay/transactions/native";
const WECHAT_API_HOST = "https://api.mch.weixin.qq.com";

export type WechatNativeConfig = {
  mchId: string;
  appId: string;
  serialNo: string;
  privateKeyPem: string;
};

export type WechatNativePrepayInput = {
  outTradeNo: string;
  description: string;
  amountTotalFen: number;
  notifyUrl: string;
};

export type WechatNativePrepayResult = {
  codeUrl: string;
};

function readRequiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`NOT_CONFIGURED: missing ${name}`);
  }
  return v;
}

/** Normalize PEM from env (supports literal \n escapes). */
export function normalizeWechatPrivateKey(raw: string): string {
  let key = raw.trim().replace(/\\n/g, "\n");
  if (!key.includes("BEGIN")) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }
  return key;
}

export function loadWechatNativeConfig(): WechatNativeConfig {
  return {
    mchId: readRequiredEnv("WECHAT_PAY_MCH_ID"),
    appId: readRequiredEnv("WECHAT_PAY_APP_ID"),
    serialNo: readRequiredEnv("WECHAT_PAY_SERIAL_NO"),
    privateKeyPem: normalizeWechatPrivateKey(
      readRequiredEnv("WECHAT_PAY_PRIVATE_KEY"),
    ),
  };
}

function buildSignMessage(
  method: string,
  urlPath: string,
  timestamp: string,
  nonceStr: string,
  body: string,
): string {
  return `${method}\n${urlPath}\n${timestamp}\n${nonceStr}\n${body}\n`;
}

export function signWechatPayV3(
  message: string,
  privateKeyPem: string,
): string {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(message);
  signer.end();
  return signer.sign(privateKeyPem, "base64");
}

function buildAuthorizationHeader(opts: {
  mchId: string;
  serialNo: string;
  privateKeyPem: string;
  method: string;
  urlPath: string;
  body: string;
}): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString("hex");
  const message = buildSignMessage(
    opts.method,
    opts.urlPath,
    timestamp,
    nonceStr,
    opts.body,
  );
  const signature = signWechatPayV3(message, opts.privateKeyPem);
  return (
    `WECHATPAY2-SHA256-RSA2048 ` +
    `mchid="${opts.mchId}",` +
    `nonce_str="${nonceStr}",` +
    `signature="${signature}",` +
    `timestamp="${timestamp}",` +
    `serial_no="${opts.serialNo}"`
  );
}

/**
 * POST /v3/pay/transactions/native — returns code_url for QR/native pay.
 */
export async function createWechatNativePrepay(
  input: WechatNativePrepayInput,
): Promise<WechatNativePrepayResult> {
  const config = loadWechatNativeConfig();
  // Ensure API_V3_KEY is present for production readiness (used by future webhook decrypt).
  readRequiredEnv("WECHAT_PAY_API_V3_KEY");

  if (!Number.isInteger(input.amountTotalFen) || input.amountTotalFen <= 0) {
    throw new Error("INVALID_AMOUNT: amount.total must be a positive integer (fen)");
  }

  const bodyObj = {
    appid: config.appId,
    mchid: config.mchId,
    description: input.description.slice(0, 127),
    out_trade_no: input.outTradeNo,
    notify_url: input.notifyUrl,
    amount: {
      total: input.amountTotalFen,
      currency: "CNY",
    },
  };
  const body = JSON.stringify(bodyObj);
  const authorization = buildAuthorizationHeader({
    mchId: config.mchId,
    serialNo: config.serialNo,
    privateKeyPem: config.privateKeyPem,
    method: "POST",
    urlPath: WECHAT_NATIVE_PATH,
    body,
  });

  const res = await fetch(`${WECHAT_API_HOST}${WECHAT_NATIVE_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authorization,
    },
    body,
  });

  const rawText = await res.text().catch(() => "");
  let parsed: { code_url?: unknown; code?: unknown; message?: unknown } = {};
  try {
    parsed = rawText ? (JSON.parse(rawText) as typeof parsed) : {};
  } catch {
    parsed = {};
  }

  if (!res.ok) {
    const code = typeof parsed.code === "string" ? parsed.code : "";
    const message =
      typeof parsed.message === "string" && parsed.message.trim()
        ? parsed.message.trim()
        : `WeChat Pay Native failed with HTTP ${res.status}`;
    // Do not include response body secrets; WeChat error payloads are safe to surface briefly.
    throw new Error(
      `WECHAT_NATIVE_FAILED: ${code ? `${code}: ` : ""}${message}`,
    );
  }

  const codeUrl =
    typeof parsed.code_url === "string" ? parsed.code_url.trim() : "";
  if (!codeUrl) {
    throw new Error("WECHAT_NATIVE_INVALID_RESPONSE: missing code_url");
  }

  return { codeUrl };
}
