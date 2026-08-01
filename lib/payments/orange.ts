import { InitiatePaymentResult, PaymentStatusResult } from "./types";

/**
 * Orange Money — Web Payment API (Cameroon).
 * Docs: https://developer.orange.com/apis/om-webpay-cm/
 *
 * Required env vars:
 *   ORANGE_MONEY_CLIENT_ID
 *   ORANGE_MONEY_CLIENT_SECRET
 *   ORANGE_MONEY_MERCHANT_KEY
 *   ORANGE_MONEY_RETURN_URL       page the customer lands on after paying
 *   ORANGE_MONEY_CANCEL_URL
 *   ORANGE_MONEY_NOTIF_URL        your webhook URL
 */

const AUTH_URL = "https://api.orange.com/oauth/v3/token";
const PAY_URL = "https://api.orange.com/orange-money-webpay/cm/v1/webpayment";
const STATUS_URL = "https://api.orange.com/orange-money-webpay/cm/v1/transactionstatus";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function getAccessToken(): Promise<string> {
  const clientId = requireEnv("ORANGE_MONEY_CLIENT_ID");
  const clientSecret = requireEnv("ORANGE_MONEY_CLIENT_SECRET");
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Orange Money token request failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

/**
 * Creates a hosted Orange Money payment page. Unlike MTN's direct
 * request-to-pay, Orange's Web Payment flow redirects the customer to an
 * Orange-hosted page to confirm with their PIN, then back to our site.
 */
export async function initiateOrangeMoneyPayment(params: {
  amountXaf: number;
  externalId: string;
  orderLabel: string;
}): Promise<InitiatePaymentResult> {
  try {
    const merchantKey = requireEnv("ORANGE_MONEY_MERCHANT_KEY");
    const token = await getAccessToken();

    const res = await fetch(PAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchant_key: merchantKey,
        currency: "XAF",
        order_id: params.externalId,
        amount: params.amountXaf,
        return_url: process.env.ORANGE_MONEY_RETURN_URL,
        cancel_url: process.env.ORANGE_MONEY_CANCEL_URL,
        notif_url: process.env.ORANGE_MONEY_NOTIF_URL,
        lang: "fr",
        reference: params.orderLabel.slice(0, 100),
      }),
    });

    if (!res.ok) {
      return { success: false, error: `Orange Money a refusé la demande (${res.status}): ${await res.text()}` };
    }

    const data = await res.json();
    // Orange returns { payment_url, pay_token, notif_token }
    return { success: true, providerReference: data.pay_token, redirectUrl: data.payment_url };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur Orange Money inconnue." };
  }
}

export async function getOrangeMoneyStatus(orderId: string, payToken: string): Promise<PaymentStatusResult> {
  try {
    const merchantKey = requireEnv("ORANGE_MONEY_MERCHANT_KEY");
    const token = await getAccessToken();

    const res = await fetch(STATUS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_id: orderId, amount: undefined, pay_token: payToken, merchant_key: merchantKey }),
    });

    if (!res.ok) return { status: "pending" };
    const data = await res.json();
    const map: Record<string, PaymentStatusResult["status"]> = {
      SUCCESS: "successful",
      SUCCESSFUL: "successful",
      FAILED: "failed",
      EXPIRED: "cancelled",
      PENDING: "pending",
      INITIATED: "pending",
    };
    return { status: map[data.status] ?? "pending", raw: data };
  } catch {
    return { status: "pending" };
  }
}
