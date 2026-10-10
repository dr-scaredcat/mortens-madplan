import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { supabase, DB_SCHEMA } from "@/lib/supabase";

/**
 * Live-opdatering: lyt efter ændringer i en tabel (fra fx den anden telefon)
 * og genindlæs de berørte queries. Ændringer samles kortvarigt, så mange
 * hurtige afkrydsninger ikke giver en storm af genindlæsninger.
 */
export function useRealtimeInvalidate(table: string, keys: QueryKey[]) {
  const qc = useQueryClient();
  const keyString = JSON.stringify(keys);

  useEffect(() => {
    const parsed = JSON.parse(keyString) as QueryKey[];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        for (const k of parsed) void qc.invalidateQueries({ queryKey: k });
      }, 250);
    };

    const channel = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: DB_SCHEMA, table }, refresh)
      .subscribe();

    // Hent friske data når appen kommer i forgrunden igen (fx telefonen låses op)
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [qc, table, keyString]);
}
