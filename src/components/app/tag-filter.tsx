import { Badge } from "@/components/ui/badge";
import { useTagGroups, useTags } from "@/lib/queries";
import type { Tag } from "@/lib/types";

/**
 * Tags grupperet efter tag-gruppe. Bruges både som søgefilter og til at vælge
 * tags på en opskrift.
 */
export function TagChips({
  selected,
  onToggle,
  counts,
  onClear,
}: {
  selected: string[];
  onToggle: (tagId: string) => void;
  /** Valgfri: antal opskrifter pr. tag */
  counts?: Map<string, number>;
  onClear?: () => void;
}) {
  const { data: groups = [] } = useTagGroups();
  const { data: tags = [] } = useTags();

  const byGroup = new Map<string | null, Tag[]>();
  for (const t of tags) {
    const k = t.group_id ?? null;
    byGroup.set(k, [...(byGroup.get(k) ?? []), t]);
  }
  const sections = [
    ...groups.map((g) => ({ id: g.id, name: g.name, tags: byGroup.get(g.id) ?? [] })),
    { id: "none", name: "Andre", tags: byGroup.get(null) ?? [] },
  ].filter((s) => s.tags.length > 0);

  return (
    <div className="space-y-2">
      {sections.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-full text-xs font-medium text-muted-foreground sm:w-28">
            {s.name}
          </span>
          {s.tags.map((t) => {
            const active = selected.includes(t.id);
            const count = counts?.get(t.id);
            return (
              <button key={t.id} type="button" onClick={() => onToggle(t.id)}>
                <Badge
                  variant={active ? "default" : "outline"}
                  className={active ? "" : "bg-card font-normal"}
                >
                  {t.name}
                  {counts && (
                    <span className={active ? "ml-1 opacity-75" : "ml-1 text-muted-foreground"}>
                      {count ?? 0}
                    </span>
                  )}
                </Badge>
              </button>
            );
          })}
        </div>
      ))}
      {onClear && selected.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Ryd filtre
        </button>
      )}
    </div>
  );
}
