import { Link, useNavigate, type LinkProps } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useMe, useSettings, DEFAULT_APP_NAME, DEFAULT_HEADER } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { SiteBrand } from "@/components/app/site-brand";

type NavItem = { to: NonNullable<LinkProps["to"]>; label: string; adminOnly?: boolean };

// Rækkefølgen her er rækkefølgen i menuen.
export const NAV_ITEMS: NavItem[] = [
  { to: "/ugeplan", label: "Ugeplan" },
  { to: "/opskrifter", label: "Opskrifter" },
  { to: "/indkoebsliste", label: "Indkøbsliste" },
  { to: "/basisvarer", label: "Basisvarer" },
  { to: "/admin", label: "Admin", adminOnly: true },
];

const pill =
  "shrink-0 rounded-full border border-transparent px-3 py-1 text-muted-foreground hover:text-foreground data-[status=active]:border-primary/40 data-[status=active]:bg-primary/10 data-[status=active]:text-primary";

export function SiteHeader({ showNav = true }: { showNav?: boolean }) {
  const { data: settings } = useSettings();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const appName = settings?.appName ?? DEFAULT_APP_NAME;

  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/auth" });
  }

  return (
    <>
      {/* Logo-række — scroller væk naturligt */}
      <div className="border-b border-border bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center tracking-tight">
            <SiteBrand name={appName} header={settings?.header ?? DEFAULT_HEADER} />
          </Link>
        </div>
      </div>

      {/* Nav-bar — sticky */}
      {showNav && me?.isMember && (
        <nav className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-1.5 text-sm">
            <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
              {NAV_ITEMS.filter((n) => !n.adminOnly || me.isAdmin).map((n) => (
                <Link key={n.to} to={n.to} className={pill}>
                  {n.label}
                </Link>
              ))}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={signOut}
              aria-label="Log ud"
              className="shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}
    </>
  );
}
