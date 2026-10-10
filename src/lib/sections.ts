/** Saml rækker i afsnit efter deres `section` (i den rækkefølge de står). */
export function groupBySection<T extends { section: string | null }>(
  items: T[],
): { section: string | null; items: T[] }[] {
  const groups: { section: string | null; items: T[] }[] = [];
  for (const it of items) {
    const sec = it.section?.trim() || null;
    const last = groups[groups.length - 1];
    if (last && last.section === sec) last.items.push(it);
    else groups.push({ section: sec, items: [it] });
  }
  return groups;
}
