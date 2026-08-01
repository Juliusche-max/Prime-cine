export type PaymentProvider = "mtn_momo" | "orange_money" | "cinetpay_card";

export interface InitiatePaymentResult {
  success: boolean;
  providerReference?: string;
  redirectUrl?: string; // for hosted checkout flows (CinetPay)
  error?: string;
}

export interface PaymentStatusResult {
  status: "pending" | "successful" | "failed" | "cancelled";
  raw?: unknown;
}

/** Cameroon phone numbers: accept local (6XXXXXXXX) or +237 prefixed. */
export function normalizeCameroonPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("237")) return digits;
  if (digits.length === 9) return `237${digits}`;
  return digits;
}

export function isMtnNumber(localDigits: string) {
  // MTN Cameroon prefixes
  return /^(67|68|650|651|652|653|654)/.test(localDigits);
}

export function isOrangeNumber(localDigits: string) {
  // Orange Cameroon prefixes
  return /^(69|65[5-9])/.test(localDigits);
}
