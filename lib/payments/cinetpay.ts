import { InitiatePaymentResult, PaymentStatusResult } from "./types";

/**
 * CinetPay — used here specifically for CARD payments via a hosted
 * checkout page. We deliberately never collect raw card numbers ourselves:
 * building your own card form means taking on full PCI-DSS scope, which is
 * a real compliance and security burden. Redirecting to a PCI-compliant
 * hosted page is the correct approach for a project this size.
 *
 * Docs: https://docs.cinetpay.com/api/1.0-en/checkout/initialisation
 *
 * Required env vars:
 *   CINETPAY_API_KEY
 *   CINETPAY_SITE_ID
 *   CINETPAY_NOTIFY_URL     your webhook URL
 *   CINETPAY_RETURN_URL     page the customer lands on after paying
 */

const INIT_URL = "https://api-checkout.cinetpay.com/v2/payment";
const STATUS_URL = "https://api-checkout.cinetpay.com/v2/payment/check";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export async function initiateCardPayment(params: {
  amountXaf: number;
  externalId: string;
  description: string;
  customerName: string;
  customerEmail: string;
}): Promise<InitiatePaymentResult> {
  try {
    const apiKey = requireEnv("CINETPAY_API_KEY");
    const siteId = requireEnv("CINETPAY_SITE_ID");

    const res = await fetch(INIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: params.externalId,
        amount: params.amountXaf,
        currency: "XAF",
        description: params.description,
        channels: "CREDIT_CARD",
        notify_url: process.env.CINETPAY_NOTIFY_URL,
        return_url: process.env.CINETPAY_RETURN_URL,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        lang: "FR",
      }),
    });

    const data = await res.json();
    if (data.code !== "201") {
      return { success: false, error: data.message || "CinetPay a refusé la demande." };
    }

    return { success: true, providerReference: params.externalId, redirectUrl: data.data.payment_url };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur CinetPay inconnue." };
  }
}

export async function getCardPaymentStatus(externalId: string): Promise<PaymentStatusResult> {
  try {
    const apiKey = requireEnv("CINETPAY_API_KEY");
    const siteId = requireEnv("CINETPAY_SITE_ID");

    const res = await fetch(STATUS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey: apiKey, site_id: siteId, transaction_id: externalId }),
    });

    const data = await res.json();
    const status = data?.data?.status;
    const map: Record<string, PaymentStatusResult["status"]> = {
      ACCEPTED: "successful",
      REFUSED: "failed",
      CANCELLED: "cancelled",
      PENDING: "pending",
    };
    return { status: map[status] ?? "pending", raw: data };
  } catch {
    return { status: "pending" };
  }
}
