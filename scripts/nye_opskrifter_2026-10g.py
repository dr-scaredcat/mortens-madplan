"""Lakserillettes med varmrøget laks.

Kør:  python3 scripts/nye_opskrifter_2026-10g.py chunk 0
"""
import json, sys

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"
NEW_INGREDIENTS = {"Varmrøget laks": "Kød & fisk"}
R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))

recipe("Lakserillettes med varmrøget laks",
  "Nem udgave uden kogning – den varmrøgede laks giver en dyb, røget smag. Kan laves dagen før.", 6, 15,
  ["Forret", "Fisk", "Fransk", "Hurtig"],
  ["|Varmrøget laks|300|g|uden skind", "|Smør|50|g|blødt", "|Creme fraiche|1|dl|",
   "|Skalotteløg|1|stk|meget fint hakket", "|Kapers|1|spsk|hakkede", "|Citron|0.5|stk|skal og saft",
   "|Dild|||hakket", "|Purløg|||hakket", "|Peberrod|1|tsk|revet, kan udelades", "|Peber|||",
   "Servering|Flutes|1|stk|ristet, eller rugbrød", "Servering|Radiser|||i tynde skiver"],
  ["|Pil laksen i små flager med en gaffel, og fjern evt. ben.|",
   "|Rør smør og creme fraiche glat. Vend laks, skalotteløg, kapers, citron, krydderurter og evt. peberrod i – rør forsigtigt, så der stadig er flager.|",
   "|Smag til med peber (laksen er salt i forvejen). Kom i en skål eller små glas og stil koldt.|60",
   "Servering|Server med ristet brød eller rugbrød og radiser.|"])


# ======================================================================= SQL
TEMPLATE = """with p as (select $j${payload}$j$::jsonb as j),
rec as (select x as d from p, jsonb_array_elements(p.j) x),
r as (insert into madplan.recipes (title, description, servings, prep_minutes, created_by)
  select d->>'t', d->>'d', (d->>'s')::int, (d->>'p')::int, '{created_by}' from rec
  where not exists (select 1 from madplan.recipes e where lower(e.title) = lower(rec.d->>'t'))
  returning id, title),
ri as (insert into madplan.recipe_ingredients (recipe_id, ingredient_id, amount, unit, note, sort_order, section)
  select r.id, i.id, nullif(v->>2,'')::numeric, nullif(v->>3,''), nullif(v->>4,''), (o-1)::int, nullif(v->>0,'')
  from rec join r on r.title = rec.d->>'t'
  cross join lateral jsonb_array_elements(rec.d->'i') with ordinality as a(v, o)
  join madplan.ingredients i on lower(i.name) = lower(v->>1)),
rs as (insert into madplan.recipe_steps (recipe_id, sort_order, text, timer_minutes, section)
  select r.id, (o-1)::int, v->>1, nullif(v->>2,'')::int, nullif(v->>0,'')
  from rec join r on r.title = rec.d->>'t'
  cross join lateral jsonb_array_elements(rec.d->'x') with ordinality as a(v, o))
insert into madplan.recipe_tags (recipe_id, tag_id)
  select r.id, t.id from rec join r on r.title = rec.d->>'t'
  cross join lateral jsonb_array_elements_text(rec.d->'g') g
  join madplan.tags t on t.name = g
returning recipe_id;"""

def payload(chunk):
    return json.dumps([{"t": r["title"], "d": r["desc"], "s": r["servings"], "p": r["prep"], "g": r["tags"],
                        "i": [(l.split("|") + [""] * 5)[:5] for l in r["ings"]],
                        "x": [(l.split("|") + [""] * 3)[:3] for l in r["steps"]]} for r in chunk],
                      ensure_ascii=False, separators=(",", ":"))

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "names":
        print(json.dumps(sorted({l.split("|")[1] for r in R for l in r["ings"]}), ensure_ascii=False))
        print(json.dumps(sorted({t for r in R for t in r["tags"]}), ensure_ascii=False))
        print(len(R), "opskrifter", sum(len(r["ings"]) for r in R), "ingredienslinjer", sum(len(r["steps"]) for r in R), "trin")
    elif len(sys.argv) > 2 and sys.argv[1] == "chunk":
        n = int(sys.argv[2]); size = 8
        print(TEMPLATE.format(payload=payload(R[n * size:(n + 1) * size]), created_by=CREATED_BY))
