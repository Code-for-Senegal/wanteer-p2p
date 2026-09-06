export const OTP_PROVIDER = Symbol('OTP_PROVIDER');

export interface OtpProvider {
  send(phone: string, code: string): Promise<void>;
}
