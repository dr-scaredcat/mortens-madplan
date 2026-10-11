"""Runde 3 (jeres egen ønskeliste): genererer SQL til nye opskrifter i Astons Køkken.

Kør:  python3 scripts/nye_opskrifter_2026-10c.py chunk <n>   -> SQL for opskrift-chunk n (7 pr. chunk)
      python3 scripts/nye_opskrifter_2026-10c.py names       -> alle ingrediensnavne og tags (til kontrol)
"""
import json, sys

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"

NEW_INGREDIENTS = {
    "Nelliker": "Krydderier & smagsgivere",
    "Rødkål (glas)": "Dåser & glas",
    "Hokkaidogræskar": "Frugt & grønt",
    "Græskarkerner": "Kolonial",
    "Hel and": "Kød & fisk",
    "Svesker": "Kolonial",
    "Andebryst": "Kød & fisk",
    "Appelsin": "Frugt & grønt",
    "Tun i vand": "Dåser & glas",
    "Husblas": "Kolonial",
}

R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))

MELBOLLER = ["Melboller|Smør|50|g|", "Melboller|Vand|1.25|dl|", "Melboller|Hvedemel|75|g|",
             "Melboller|Æg|2|stk|", "Melboller|Salt|0.5|tsk|"]
MELBOLLER_STEP = "Melboller|Kog vand og smør op, rør melet i, til dejen slipper gryden. Lad den køle lidt, og rør æggene i ét ad gangen.|"

# ======================================================================= Supper
recipe("Oksekødssuppe med kød- og melboller",
  "Klassisk dansk suppe. Kødet simrer i ca. 2½ time, så start i god tid. Suppekødet kan spises med peberrodssauce eller som pålæg.", 6, 180,
  ["Hovedretter", "Oksekød", "Suppe", "Dansk", "Børnevenlig"],
  ["Suppe|Oksebryst|1|kg|eller andet suppekød", "Suppe|Vand|3|l|", "Suppe|Løg|1|stk|halveret",
   "Suppe|Laurbærblade|2|stk|", "Suppe|Peber|1|tsk|hele korn", "Suppe|Salt|1|spsk|",
   "Suppe|Gulerod|4|stk|i skiver", "Suppe|Porre|2|stk|i skiver", "Suppe|Knoldselleri|0.25|stk|i tern",
   "Suppe|Persille|||",
   "Kødboller|Hakket gris og kalv|400|g|", "Kødboller|Løg|0.5|stk|fintrevet", "Kødboller|Æg|1|stk|",
   "Kødboller|Hvedemel|2|spsk|", "Kødboller|Mælk|0.5|dl|", "Kødboller|Salt|1|tsk|",
   *MELBOLLER],
  ["Suppe|Læg kødet i en stor gryde med koldt vand, løg, laurbær, peber og salt. Bring i kog, skum grundigt af, og lad det simre under låg, til kødet er mørt.|150",
   "Kødboller|Rør farsen sammen og lad den hvile koldt.|",
   MELBOLLER_STEP,
   "Suppe|Tag kødet op og si suppen. Kom grøntsagerne i og kog dem næsten møre.|8",
   "Kødboller|Sæt kød- og melboller i suppen med to teskeer, og lad dem simre, til de flyder op og er gennemkogte.|6",
   "Suppe|Smag suppen til, drys persille over og server. Skær kødet i skiver og server det ved siden af eller i suppen.|"])

recipe("Græskarsuppe",
  "Cremet suppe på hokkaido – skrællen kan blendes med. Top med ristede græskarkerner.", 4, 45,
  ["Hovedretter", "Vegetar", "Suppe"],
  ["|Hokkaidogræskar|1|kg|i tern, kerner fjernet", "|Olivenolie|2|spsk|", "|Løg|1|stk|hakket",
   "|Hvidløg|2|fed|", "|Ingefær|1|spsk|revet", "|Grøntsagsbouillon|2|terning|", "|Vand|8|dl|",
   "|Kokosmælk|1|dåse|", "|Lime|1|stk|", "|Salt|||", "|Peber|||",
   "Topping|Græskarkerner|3|spsk|", "Topping|Chiliflager|||", "Servering|Flutes|1|stk|"],
  ["|Svits løg, hvidløg og ingefær i olien, til løget er blødt.|5",
   "|Tilsæt græskar, vand og bouillon, og kog til græskarret er helt mørt.|20",
   "|Blend suppen glat, rør kokosmælken i og smag til med limesaft, salt og peber.|",
   "Topping|Rist græskarkernerne på en tør pande, til de popper. Server suppen med kerner, chili og brød.|3"])

recipe("Blomkålssuppe",
  "Cremet og mild suppe. Top med sprød bacon – eller undlad den for en vegetarversion.", 4, 40,
  ["Hovedretter", "Vegetar", "Suppe", "Dansk", "Børnevenlig"],
  ["|Blomkål|1|stk|stort, i buketter", "|Kartofler|300|g|i tern", "|Løg|1|stk|", "|Hvidløg|2|fed|",
   "|Smør|2|spsk|", "|Grøntsagsbouillon|2|terning|", "|Vand|1|l|", "|Fløde|1|dl|",
   "|Muskatnød|1|knsp|", "|Salt|||", "|Peber|||",
   "Topping|Bacon|100|g|kan udelades", "Topping|Purløg|||", "Servering|Flutes|1|stk|"],
  ["|Svits løg og hvidløg i smør, til det er blødt.|5",
   "|Tilsæt blomkål, kartofler, vand og bouillon, og kog til alt er mørt.|20",
   "|Blend suppen glat, rør fløden i og smag til med muskat, salt og peber.|",
   "Topping|Steg evt. bacon sprødt. Server suppen med bacon, purløg og brød.|"])

# ======================================================================= Hovedretter
recipe("Flæskesteg med sprød svær (Umuts metode)",
  "Efter Umut Sakaryas metode: stegen starter med sværen nedad i kogende vand, så sværen bliver blød og pufer op senere. Vandet i fadet bliver til sovs.", 6, 150,
  ["Hovedretter", "Svinekød", "Ovnret", "Dansk", "Weekendmad", "Gæster"],
  ["Steg|Flæskesteg|1.5|kg|nakke-, kam- eller ribbensteg", "Steg|Vand|1|l|kogende",
   "Steg|Salt|||groft, rigeligt", "Steg|Laurbærblade|5|stk|", "Steg|Peber|10|stk|hele korn",
   "Steg|Nelliker|5|stk|efter smag", "Steg|Frisk timian|2|stilk|",
   "Sovs|Fløde|1|dl|", "Sovs|Maizena|2|spsk|udrørt i lidt koldt vand", "Sovs|Ribsgelé|1|spsk|",
   "Sovs|Salt|||",
   "Tilbehør|Kartofler|1.5|kg|", "Tilbehør|Rødkål (glas)|1|glas|"],
  ["Steg|Læg stegen med sværen nedad i et ovnfast fad, og hæld kogende vand i, så det kun dækker sværen. Sæt i ovnen ved 200 °C varmluft.|20",
   "Steg|Vend stegen, så sværen vender opad, og skær sværen igennem ned til kødet – men ikke ind i kødet.|",
   "Steg|Gnid rigeligt salt på og ned mellem sværene. Læg evt. lidt sølvpapir under, så stegen ligger vandret. Kom laurbær, peber, nelliker og timian i vandet.|",
   "Steg|Steg videre ved 200 °C varmluft. Har du et stegetermometer, skal kernen være ca. 65 °C.|90",
   "Steg|Hvis sværen ikke er pufet op: skru op på max (eller grill) og giv den kort tid – hold øje, det går hurtigt.|5",
   "Steg|Lad stegen hvile 15–20 minutter uden at pakke den ind.|15",
   "Tilbehør|Kog kartoflerne og lun rødkålen.|20",
   "Sovs|Si vandet fra fadet over i en gryde, skum fedtet af, tilsæt fløde og kog op. Jævn med maizena og smag til med ribsgelé og salt.|",
   "|Skær stegen ud mellem sværene og server med sovs, kartofler og rødkål.|"])

recipe("Frisk pasta med kylling",
  "Hjemmelavet pasta i cremet citron-parmesansauce. Dejen kan rulles med pastamaskine eller kagerulle.", 4, 75,
  ["Hovedretter", "Kylling", "Pasta", "Italiensk"],
  ["Pastadej|Pizzamel (tipo 00)|300|g|", "Pastadej|Æg|3|stk|", "Pastadej|Salt|1|knsp|",
   "Sauce|Kyllingebryst|500|g|i strimler", "Sauce|Olivenolie|1|spsk|", "Sauce|Smør|1|spsk|",
   "Sauce|Hvidløg|2|fed|", "Sauce|Fløde|2.5|dl|", "Sauce|Citron|0.5|stk|skal og saft",
   "Sauce|Parmesan|60|g|revet", "Sauce|Spinat|75|g|frisk", "Sauce|Salt|||", "Sauce|Peber|||"],
  ["Pastadej|Lav en fordybning i melet, slå æggene ud i den og saml det til en dej. Ælt i ca. 8 minutter, til dejen er glat og elastisk.|8",
   "Pastadej|Pak dejen ind og lad den hvile.|30",
   "Pastadej|Rul dejen tyndt ud i pastamaskine eller med kagerulle, og skær den i tagliatelle. Drys med lidt mel.|",
   "Sauce|Steg kyllingen gylden i olie og smør. Tilsæt hvidløg det sidste minut.|8",
   "Sauce|Hæld fløden ved, kog lidt ind og rør citronskal, -saft og parmesan i. Smag til.|3",
   "|Kog pastaen i rigeligt saltet vand – frisk pasta tager kun et par minutter. Vend pasta og spinat i saucen med lidt pastavand.|3",
   "|Server med ekstra parmesan og peber.|"])

recipe("Millionbøf med fusilli",
  "Hverdagsklassiker – her i huset serveret med fusilli (pastaskruer).", 4, 35,
  ["Hovedretter", "Oksekød", "Dansk", "Hurtig", "Børnevenlig"],
  ["|Hakket oksekød|500|g|", "|Løg|1|stk|finthakket", "|Smør|1|spsk|", "|Hvedemel|1|spsk|",
   "|Paprika|1|tsk|", "|Tomatpuré|1|spsk|", "|Oksebouillon|1|terning|", "|Vand|4|dl|",
   "|Fløde|1|dl|", "|Salt|||", "|Peber|||",
   "Tilbehør|Pasta|400|g|fusilli (pastaskruer)"],
  ["|Brun kødet i smør i en gryde, og del det i små stykker. Tilsæt løget og svits med.|8",
   "|Drys mel og paprika over og rør tomatpuré i.|",
   "|Tilsæt vand og bouillon og lad det simre under låg.|15",
   "Tilbehør|Kog fusillien imens.|10",
   "|Rør fløden i, smag til med salt og peber og server med fusilli.|"])

recipe("Kylling i karry med ris",
  "Klassisk dansk hverdagsret, mild og børnevenlig.", 4, 40,
  ["Hovedretter", "Kylling", "Gryderet", "Dansk", "Børnevenlig"],
  ["|Kyllingebryst|600|g|i tern", "|Løg|1|stk|hakket", "|Æble|1|stk|i små tern",
   "|Smør|2|spsk|", "|Karry|2|spsk|", "|Hvedemel|2|spsk|", "|Hønsebouillon|1|terning|",
   "|Vand|4|dl|", "|Madlavningsfløde|2|dl|", "|Salt|||efter smag", "|Peber|||",
   "Tilbehør|Ris|300|g|"],
  ["|Sæt risene over efter anvisningen på pakken.|",
   "|Smelt smørret i en gryde og brun kyllingen let. Tag den op.|",
   "|Svits løg og æble i gryden, til løget er blankt. Drys karry over og rist et minut, så krydderiet folder sig ud.|",
   "|Rør melet i, og tilsæt vand og bouillon lidt ad gangen under omrøring.|",
   "|Kom kyllingen tilbage og lad det simre under låg.|15",
   "|Rør fløden i, varm igennem og smag til med salt og peber. Server med risene.|"])

recipe("Stegte koteletter med brun sovs",
  "Klassiske koteletter på panden med kartofler, ærter og brun sovs.", 4, 35,
  ["Hovedretter", "Svinekød", "Dansk", "Panderet", "Hurtig", "Børnevenlig"],
  ["|Svinekoteletter|4|stk|", "|Salt|||", "|Peber|||", "|Smør|2|spsk|",
   "Sovs|Vand|3|dl|", "Sovs|Oksebouillon|1|terning|", "Sovs|Fløde|1|dl|",
   "Sovs|Maizena|1|spsk|udrørt i lidt koldt vand", "Sovs|Ribsgelé|1|tsk|",
   "Tilbehør|Kartofler|1|kg|", "Tilbehør|Ærter (frost)|300|g|"],
  ["Tilbehør|Kog kartoflerne.|20",
   "|Klip fedtkanten på koteletterne et par steder, så de ikke krøller. Krydr med salt og peber.|",
   "|Steg koteletterne i smør ved god varme, 3–4 minutter på hver side, til de er gennemstegte. Tag dem op og hold dem lune.|8",
   "Sovs|Kom vand, bouillon og fløde på panden og kog op, så stegeskyen løsnes. Jævn med maizena og smag til med ribsgelé og salt.|",
   "Tilbehør|Kog ærterne kort og server det hele sammen.|3"])

recipe("Spinatruller med laks og flødeost",
  "Spinatroulade med røget laks. Skal køle mindst 1 time før servering. Server med rugbrød eller en salat.", 4, 90,
  ["Hovedretter", "Fisk", "Ovnret"],
  ["Roulade|Spinat (frost)|300|g|optøet og presset fri for vand", "Roulade|Æg|4|stk|",
   "Roulade|Hvedemel|2|spsk|", "Roulade|Salt|0.5|tsk|", "Roulade|Muskatnød|1|knsp|",
   "Fyld|Flødeost|200|g|", "Fyld|Røget laks|200|g|i skiver", "Fyld|Citron|0.5|stk|skal og saft",
   "Fyld|Dild|||hakket", "Fyld|Peber|||"],
  ["Roulade|Blend spinat, æg, mel, salt og muskat til en jævn masse.|",
   "Roulade|Smør massen ud på en bageplade med bagepapir (ca. 25×35 cm) og bag ved 200 °C, til den er fast.|10",
   "Roulade|Vend rouladen ud på et nyt stykke bagepapir, træk det gamle papir af og lad den køle.|",
   "Fyld|Rør flødeost med citron, dild og peber, og smør det ud over rouladen. Fordel laksen ovenpå.|",
   "Fyld|Rul rouladen stramt sammen fra den lange side, pak den ind og lad den køle.|60",
   "|Skær i skiver og server.|"])

recipe("Tærte med skinke og porre",
  "Tærtebunden er den samme som i jeres broccolitærte. Til en form på 18–20 cm – har du en form på 24 cm, så lav halvanden portion.", 3, 70,
  ["Hovedretter", "Svinekød", "Ovnret", "Dansk", "Børnevenlig"],
  ["Tærtedej|Hvedemel|1.5|dl|", "Tærtedej|Fuldkornsmel|1|dl|gerne fintsigtet", "Tærtedej|Smør|70|g|koldt",
   "Tærtedej|Salt|0.5|tsk|", "Tærtedej|Vand|4|spsk|måske lidt mere",
   "Fyld|Porre|2|stk|i tynde skiver", "Fyld|Smør|1|spsk|", "Fyld|Skinke|150|g|i tern",
   "Fyld|Æg|3|stk|", "Fyld|Fløde|1|dl|eller fed creme fraiche", "Fyld|Revet ost|75|g|",
   "Fyld|Muskatnød|1|knsp|", "Fyld|Salt|||", "Fyld|Peber|||"],
  ["Tærtedej|Kom mel og salt i en skål og smuldr det kolde smør i med fingrene (eller blend det i en minihakker).|",
   "Tærtedej|Saml dejen med lidt vand, til den hænger sammen uden at klistre. Stil den på køl.|30",
   "Fyld|Svits porren blød i smør, og lad den køle lidt.|5",
   "Fyld|Pisk æg, fløde, ost, muskat, salt og peber sammen.|",
   "Tærtedej|Tænd ovnen på 180 °C varmluft. Rul dejen ud mellem to stykker bagepapir til ca. 2 mm, læg den i formen med det ene stykke papir, og prik bunden med en gaffel.|",
   "Tærtedej|Forbag tærtebunden.|10",
   "Fyld|Fordel porre og skinke i bunden og hæld æggemassen over. Bag, til æggemassen har sat sig.|30",
   "|Lad tærten sætte sig et par minutter, før den skæres ud.|5"])

recipe("Andesteg med æbler og svesker",
  "Juleklassiker. Regn med ca. 1 time pr. kg ved 160 °C. Server med sukkerbrunede kartofler, rødkål og sovs.", 6, 240,
  ["Hovedretter", "Ovnret", "Dansk", "Weekendmad", "Gæster"],
  ["And|Hel and|3|kg|", "And|Æble|3|stk|i både", "And|Svesker|150|g|uden sten",
   "And|Frisk timian|3|stilk|", "And|Salt|||", "And|Peber|||",
   "And|Løg|1|stk|i både", "And|Gulerod|2|stk|i stykker", "And|Vand|1|l|",
   "Sovs|Fløde|2|dl|", "Sovs|Maizena|2|spsk|udrørt i lidt koldt vand", "Sovs|Ribsgelé|1|spsk|",
   "Sovs|Salt|||",
   "Sukkerbrunede kartofler|Kartofler|1|kg|små, kogte og pillede",
   "Sukkerbrunede kartofler|Sukker|1|dl|", "Sukkerbrunede kartofler|Smør|30|g|",
   "Tilbehør|Kartofler|1|kg|", "Tilbehør|Rødkål (glas)|1|glas|"],
  ["And|Tag anden ud af køleskabet en time før. Dup den tør, krydr indvendig og udvendig med salt og peber, og fyld den med æbler, svesker og timian.|",
   "And|Læg anden på en rist over en bradepande med løg, gulerod og vand. Steg ved 160 °C og øs/hæld lidt vand på undervejs, hvis bunden bliver tør.|180",
   "And|Skru op på 225 °C til sidst, så skindet bliver sprødt. Lad anden hvile, mens sovsen laves.|15",
   "Tilbehør|Kog kartoflerne og lun rødkålen.|20",
   "Sovs|Si skyen, skum fedtet af (gem andefedtet!), tilsæt fløde og kog op. Jævn med maizena og smag til med ribsgelé og salt.|",
   "Sukkerbrunede kartofler|Smelt sukkeret på en pande, til det er gyldent. Tilsæt smør og de kolde, kogte kartofler, og vend dem forsigtigt, til de er glaserede.|8",
   "|Skær anden ud og server med kartofler, sukkerbrunede kartofler, rødkål og sovs.|"])

recipe("Andebryst med appelsinsauce",
  "Sprødt skind og rosa kød. Start brysterne med skindsiden nedad på en kold pande, så fedtet smelter langsomt.", 4, 50,
  ["Hovedretter", "Panderet", "Fransk", "Weekendmad", "Gæster"],
  ["And|Andebryst|2|stk|à ca. 350 g", "And|Salt|||", "And|Peber|||",
   "Appelsinsauce|Appelsin|2|stk|saft og skal af den ene", "Appelsinsauce|Sukker|2|spsk|",
   "Appelsinsauce|Æbleeddike|1|spsk|", "Appelsinsauce|Hønsebouillon|0.5|terning|",
   "Appelsinsauce|Vand|2|dl|", "Appelsinsauce|Maizena|1|tsk|udrørt i lidt koldt vand",
   "Appelsinsauce|Smør|20|g|koldt",
   "Ovnkartofler|Kartofler|800|g|i tern", "Ovnkartofler|Olivenolie|2|spsk|",
   "Ovnkartofler|Rosmarin|2|stilk|", "Ovnkartofler|Salt|||"],
  ["Ovnkartofler|Vend kartoflerne i olie, rosmarin og salt, og bag dem ved 200 °C.|35",
   "And|Rids skindet i et fint mønster uden at skære ind i kødet, og krydr med salt og peber.|",
   "And|Læg brysterne med skindet nedad på en kold pande, og steg ved middel varme, til fedtet er smeltet og skindet sprødt. Hæld fedtet fra undervejs.|10",
   "And|Vend brysterne og steg 1–2 minutter. Læg dem i ovnen ved 180 °C, til kernen er ca. 55 °C.|7",
   "And|Lad brysterne hvile under folie.|8",
   "Appelsinsauce|Karamellisér sukkeret i en lille gryde, og hæld eddike, appelsinsaft, vand og bouillon ved. Kog ind til det halve, jævn med maizena, og pisk det kolde smør og appelsinskal i.|8",
   "|Skær brysterne i skiver og server med sauce og ovnkartofler.|"])

recipe("Tunmousse",
  "Til rugbrød, tarteletter eller som forret. Skal stå koldt i mindst 3 timer.", 6, 20,
  ["Tilbehør", "Fisk", "Dansk"],
  ["|Tun i vand|2|dåse|drænet", "|Husblas|4|stk|blade", "|Mayonnaise|1|dl|", "|Creme fraiche|1.5|dl|",
   "|Citron|0.5|stk|saften", "|Kapers|1|spsk|hakkede", "|Rødløg|0.25|stk|finthakket",
   "|Dild|||hakket", "|Salt|||", "|Peber|||"],
  ["|Læg husblassen i koldt vand.|5",
   "|Blend tun, mayonnaise, creme fraiche og citronsaft glat. Rør kapers, rødløg og dild i, og smag til med salt og peber.|",
   "|Smelt den udblødte husblas i 2 spsk varmt vand, og rør den hurtigt i tunmassen.|",
   "|Hæld moussen i en form og lad den stivne i køleskabet.|180"])


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
        n = int(sys.argv[2]); size = 7
        print(TEMPLATE.format(payload=payload(R[n * size:(n + 1) * size]), created_by=CREATED_BY))
