"""Runde 6 (det franske køkken): genererer SQL til nye opskrifter i Astons Køkken.

Kør:  python3 scripts/nye_opskrifter_2026-10f.py chunk <n>   -> SQL for opskrift-chunk n (8 pr. chunk)
      python3 scripts/nye_opskrifter_2026-10f.py names       -> alle ingrediensnavne og tags (til kontrol)
"""
import json, sys

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"

NEW_INGREDIENTS = {
    "Andelår": "Kød & fisk",
    "Andefedt": "Kød & fisk",
    "Cognac": "Drikkevarer",
    "Grønne peberkorn": "Dåser & glas",
}

R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))

TAERTEDEJ = ["Tærtedej|Hvedemel|1.5|dl|", "Tærtedej|Fuldkornsmel|1|dl|gerne fintsigtet", "Tærtedej|Smør|70|g|koldt",
             "Tærtedej|Salt|0.5|tsk|", "Tærtedej|Vand|4|spsk|måske lidt mere"]

# ======================================================================= Hovedretter
recipe("Kylling Dijon",
  "Fransk bistroklassiker: kylling i cremet sennepssauce med hvidvin.", 4, 35,
  ["Hovedretter", "Kylling", "Fransk", "Panderet", "Hurtig"],
  ["Kylling|Kyllingebryst|600|g|", "Kylling|Salt|||", "Kylling|Peber|||", "Kylling|Smør|1|spsk|",
   "Sauce|Skalotteløg|2|stk|finthakket", "Sauce|Hvidløg|1|fed|", "Sauce|Hvidvin|1|dl|",
   "Sauce|Fløde|2.5|dl|", "Sauce|Dijonsennep|2|spsk|", "Sauce|Sennep|1|spsk|grov",
   "Sauce|Estragon|1|spsk|hakket, eller persille",
   "Tilbehør|Kartofler|800|g|"],
  ["Tilbehør|Kog kartoflerne.|20",
   "Kylling|Krydr kyllingen og brun den i smør på begge sider. Tag den op.|6",
   "Sauce|Svits skalotteløg og hvidløg i panden. Hæld hvidvinen ved og kog den næsten helt ind.|3",
   "Sauce|Rør fløde og sennep i, kom kyllingen tilbage og lad det simre, til kyllingen er gennemstegt.|10",
   "Sauce|Rør estragon i, smag til og server med kartofler.|"])

recipe("Quiche lorraine",
  "Fransk tærte med bacon og løg. Bunden er den samme som i jeres andre tærter. Til en form på 18–20 cm – til 24 cm laves halvanden portion.", 3, 70,
  ["Hovedretter", "Svinekød", "Fransk", "Ovnret"],
  [*TAERTEDEJ,
   "Fyld|Bacon|150|g|i tern", "Fyld|Løg|1|stk|i tynde skiver", "Fyld|Æg|3|stk|",
   "Fyld|Fløde|2|dl|", "Fyld|Revet ost|75|g|gerne gruyère", "Fyld|Muskatnød|1|knsp|",
   "Fyld|Salt|||", "Fyld|Peber|||"],
  ["Tærtedej|Smuldr mel, salt og koldt smør sammen (eller blend det), og saml dejen med lidt vand. Stil den på køl.|30",
   "Fyld|Steg bacon og løg, til baconen er sprød og løget blødt. Lad det køle lidt.|8",
   "Fyld|Pisk æg, fløde, ost, muskat, salt og peber sammen.|",
   "Tærtedej|Tænd ovnen på 180 °C varmluft. Rul dejen ud til ca. 2 mm, læg den i formen og prik bunden. Forbag den.|10",
   "Fyld|Fordel bacon og løg i bunden, hæld æggemassen over og bag, til den har sat sig.|30",
   "|Lad quichen sætte sig et par minutter før servering.|5"])

recipe("Ratatouille",
  "Provencalsk grøntsagsgryde. God som hovedret med brød eller ris – og som tilbehør til kød.", 4, 60,
  ["Hovedretter", "Vegetar", "Fransk", "Gryderet"],
  ["|Olivenolie|4|spsk|", "|Løg|1|stk|i tern", "|Hvidløg|3|fed|", "|Aubergine|1|stk|i tern",
   "|Squash|1|stk|i tern", "|Peberfrugt|2|stk|i tern", "|Hakkede tomater|1|dåse|",
   "|Tomater|3|stk|i tern", "|Frisk timian|3|stilk|", "|Basilikum|||", "|Salt|||", "|Peber|||",
   "Servering|Flutes|1|stk|"],
  ["|Steg aubergine i halvdelen af olien, til den er gylden. Tag den op. Steg squash og peberfrugt på samme måde.|12",
   "|Svits løg og hvidløg i resten af olien, til de er bløde.|5",
   "|Kom alle grøntsager tilbage med tomater og timian, og lad gryden simre under låg.|30",
   "|Smag til med salt og peber, rør basilikum i og server med brød.|"])

recipe("Fransk løgsuppe med gratineret brød",
  "Løgene skal stege langsomt, til de er dybt karamelliserede – det er hele hemmeligheden.", 4, 90,
  ["Hovedretter", "Suppe", "Fransk"],
  ["Suppe|Løg|1|kg|i tynde skiver", "Suppe|Smør|50|g|", "Suppe|Sukker|1|tsk|", "Suppe|Hvedemel|1|spsk|",
   "Suppe|Hvidvin|1.5|dl|", "Suppe|Oksebouillon|2|terning|", "Suppe|Vand|1.2|l|",
   "Suppe|Frisk timian|3|stilk|", "Suppe|Laurbærblade|1|stk|", "Suppe|Salt|||", "Suppe|Peber|||",
   "Gratinering|Flutes|1|stk|i skiver", "Gratinering|Revet ost|150|g|gerne gruyère"],
  ["Suppe|Steg løgene i smør ved lav-middel varme under jævnlig omrøring, til de er dybt gyldenbrune. Tilsæt sukker halvvejs.|45",
   "Suppe|Drys melet over og rør rundt. Hæld hvidvinen ved og kog den ind.|2",
   "Suppe|Tilsæt vand, bouillon, timian og laurbær, og lad suppen simre. Smag til.|25",
   "Gratinering|Rist brødskiverne. Hæld suppen i ovnfaste skåle, læg brød på og dæk med ost.|",
   "Gratinering|Gratinér under grill ved 225 °C, til osten bobler og er gylden.|5"])

recipe("Steak au poivre",
  "Bøf med cremet sauce af grønne peberkorn og cognac. Server med pommes frites eller kartofler.", 4, 35,
  ["Hovedretter", "Oksekød", "Fransk", "Panderet", "Weekendmad", "Gæster"],
  ["Bøf|Oksefilet|4|stk|bøffer à ca. 180 g", "Bøf|Peber|2|spsk|groft knust", "Bøf|Salt|||groft",
   "Bøf|Smør|1|spsk|", "Bøf|Olivenolie|1|spsk|",
   "Pebersauce|Skalotteløg|1|stk|finthakket", "Pebersauce|Cognac|3|spsk|kan udelades",
   "Pebersauce|Grønne peberkorn|2|spsk|", "Pebersauce|Oksebouillon|0.5|terning|",
   "Pebersauce|Vand|1|dl|", "Pebersauce|Fløde|2|dl|",
   "Tilbehør|Pommes frites (frost)|800|g|"],
  ["Tilbehør|Bag pommes frites i ovnen efter anvisningen.|25",
   "Bøf|Tryk den knuste peber fast på bøfferne og krydr med salt.|",
   "Bøf|Steg bøfferne i olie og smør på en meget varm pande, 2–3 minutter på hver side. Lad dem hvile på et fad.|6",
   "Pebersauce|Svits skalotteløg i panden. Hæld cognac ved og lad den koge ind (eller flambér den).|1",
   "Pebersauce|Tilsæt peberkorn, vand, bouillon og fløde, og kog saucen cremet. Hæld kødsaften fra fadet i og smag til.|5",
   "|Server bøfferne med sauce og pommes frites.|"])

recipe("Confit de canard",
  "Andelår saltes natten over og langtidsbages i andefedt. Server med kartofler stegt i andefedt med hvidløg og persille.", 4, 210,
  ["Hovedretter", "Fransk", "Ovnret", "Weekendmad", "Gæster"],
  ["Confit|Andelår|4|stk|", "Confit|Salt|2|spsk|groft", "Confit|Frisk timian|4|stilk|",
   "Confit|Hvidløg|4|fed|knuste", "Confit|Laurbærblade|2|stk|", "Confit|Peber|1|tsk|hele korn",
   "Confit|Andefedt|500|g|",
   "Kartofler|Kartofler|800|g|kogte, i skiver", "Kartofler|Hvidløg|2|fed|hakket",
   "Kartofler|Persille|||hakket", "Kartofler|Salt|||"],
  ["Confit|Gnid andelårene med salt, timian, hvidløg, laurbær og peber. Stil dem på køl natten over.|",
   "Confit|Skyl saltet af og dup lårene tørre. Læg dem tæt i et ovnfast fad, og hæld smeltet andefedt over, så de er dækket.|",
   "Confit|Bag ved 140 °C, til kødet er helt mørt og slipper benet.|180",
   "Confit|Tag lårene op og steg dem på en varm pande eller under grill med skindsiden opad, til skindet er sprødt.|8",
   "Kartofler|Steg kartoffelskiverne gyldne i et par spsk af andefedtet. Vend hvidløg og persille i til sidst og smag til med salt.|12",
   "|Server andelårene med kartoflerne. Gem resten af andefedtet i køleskabet til næste gang.|"])

# ======================================================================= Forretter
recipe("Lakserillettes",
  "Smørbar laksecreme af frisk og røget laks. Server med brød, toast eller rugbrød.", 6, 30,
  ["Forret", "Fisk", "Fransk"],
  ["|Laks|250|g|frisk, uden skind", "|Røget laks|100|g|i små stykker", "|Smør|50|g|blødt",
   "|Creme fraiche|1|dl|", "|Citron|0.5|stk|skal og saft", "|Dild|||hakket", "|Purløg|||hakket",
   "|Salt|||", "|Peber|||", "Servering|Flutes|1|stk|ristet"],
  ["|Pochér den friske laks i let saltet vand, til den netop er gennemkogt. Lad den køle helt af.|6",
   "|Rør smør og creme fraiche glat. Mos den kogte laks i med en gaffel, og vend røget laks, citron og krydderurter i.|",
   "|Smag til med salt og peber, kom i en skål og stil koldt mindst en time.|60",
   "Servering|Server med ristet brød.|"])

recipe("Tarte tatin med skalotteløg og balsamico",
  "Salt udgave af tarte tatin – karamelliserede skalotteløg under butterdej, vendt ud som en tærte. Kan også laves med rødløg og cherrytomater.", 6, 60,
  ["Forret", "Vegetar", "Fransk", "Ovnret"],
  ["|Skalotteløg|500|g|pillede, halveret på langs", "|Smør|30|g|", "|Brun farin|2|spsk|",
   "|Balsamicoeddike|3|spsk|", "|Frisk timian|4|stilk|", "|Salt|||", "|Peber|||",
   "|Butterdej|1|stk|plade, ca. 275 g",
   "Servering|Feta|100|g|eller gedeost, kan udelades", "Servering|Rucola|||"],
  ["|Smelt smør og farin i en ovnfast pande (ca. 24 cm). Læg skalotteløgene tæt med snitfladen nedad.|",
   "|Steg ved middel varme, til løgene er gyldne og bløde. Hæld balsamico over, drys timian, salt og peber på, og lad det koge lidt ind.|12",
   "|Læg butterdejen over løgene og stop kanterne ned langs panden. Prik et par huller i dejen.|",
   "|Bag ved 200 °C, til dejen er gylden og pustet op.|25",
   "|Lad tærten hvile et par minutter, læg en tallerken over panden og vend tærten ud. Top med smuldret ost og rucola.|"])

# ======================================================================= Desserter
recipe("Tarte tatin",
  "Omvendt æbletærte med karamel og butterdej. Brug en ovnfast pande på ca. 24 cm.", 6, 75,
  ["Dessert", "Fransk"],
  ["|Æble|6|stk|syrlige, skrællede og kvartede", "|Sukker|150|g|", "|Smør|75|g|",
   "|Vaniljepulver|1|tsk|", "|Butterdej|1|stk|plade, ca. 275 g",
   "Servering|Creme fraiche|||eller vaniljeis"],
  ["|Smelt sukkeret i en ovnfast pande, til det er en gylden karamel. Rør smør og vanilje i.|8",
   "|Læg æblerne tæt i karamellen med den runde side nedad, og lad dem koge, til de begynder at blive bløde.|12",
   "|Læg butterdejen over æblerne og stop kanterne ned. Prik et par huller.|",
   "|Bag ved 200 °C, til dejen er gylden.|30",
   "|Lad tærten hvile 5 minutter, vend den ud på et fad og server lun med creme fraiche eller is.|5"])

recipe("Tarte au citron",
  "Fransk citrontærte med sprød mørdejsbund. Til en tærteform på ca. 24 cm. Skal køle et par timer før servering.", 8, 120,
  ["Dessert", "Fransk", "Gæster"],
  ["Mørdej|Hvedemel|200|g|", "Mørdej|Smør|100|g|koldt", "Mørdej|Flormelis|50|g|",
   "Mørdej|Æg|1|stk|kun blommen", "Mørdej|Salt|1|knsp|", "Mørdej|Vand|1|spsk|koldt",
   "Citronfyld|Citron|3|stk|skal og saft", "Citronfyld|Æg|3|stk|", "Citronfyld|Sukker|150|g|",
   "Citronfyld|Fløde|1|dl|", "Servering|Flormelis|||til drys"],
  ["Mørdej|Smuldr mel, flormelis, salt og koldt smør sammen. Saml dejen med æggeblommen og vandet, og stil den på køl.|30",
   "Mørdej|Rul dejen ud og beklæd formen. Prik bunden, læg bagepapir og tørre bønner i, og blindbag ved 180 °C.|15",
   "Mørdej|Fjern papir og bønner og bag bunden færdig, til den er gylden.|8",
   "Citronfyld|Pisk æg, sukker, citronskal og -saft sammen, og rør fløden i. Hæld fyldet i bunden.|",
   "Citronfyld|Skru ned på 150 °C og bag, til fyldet har sat sig, men stadig dirrer let i midten.|25",
   "|Lad tærten køle helt af og stil den koldt. Drys med flormelis før servering.|120"])


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
