import { InitiatePaymentResult, PaymentStatusResult } from "./types";

/**
 * MTN Mobile Money — Collections API (Request to Pay).
 * Docs: https://momodeveloper.mtn.com/api-documentation/api-description/
 *
 * Required env vars:
 *   MTN_MOMO_ENV                 "sandbox" | "production"
 *   MTN_MOMO_SUBSCRIPTION_KEY    Ocp-Apim-Subscription-Key from your MoMo app
 *   MTN_MOMO_API_USER            UUID created via the sandbox/provisioning API
 *   MTN_MOMO_API_KEY             API key generated for that API user
 *   MTN_MOMO_TARGET_ENVIRONMENT  "sandbox" | "mtncameroon" (production env label)
 *   MTN_MOMO_CALLBACK_URL        optional — your webhook URL for async notifications
 */

const BASE_URL =
  process.env.MTN_MOMO_ENV === "production"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function getAccessToken(): Promise<string> {
  const subscriptionKey = requireEnv("MTN_MOMO_SUBSCRIPTION_KEY");
  const apiUser = requireEnv("MTN_MOMO_API_USER");
  const apiKey = requireEnv("MTN_MOMO_API_KEY");

  const basicAuth = Buffer.from(`${apiUser}:${apiKey}`).toString("base64");

  const res = await fetch(`${BASE_URL}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
  });

  if (!res.ok) {
    throw new Error(`MTN MoMo token request failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

/**
 * Initiates a "Request to Pay" — the customer receives a USSD prompt on
 * their phone to approve the debit. Returns immediately with a reference
 * ID; use `getMomoTransactionStatus` to poll for the final outcome.
 */
export async function requestMomoPayment(params: {
  amountXaf: number;
  phoneNumberLocal: string; // e.g. "677123456" (no country code)
  externalId: string; // our internal transaction id, for reconciliation
  payerMessage: string;
}): Promise<InitiatePaymentResult> {
  try {
    const subscriptionKey = requireEnv("MTN_MOMO_SUBSCRIPTION_KEY");
    const targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || "sandbox";
    const token = await getAccessToken();
    const referenceId = crypto.randomUUID();

    const body = {
      amount: String(params.amountXaf),
      currency: "EUR", // MTN sandbox only accepts EUR; switch to "XAF" once approved for production
      externalId: params.externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: `237${params.phoneNumberLocal}`,
      },
      payerMessage: params.payerMessage.slice(0, 160),
      payeeNote: "Abonnement Prime Ciné",
    };

    const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": targetEnvironment,
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Content-Type": "application/json",
        ...(process.env.MTN_MOMO_CALLBACK_URL ? { "X-Callback-Url": process.env.MTN_MOMO_CALLBACK_URL } : {}),
      },
      body: JSON.stringify(body),
    });

    if (res.status !== 202) {
      return { success: false, error: `MTN MoMo a refusé la demande (${res.status}): ${await res.text()}` };
    }

    return { success: true, providerReference: referenceId };
  } catch (e: any) {
    return { success: false, error: e.message ?? "Erreur MTN MoMo inconnue." };
  }
}

export async function getMomoTransactionStatus(referenceId: string): Promise<PaymentStatusResult> {
  const subscriptionKey = requireEnv("MTN_MOMO_SUBSCRIPTION_KEY");
  const targetEnvironment = process.env.MTN_MOMO_TARGET_ENVIRONMENT || "sandbox";
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": targetEnvironment,
      "Ocp-Apim-Subscription-Key": subscriptionKey,
    },
  });

  if (!res.ok) return { status: "pending" };

  const data = await res.json();
  const map: Record<string, PaymentStatusResult["status"]> = {
    SUCCESSFUL: "successful",
    FAILED: "failed",
    PENDING: "pending",
  };
  return { status: map[data.status] ?? "pending", raw: data };
}
