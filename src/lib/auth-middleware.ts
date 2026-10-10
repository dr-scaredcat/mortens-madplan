import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, DB_SCHEMA } from "@/lib/supabase";

/**
 * Server-middleware: kræver en gyldig login-token og at brugeren er medlem af
 * Astons Køkken. Giver en Supabase-klient, der handler som brugeren (RLS gælder).
 */
export const requireMember = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const header = request?.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new Error("Du skal være logget ind.");

  const url = process.env.SUPABASE_URL || SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY;
  const client = createClient(url, key, {
    db: { schema: DB_SCHEMA },
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !userId) throw new Error("Login er udløbet. Log ind igen.");

  const { data: isMember } = await client.rpc("is_member");
  if (!isMember) throw new Error("Du har ikke adgang til appen.");

  return next({ context: { supabase: client, userId } });
});
