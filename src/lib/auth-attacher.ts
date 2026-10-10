import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";

/**
 * Klient-middleware: sender brugerens adgangstoken med på alle kald til
 * server-funktioner. Registreres globalt i src/start.ts.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    let token = data.session?.access_token;
    if (!token) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      token = refreshed.session?.access_token;
    }
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
