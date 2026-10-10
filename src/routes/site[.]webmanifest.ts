import { createFileRoute } from "@tanstack/react-router";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, DB_SCHEMA } from "@/lib/supabase";

/**
 * PWA-manifest genereret dynamisk, så app-navnet fra admin-indstillingerne også
 * bruges, når appen installeres på hjemmeskærmen.
 * (En allerede installeret app opdaterer typisk først navnet ved geninstallation.)
 */
export const Route = createFileRoute("/site.webmanifest")({
  server: {
    handlers: {
      GET: async () => {
        const name = await fetchAppName().catch(() => null);
        const appName = name || "Astons Køkken";
        const manifest = {
          name: appName,
          short_name: appName,
          description: "Opskrifter, indkøbsliste og ugeplan for husstanden",
          lang: "da",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#f5f5ee",
          theme_color: "#f5f5ee",
          icons: [
            { src: "/web-app-manifest-192x192.png?v=3", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/web-app-manifest-512x512.png?v=3", sizes: "512x512", type: "image/png", purpose: "any" },
            // Fuldflade-ikoner hvor hunden fylder Android-cirklen (som i Astons Bar)
            { src: "/web-app-manifest-maskable-192x192.png?v=3", sizes: "192x192", type: "image/png", purpose: "maskable" },
            { src: "/web-app-manifest-maskable-512x512.png?v=3", sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        };
        return new Response(JSON.stringify(manifest, null, 2), {
          headers: {
            "content-type": "application/manifest+json; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});

async function fetchAppName(): Promise<string | null> {
  const url = process.env.SUPABASE_URL || SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY;
  const res = await fetch(`${url}/rest/v1/settings?key=eq.app_name&select=value`, {
    headers: { apikey: key, "accept-profile": DB_SCHEMA },
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as { value: unknown }[];
  const v = rows[0]?.value;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
