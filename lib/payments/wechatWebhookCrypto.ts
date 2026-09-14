/**
 * WeChat Pay API v3 notify: platform-cert signature verify + AES-256-GCM decrypt.
 * Never log secrets / signatures / decrypted PII beyond order correlation IDs.
 */
import crypto from "node:crypto";

/** Platform public key (PEM) or X.509 certificate PEM used to verify notify signatures. */
export const WECHAT_PLATFORM_PUBLIC_KEY_ENV = "WECHAT_PAY_PLATFORM_PUBLIC_KEY";

/** Platform certificate serial bound to the configured verification public key. */
export const WECHAT_PLATFORM_SERIAL_NO_ENV = "WECHAT_PAY_PLATFORM_SERIAL_NO";

export function normalizeWechatPublicKeyOrCert(raw: string): string {
  let pem = raw.trim().replace(/\\n/g, "\n");
  if (!pem.includes("BEGIN")) {
    pem = `-----BEGIN PUBLIC KEY-----\n${pem}\n-----END PUBLIC KEY-----`;
  }
  return pem;
}

/** Normalize WeChat certificate serial for exact case-insensitive comparison. */
export function normalizeWechatSerial(raw: string): string {
  return raw.trim().toUpperCase();
}

export function loadWechatPlatformPublicKey(): string {
  const raw = process.env[WECHAT_PLATFORM_PUBLIC_KEY_ENV]?.trim();
  if (!raw) {
    throw new Error(
      `NOT_CONFIGURED: missing ${WECHAT_PLATFORM_PUBLIC_KEY_ENV}`,
    );
  }
  return normalizeWechatPublicKeyOrCert(raw);
}

export function loadWechatPlatformSerialNo(): string {
  const raw = process.env[WECHAT_PLATFORM_SERIAL_NO_ENV]?.trim();
  if (!raw) {
    throw new Error(
      `NOT_CONFIGURED: missing ${WECHAT_PLATFORM_SERIAL_NO_ENV}`,
    );
  }
  return normalizeWechatSerial(raw);
}

/**
 * Require Wechatpay-Serial to match configured platform serial (case-insensitive).
 * Call before RSA signature verification. Fail closed on mismatch.
 */
export function assertWechatNotifySerialMatch(incomingSerial: string): void {
  const configured = loadWechatPlatformSerialNo();
  const incoming = normalizeWechatSerial(incomingSerial);
  if (!incoming) {
    throw new Error("WECHAT_NOTIFY_SERIAL_MISSING");
  }
  if (incoming !== configured) {
    throw new Error("WECHAT_NOTIFY_SERIAL_MISMATCH");
  }
}

/**
 * Verify WeChat Pay notify signature.
 * message = timestamp + "\n" + nonce + "\n" + body + "\n"
 */
export function verifyWechatPayNotifySignature(input: {
  timestamp: string;
  nonce: string;
  rawBody: string;
  signature: string;
  platformPublicKeyPem: string;
}): boolean {
  const { timestamp, nonce, rawBody, signature, platformPublicKeyPem } = input;
  if (!timestamp || !nonce || !signature || !rawBody) return false;

  const message = `${timestamp}\n${nonce}\n${rawBody}\n`;
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(message);
  verifier.end();

  try {
    return verifier.verify(
      platformPublicKeyPem,
      Buffer.from(signature, "base64"),
    );
  } catch {
    return false;
  }
}

export type WechatEncryptedResource = {
  ciphertext: string;
  nonce: string;
  associated_data?: string;
  algorithm?: string;
};

/**
 * Decrypt WeChat Pay API v3 resource with AEAD_AES_256_GCM.
 * Key = WECHAT_PAY_API_V3_KEY (32-byte UTF-8).
 */
export function decryptWechatPayResource(input: {
  apiV3Key: string;
  resource: WechatEncryptedResource;
}): string {
  const key = Buffer.from(input.apiV3Key, "utf8");
  if (key.length !== 32) {
    throw new Error("WECHAT_DECRYPT_FAILED: API v3 key must be 32 bytes");
  }

  const { ciphertext, nonce } = input.resource;
  const associatedData = input.resource.associated_data ?? "";
  if (!ciphertext || !nonce) {
    throw new Error("WECHAT_DECRYPT_FAILED: missing ciphertext/nonce");
  }

  const buf = Buffer.from(ciphertext, "base64");
  if (buf.length <= 16) {
    throw new Error("WECHAT_DECRYPT_FAILED: ciphertext too short");
  }
  const data = buf.subarray(0, buf.length - 16);
  const authTag = buf.subarray(buf.length - 16);

  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(nonce, "utf8"),
    );
    decipher.setAuthTag(authTag);
    if (associatedData) {
      decipher.setAAD(Buffer.from(associatedData, "utf8"));
    }
    const decrypted = Buffer.concat([
      decipher.update(data),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    throw new Error("WECHAT_DECRYPT_FAILED: AES-GCM decrypt error");
  }
}

export type WechatTransactionNotify = {
  mchid?: string;
  appid?: string;
  out_trade_no?: string;
  transaction_id?: string;
  trade_state?: string;
  amount?: { total?: number; payer_total?: number; currency?: string };
};
