import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSettings, DEFAULT_APP_NAME } from "@/lib/queries";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/app/site-header";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Log ind — Astons Køkken" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session } = useSession();
  const { data: settings } = useSettings();
  const appName = settings?.appName ?? DEFAULT_APP_NAME;

  useEffect(() => {
    if (session) navigate({ to: "/" });
  }, [session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw new Error(
          /invalid login credentials/i.test(error.message)
            ? "Forkert e-mail eller adgangskode."
            : error.message,
        );
      }
      await qc.invalidateQueries();
      navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader showNav={false} />
      <main className="mx-auto max-w-md px-4 py-10">
        <Card className="p-6">
          <h1 className="mb-1 font-serif text-2xl">Log ind</h1>
          <p className="mb-5 text-sm text-muted-foreground">
            Log ind på {appName} med samme konto som til Fællesrejser.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Adgangskode</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Logger ind…" : "Log ind"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
