import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-klient til Astons Køkken.
 *
 * Appen deler Supabase-projekt med Astons Bar og Fællesrejser, men alle dens
 * tabeller ligger i sit eget schema "madplan". Klienten er derfor sat op med
 * db.schema = "madplan", så supabase.from("recipes") rammer madplan.recipes og
 * ikke Astons Bars public.recipes.
 *
 * Login deles med de andre apps (samme auth.users), men adgang til selve
 * måltidsappen styres af tabellen madplan.members.
 */

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://dkvrwwpbaarfyqyrnhha.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_NsAPFaHuYb2mQbejaLy9WQ_BtLxx8ri";

export const DB_SCHEMA = "madplan";
export const IMAGE_BUCKET = "madplan-images";

// Typerne for schemaet er håndskrevne (src/lib/types.ts), så klienten er
// bevidst løst typet her og castes i de enkelte forespørgsler.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>;

function createBrowserClient(): Client {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    db: { schema: DB_SCHEMA },
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
      storageKey: "astonskoekken.auth",
    },
  });
}

let _client: Client | undefined;

/** Den fælles klient. Oprettes dovent, så SSR ikke rører localStorage. */
export const supabase: Client = new Proxy({} as Client, {
  get(_, prop, receiver) {
    if (!_client) _client = createBrowserClient();
    return Reflect.get(_client, prop, receiver);
  },
});

/** Kast en læsbar fejl, hvis et Supabase-kald fejlede. */
export function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(translateError(res.error.message));
  return res.data as T;
}

function translateError(message: string): string {
  if (/Invalid schema: madplan/i.test(message) || /schema must be one of/i.test(message)) {
    return 'Databasen er ikke klar: schemaet "madplan" skal tilføjes under "Exposed schemas" i Supabase.';
  }
  if (/duplicate key value/i.test(message)) return "Findes allerede.";
  if (/violates foreign key constraint/i.test(message) && /recipe_ingredients/i.test(message)) {
    return "Ingrediensen bruges i en eller flere opskrifter og kan ikke slettes.";
  }
  if (/row-level security/i.test(message)) return "Du har ikke adgang til at gøre dette.";
  return message;
}

/** Offentlig URL til et billede i appens storage-bucket. */
export function publicImageUrl(path: string): string {
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
