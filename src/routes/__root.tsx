import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { useSettings } from "@/lib/queries";
import { applyThemeColors, THEME_CACHE_KEY } from "@/lib/themes";
import { oklchToHex, isOklchString } from "@/lib/color-utils";

// Inline boot-script: sætter cachede tema-farver som CSS-variabler FØR første
// paint, så standardtemaet ikke blinker, før det aktive tema er hentet fra
// Supabase. Mappingen er identisk med applyThemeColors i src/lib/themes.ts.
const THEME_BOOT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem("${THEME_CACHE_KEY}");
    if (!raw) return;
    var c = JSON.parse(raw);
    if (!c || !c.background) return;
    var s = document.documentElement.style;
    function set(k, v) { if (v) s.setProperty(k, v); }
    set("--background", c.background);
    set("--foreground", c.foreground);
    set("--card", c.card);
    set("--card-foreground", c.foreground);
    set("--popover", c.card);
    set("--popover-foreground", c.foreground);
    set("--primary", c.primary);
    set("--primary-foreground", c.primaryForeground);
    set("--secondary", c.accent);
    set("--secondary-foreground", c.accentForeground);
    set("--muted", c.muted);
    set("--muted-foreground", c.mutedForeground);
    set("--accent", c.accent);
    set("--accent-foreground", c.accentForeground);
    set("--destructive", c.destructive);
    set("--destructive-foreground", c.destructiveForeground);
    set("--border", c.border);
    set("--input", c.muted);
    set("--ring", c.primary);
  } catch (e) {}
})();
`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Siden findes ikke</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Siden er flyttet eller findes ikke længere.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Til forsiden
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-foreground">Siden kunne ikke indlæses</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Prøv igen
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Til forsiden
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Astons Køkken" },
      { name: "description", content: "Opskrifter, indkøbsliste og ugeplan for husstanden." },
      // Statisk fallback — ThemeLoader opdaterer den til temaets baggrund
      { name: "theme-color", content: "#faf6ef" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Astons Køkken" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      // Manifestet genereres dynamisk, så app-navnet fra admin bruges
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="da">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function colorToHex(value: string): string {
  if (isOklchString(value)) return oklchToHex(value);
  return value;
}

/** Anvender det aktive tema og app-navnet, når indstillingerne er hentet. */
function ThemeLoader() {
  const { data } = useSettings();

  useEffect(() => {
    if (!data) return;
    const active = data.themes.find((t) => t.id === data.activeThemeId) ?? data.themes[0];
    if (active) {
      applyThemeColors(active.colors);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", colorToHex(active.colors.background));
      try {
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(active.colors));
      } catch {
        // localStorage utilgængelig (fx privat browsing) — ignorér
      }
    }
    document
      .querySelector('meta[name="apple-mobile-web-app-title"]')
      ?.setAttribute("content", data.appName);
  }, [data]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeLoader />
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
