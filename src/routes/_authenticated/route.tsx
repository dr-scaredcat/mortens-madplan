import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchMe, useMe } from "@/lib/queries";
import { SiteHeader } from "@/components/app/site-header";
import { Button } from "@/components/ui/button";

/**
 * Alle sider i appen ligger under denne layout-route. Den kræver login og at
 * brugeren er medlem af appen (madplan.members). Sider rendres kun i browseren,
 * da data hentes med brugerens egen login-session.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    // Hent medlemskab én gang og læg det i cachen til useMe()
    await context.queryClient.ensureQueryData({ queryKey: ["me"], queryFn: fetchMe });
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { data: me, error } = useMe();

  if (error) {
    return (
      <Shell>
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-sm">
          {(error as Error).message}
        </div>
      </Shell>
    );
  }

  if (me && !me.isMember) return <NoAccess email={me.email} />;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Outlet />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-md px-4 py-10">{children}</main>
    </div>
  );
}

function NoAccess({ email }: { email: string | null }) {
  const qc = useQueryClient();
  return (
    <Shell>
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h1 className="font-serif text-2xl">Ingen adgang endnu</h1>
        <p className="text-sm text-muted-foreground">
          Du er logget ind som <strong>{email}</strong>, men har ikke fået adgang til appen. Bed en
          administrator om at give dig adgang under Admin → Adgang.
        </p>
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut();
            qc.clear();
            window.location.href = "/auth";
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log ud
        </Button>
      </div>
    </Shell>
  );
}
