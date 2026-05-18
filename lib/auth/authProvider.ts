/**
 * 预留：正式 OAuth / OIDC / Passkey 等登录提供商接入点。
 * 当前使用 mock-login（邮箱）与 OTP 会话；后续在此封装 Provider 选择与回调。
 */

export type AuthProviderId = "mock_email" | "otp_email" | "oauth_placeholder";

export function describeAuthProvider(): AuthProviderId {
  return process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_MOCK_AUTH === "1"
    ? "mock_email"
    : "otp_email";
}
