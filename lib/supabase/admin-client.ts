import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

/**
 * ⚠️ SERVER-ONLY. Uses the Supabase service_role key, which bypasses every
 * RLS policy in the database. Never import this file from a Client
 * Component, never send its result to the browser, and never call it from
 * a Server Action triggered directly by user input — only from webhook
 * route handlers (app/api/webhooks/*) after verifying the request actually
 * came from the payment provider.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix — it must
 * never be bundled into client-side JS) set in your deployment environment.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Payment webhooks cannot confirm subscriptions without it."
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
