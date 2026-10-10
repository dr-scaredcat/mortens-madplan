import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase, unwrap } from "@/lib/supabase";
import { useMe } from "@/lib/queries";
import type { AppUser } from "@/lib/types";

/**
 * Vælg hvem der har adgang til appen. Listen viser alle brugere i det fælles
 * login-system (de samme konti som Fællesrejser). Nye konti oprettes dér.
 */
export function AdminAccess() {
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["app-users"],
    queryFn: async () => unwrap(await supabase.rpc("list_users")) as AppUser[],
  });

  async function setAccess(u: AppUser, member: boolean, admin: boolean) {
    if (u.user_id === me?.userId && u.is_admin && !admin) {
      if (!confirm("Fjern dine egne administratorrettigheder?")) return;
    }
    try {
      unwrap(
        await supabase.rpc("set_member", {
          p_user_id: u.user_id,
          p_member: member,
          p_admin: member && admin,
        }),
      );
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["app-users"] }),
        qc.invalidateQueries({ queryKey: ["member-names"] }),
        qc.invalidateQueries({ queryKey: ["me"] }),
      ]);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Adgang</h2>
        <p className="text-sm text-muted-foreground">
          Alle med adgang deler de samme opskrifter, indkøbsliste og ugeplan. Brugerne er de samme
          konti som i Fællesrejser — nye konti oprettes dér.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {(error as Error).message}
        </div>
      )}
      {isLoading && <p className="text-sm text-muted-foreground">Indlæser…</p>}

      {users && (
        <Card className="divide-y divide-border">
          <div className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-muted-foreground">
            <span className="flex-1">Bruger</span>
            <span className="w-16 text-center">Adgang</span>
            <span className="w-16 text-center">Admin</span>
          </div>
          {users.map((u) => (
            <div key={u.user_id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate font-medium">
                  {u.is_admin && <Shield className="h-4 w-4 shrink-0 text-primary" />}
                  {u.name ?? u.email}
                  {u.user_id === me?.userId && (
                    <span className="text-xs font-normal text-muted-foreground">(dig)</span>
                  )}
                </p>
                {u.name && <p className="truncate text-xs text-muted-foreground">{u.email}</p>}
              </div>
              <div className="flex w-16 justify-center">
                <Switch
                  checked={u.is_member}
                  onCheckedChange={(v) => setAccess(u, v, v ? u.is_admin : false)}
                  aria-label={`Adgang for ${u.email}`}
                />
              </div>
              <div className="flex w-16 justify-center">
                <Switch
                  checked={u.is_admin}
                  disabled={!u.is_member}
                  onCheckedChange={(v) => setAccess(u, true, v)}
                  aria-label={`Admin for ${u.email}`}
                />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
