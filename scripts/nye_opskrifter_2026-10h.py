"""Runde 7 (Italien og Spanien): genererer SQL til nye opskrifter i Astons Køkken.

Kør:  python3 scripts/nye_opskrifter_2026-10h.py chunk <n>   -> SQL for opskrift-chunk n (8 pr. chunk)
      python3 scripts/nye_opskrifter_2026-10h.py names       -> alle ingrediensnavne og tags (til kontrol)
"""
import json, sys

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"

NEW_INGREDIENTS = {
    "Pecorino": "Mejeri & æg",
    "Parmaskinke": "Pålæg",
    "Salvie": "Frugt & grønt",
    "Kalveskank": "Kød & fisk",
    "Polenta": "Kolonial",
    "Hvide bønner": "Dåser & glas",
    "Padrón-peberfrugter": "Frugt & grønt",
}

R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))

# ======================================================================= Italien
recipe("Spaghetti aglio, olio e peperoncino",
  "Italiens hurtigste pastaret – hvidløg, olivenolie og chili. Pas på, hvidløget ikke bliver brunt.", 4, 15,
  ["Hovedretter", "Vegetar", "Pasta", "Italiensk", "Hurtig"],
  ["|Spaghetti|400|g|", "|Olivenolie|1|dl|god kvalitet", "|Hvidløg|6|fed|i tynde skiver",
   "|Chiliflager|1|tsk|eller 1 frisk chili", "|Persille|1|bundt|hakket", "|Salt|||",
   "Servering|Parmesan|40|g|kan udelades"],
  ["|Kog spaghettien i godt saltet vand. Gem en kop pastavand.|9",
   "|Varm olien op med hvidløg og chili ved lav varme, til hvidløget er lysegyldent.|4",
   "|Vend pastaen i olien med persille og lidt pastavand, til den er blank. Server evt. med parmesan.|"])

recipe("Cacio e pepe",
  "Romersk pasta med kun ost, peber og pastavand. Hemmeligheden er at røre osten i ved lav varme, så den ikke klumper.", 4, 15,
  ["Hovedretter", "Vegetar", "Pasta", "Italiensk", "Hurtig"],
  ["|Spaghetti|400|g|eller tonnarelli", "|Pecorino|120|g|fintrevet (eller halvt parmesan)",
   "|Peber|2|tsk|groftkværnet", "|Smør|20|g|", "|Salt|||lidt til pastavandet"],
  ["|Kog pastaen i let saltet vand. Gem 2 kopper pastavand.|9",
   "|Rist peberen kort i smørret på en stor pande, og tilsæt en skvat pastavand.|1",
   "|Rør osten ud med lidt lunkent pastavand til en tyk pasta.|",
   "|Vend pastaen i panden, tag den af varmen, og rør ostepastaen i med pastavand, til saucen er cremet. Server straks.|"])

recipe("Saltimbocca alla romana",
  "Tynde kalveschnitzler med parmaskinke og salvie, stegt hurtigt i smør med en hvidvinssauce.", 4, 25,
  ["Hovedretter", "Oksekød", "Italiensk", "Panderet", "Hurtig"],
  ["|Kalveschnitzel|8|stk|tynde, ca. 500 g i alt", "|Parmaskinke|8|skive|", "|Salvie|8|stk|blade",
   "|Hvedemel|2|spsk|", "|Smør|2|spsk|", "|Olivenolie|1|spsk|", "|Hvidvin|1|dl|",
   "|Smør|20|g|koldt, til saucen", "|Salt|||", "|Peber|||",
   "Tilbehør|Kartofler|800|g|"],
  ["Tilbehør|Kog kartoflerne.|20",
   "|Bank kødet tyndt, læg en skive skinke og et salvieblad på hvert stykke og fastgør med en tandstik. Drys med lidt mel og peber.|",
   "|Steg stykkerne i smør og olie på en varm pande, først med skinkesiden nedad, ca. 1–2 minutter på hver side. Tag dem op.|4",
   "|Hæld hvidvinen på panden, kog den lidt ind og pisk det kolde smør i. Smag til og hæld saucen over kødet.|2"])

recipe("Cotoletta alla milanese",
  "Paneret kalv fra Milano, stegt sprød i smør. Kan også laves med kyllingebryst.", 4, 30,
  ["Hovedretter", "Oksekød", "Italiensk", "Panderet"],
  ["|Kalveschnitzel|4|stk|eller kyllingebryst, banket tynde", "|Hvedemel|3|spsk|", "|Æg|2|stk|",
   "|Rasp|1.5|dl|", "|Parmesan|30|g|fintrevet", "|Smør|50|g|", "|Olivenolie|2|spsk|",
   "|Salt|||", "|Citron|1|stk|i både",
   "Tilbehør|Rucola|100|g|", "Tilbehør|Cherrytomater|200|g|halveret", "Tilbehør|Olivenolie|1|spsk|"],
  ["|Bland rasp og parmesan. Vend kødet i mel, derefter sammenpisket æg og til sidst rasp.|",
   "|Steg kødet i smør og olie ved middel varme, til paneringen er gylden og sprød, ca. 3 minutter på hver side.|6",
   "|Drys med salt og server med citronbåde og en salat af rucola, tomater og olivenolie.|"])

recipe("Minestrone",
  "Italiensk grøntsagssuppe med bønner og pasta. Brug de grøntsager, I har, og top med pesto eller parmesan.", 6, 50,
  ["Hovedretter", "Vegetar", "Suppe", "Italiensk"],
  ["|Olivenolie|2|spsk|", "|Løg|1|stk|i tern", "|Gulerod|2|stk|i tern", "|Bladselleri|2|stilk|i tern",
   "|Hvidløg|2|fed|", "|Squash|1|stk|i tern", "|Kartofler|2|stk|i tern", "|Hakkede tomater|1|dåse|",
   "|Grøntsagsbouillon|2|terning|", "|Vand|1.5|l|", "|Hvide bønner|1|dåse|skyllet",
   "|Pasta|100|g|små, fx ditalini", "|Spinat|50|g|frisk", "|Salt|||", "|Peber|||",
   "Servering|Parmesan|||revet", "Servering|Pesto|||kan udelades"],
  ["|Svits løg, gulerod, selleri og hvidløg i olien, til de er bløde.|8",
   "|Tilsæt squash, kartofler, tomater, vand og bouillon, og lad suppen simre.|15",
   "|Kom bønner og pasta i og kog, til pastaen er mør. Rør spinaten i til sidst.|10",
   "Servering|Smag til og server med parmesan og en klat pesto.|"])

recipe("Osso buco med gremolata",
  "Langtidsbraiseret kalveskank fra Milano. Gremolataen af citron, persille og hvidløg drysses over til sidst.", 4, 150,
  ["Hovedretter", "Oksekød", "Italiensk", "Gryderet", "Weekendmad", "Gæster"],
  ["Osso buco|Kalveskank|4|skive|ca. 3–4 cm tykke", "Osso buco|Hvedemel|2|spsk|", "Osso buco|Olivenolie|2|spsk|",
   "Osso buco|Smør|1|spsk|", "Osso buco|Løg|1|stk|i tern", "Osso buco|Gulerod|1|stk|i tern",
   "Osso buco|Bladselleri|1|stilk|i tern", "Osso buco|Hvidløg|2|fed|", "Osso buco|Hvidvin|2|dl|",
   "Osso buco|Hakkede tomater|1|dåse|", "Osso buco|Oksebouillon|1|terning|", "Osso buco|Vand|3|dl|",
   "Osso buco|Laurbærblade|2|stk|", "Osso buco|Frisk timian|3|stilk|", "Osso buco|Salt|||", "Osso buco|Peber|||",
   "Gremolata|Citron|1|stk|fintrevet skal", "Gremolata|Persille|0.5|bundt|finthakket", "Gremolata|Hvidløg|1|fed|finthakket",
   "Polenta|Polenta|250|g|", "Polenta|Vand|1|l|", "Polenta|Smør|30|g|", "Polenta|Parmesan|40|g|", "Polenta|Salt|1|tsk|"],
  ["Osso buco|Klip hinden rundt om skankene et par steder, så de ikke krøller. Krydr, vend i mel og brun dem i olie og smør. Tag dem op.|8",
   "Osso buco|Svits løg, gulerod, selleri og hvidløg i gryden. Hæld hvidvinen ved og kog lidt ind.|5",
   "Osso buco|Tilsæt tomater, vand, bouillon og krydderurter, læg skankene tilbage, og lad det simre under låg, til kødet er helt mørt.|120",
   "Gremolata|Bland citronskal, persille og hvidløg.|",
   "Polenta|Kog vand og salt op, pisk polentaen i og kog under omrøring. Rør smør og parmesan i.|10",
   "|Server skankene på polenta med sauce, og drys gremolata over.|"])

recipe("Porchetta",
  "Italiensk rullesteg af svinebryst med fennikel, hvidløg og krydderurter – og sprød svær. Sværen skal gerne tørre i køleskabet natten over.", 8, 240,
  ["Hovedretter", "Svinekød", "Italiensk", "Ovnret", "Weekendmad", "Gæster"],
  ["|Svinebryst|2|kg|med svær, uden ben", "|Fennikelfrø|2|spsk|ristede og knuste", "|Hvidløg|6|fed|hakket",
   "|Rosmarin|3|stilk|hakket", "|Salvie|8|stk|blade, hakkede", "|Citron|1|stk|revet skal",
   "|Chiliflager|0.5|tsk|", "|Salt|||groft, rigeligt", "|Peber|||", "|Olivenolie|2|spsk|",
   "Tilbehør|Kartofler|1.5|kg|små"],
  ["|Rids sværen fint. Vend stykket, rids kødsiden let og gnid den med fennikel, hvidløg, krydderurter, citronskal, chili, salt og peber.|",
   "|Rul stegen stramt sammen med sværen udad og bind den med snor. Gnid sværen med salt og lad den tørre i køleskabet uden låg, gerne natten over.|",
   "|Steg ved 160 °C på en rist over en bradepande, til kernen er ca. 70 °C.|150",
   "|Skru op på 230 °C og steg videre, til sværen pufer og er sprød. Læg kartoflerne i bradepanden de sidste 45 minutter.|25",
   "|Lad stegen hvile, skær den i skiver og server med kartoflerne.|15"])

# ======================================================================= Spanien
recipe("Albóndigas i tomatsauce",
  "Spanske kødboller med røget paprika i tomatsauce. Server med brød, ris eller kartofler – eller som tapas.", 4, 45,
  ["Hovedretter", "Svinekød", "Spansk", "Gryderet", "Børnevenlig"],
  ["Kødboller|Hakket gris og kalv|500|g|", "Kødboller|Løg|0.5|stk|fintrevet", "Kødboller|Hvidløg|2|fed|presset",
   "Kødboller|Rasp|0.5|dl|", "Kødboller|Mælk|0.5|dl|", "Kødboller|Æg|1|stk|",
   "Kødboller|Røget paprika|1|tsk|", "Kødboller|Spidskommen|0.5|tsk|", "Kødboller|Persille|||hakket",
   "Kødboller|Salt|1|tsk|", "Kødboller|Olivenolie|2|spsk|",
   "Sauce|Løg|1|stk|finthakket", "Sauce|Hvidløg|2|fed|", "Sauce|Røget paprika|1|tsk|",
   "Sauce|Hvidvin|1|dl|", "Sauce|Hakkede tomater|2|dåse|", "Sauce|Sukker|1|tsk|", "Sauce|Salt|||",
   "Servering|Flutes|1|stk|"],
  ["Kødboller|Rør farsen sammen og form ca. 20 boller.|",
   "Kødboller|Brun kødbollerne i olien og tag dem op.|8",
   "Sauce|Svits løg og hvidløg i gryden, rør paprika i og hæld hvidvinen ved. Tilsæt tomater og sukker.|5",
   "Sauce|Kom kødbollerne i saucen og lad dem simre under låg.|20",
   "Servering|Smag til, drys persille over og server med brød.|"])

recipe("Pollo al ajillo",
  "Spansk kylling i hvidløg og hvidvin – masser af hvidløg, der bliver blødt og sødt.", 4, 45,
  ["Hovedretter", "Kylling", "Spansk", "Panderet"],
  ["|Kyllingelår|1.2|kg|med ben, i stykker", "|Salt|||", "|Peber|||", "|Olivenolie|1|dl|",
   "|Hvidløg|10|fed|hele, let knuste", "|Hvidvin|2|dl|", "|Laurbærblade|2|stk|", "|Frisk timian|3|stilk|",
   "|Persille|||hakket", "Tilbehør|Kartofler|800|g|eller brød"],
  ["Tilbehør|Kog kartoflerne.|20",
   "|Krydr kyllingen og brun den godt i olien i en stor pande eller gryde. Tilsæt hvidløget, når kyllingen vendes.|12",
   "|Hæld hvidvinen ved, tilsæt laurbær og timian, og lad det simre under låg, til kyllingen er gennemstegt.|20",
   "|Skru op og kog saucen lidt ind. Drys persille over og server med kartofler eller brød.|3"])

recipe("Pinchos morunos",
  "Krydrede svinekødsspyd med røget paprika og spidskommen – fra grill eller pande. Kødet skal marinere mindst 2 timer.", 4, 30,
  ["Hovedretter", "Svinekød", "Spansk"],
  ["|Svinemørbrad|600|g|i tern", "|Olivenolie|3|spsk|", "|Hvidløg|2|fed|presset", "|Røget paprika|2|tsk|",
   "|Spidskommen|2|tsk|", "|Koriander (stødt)|1|tsk|", "|Oregano|1|tsk|", "|Citron|0.5|stk|saften",
   "|Salt|1|tsk|", "Servering|Flutes|1|stk|", "Servering|Citron|0.5|stk|i både", "Servering|Persille|||"],
  ["|Bland olie, hvidløg, krydderier, citron og salt, vend kødet i og lad det marinere i køleskabet.|120",
   "|Træk kødet på spyd og grill eller steg dem på en meget varm pande, til de er gennemstegte.|10",
   "Servering|Server med citronbåde, persille og brød.|"])

recipe("Patatas bravas",
  "Sprøde kartofler med krydret tomatsauce og aioli. Spansk tapas – og godt tilbehør til kød.", 4, 45,
  ["Tilbehør", "Vegetar", "Spansk"],
  ["Kartofler|Kartofler|800|g|i tern", "Kartofler|Olivenolie|3|spsk|", "Kartofler|Salt|||",
   "Bravasauce|Olivenolie|1|spsk|", "Bravasauce|Løg|0.5|stk|finthakket", "Bravasauce|Hvidløg|1|fed|",
   "Bravasauce|Røget paprika|2|tsk|", "Bravasauce|Cayennepeber|0.25|tsk|", "Bravasauce|Passata|2|dl|",
   "Bravasauce|Sukker|1|knsp|", "Bravasauce|Salt|||",
   "Aioli|Mayonnaise|1|dl|", "Aioli|Hvidløg|1|fed|presset", "Aioli|Citron|0.5|stk|saften"],
  ["Kartofler|Vend kartoflerne i olie og salt og bag dem ved 220 °C, til de er sprøde. Vend dem halvvejs.|35",
   "Bravasauce|Svits løg og hvidløg i olien, rør paprika og cayenne i, og tilsæt passata og sukker. Lad det simre og blend evt. glat.|10",
   "Aioli|Rør mayonnaise med hvidløg og citron.|",
   "|Server kartoflerne med bravasauce og aioli.|"])

recipe("Chorizo i rødvin",
  "Klassisk tapas – chorizo simret i rødvin. Server med brød til at dyppe.", 4, 15,
  ["Forret", "Svinekød", "Spansk", "Hurtig"],
  ["|Chorizo|250|g|i tykke skiver", "|Olivenolie|1|spsk|", "|Rødvin|2|dl|", "|Laurbærblade|1|stk|",
   "|Honning|1|tsk|", "|Persille|||", "Servering|Flutes|1|stk|"],
  ["|Steg chorizoen i lidt olie, til den slipper fedtet og får farve.|3",
   "|Hæld rødvinen ved, tilsæt laurbær og honning, og lad det simre, til vinen er kogt ind til en tyk sauce.|8",
   "|Drys persille over og server i et lerfad med brød.|"])

recipe("Pimientos de Padrón",
  "Små grønne peberfrugter stegt i olivenolie med flagesalt. De fleste er milde – en gang imellem er der en stærk!", 4, 10,
  ["Forret", "Vegetar", "Spansk", "Hurtig"],
  ["|Padrón-peberfrugter|250|g|", "|Olivenolie|2|spsk|", "|Salt|||flagesalt"],
  ["|Steg peberfrugterne i olien på en meget varm pande, til skindet slår blærer og bliver let sværtet.|4",
   "|Drys rigeligt flagesalt over og server straks.|"])

recipe("Gazpacho",
  "Kold spansk tomatsuppe – brug meget modne tomater. Skal stå koldt mindst et par timer.", 4, 20,
  ["Forret", "Vegetar", "Suppe", "Spansk"],
  ["|Tomater|1|kg|meget modne", "|Agurk|0.5|stk|", "|Peberfrugt|1|stk|rød", "|Hvidløg|1|fed|",
   "|Franskbrød|1|skive|uden skorpe", "|Olivenolie|1|dl|", "|Hvidvinseddike|2|spsk|gerne sherryeddike",
   "|Salt|1|tsk|", "|Vand|1|dl|koldt, efter behov",
   "Topping|Agurk|||i små tern", "Topping|Peberfrugt|||i små tern", "Topping|Olivenolie|||"],
  ["|Skær grøntsagerne groft og blend dem med brød, hvidløg, eddike og salt.|",
   "|Blend olien i i en tynd stråle, og spæd med koldt vand til den ønskede konsistens. Smag til.|",
   "|Stil suppen koldt.|120",
   "Topping|Server iskold med små tern af agurk og peberfrugt og en stribe olivenolie.|"])

recipe("Crema catalana",
  "Spansk vaniljecreme med citron og kanel under sprød karamel. Skal køle et par timer.", 6, 30,
  ["Dessert", "Spansk"],
  ["|Mælk|5|dl|", "|Citron|1|stk|skal i strimler", "|Kanel|0.5|tsk|eller 1 kanelstang",
   "|Æg|4|stk|kun blommerne", "|Sukker|100|g|", "|Maizena|2|spsk|", "|Rørsukker|6|spsk|til karamel"],
  ["|Varm mælken op med citronskal og kanel, og lad den trække et kvarter. Si den.|15",
   "|Pisk æggeblommer, sukker og maizena sammen, og pisk den varme mælk i.|",
   "|Hæld det tilbage i gryden og varm op under konstant piskning, til cremen tykner. Den må ikke koge.|5",
   "|Fordel i lave skåle og stil koldt.|120",
   "|Drys rørsukker over og brænd det til karamel med en gasbrænder lige før servering.|"])

recipe("Tarta de Santiago",
  "Saftig mandelkage fra Galicien – uden mel. Til en springform på 24 cm.", 10, 55,
  ["Dessert", "Spansk"],
  ["|Mandler|250|g|malede", "|Sukker|250|g|", "|Æg|5|stk|", "|Citron|1|stk|revet skal",
   "|Kanel|0.5|tsk|", "|Smør|||til formen", "|Flormelis|||til pynt"],
  ["|Pisk æg og sukker luftigt. Vend mandler, citronskal og kanel i.|",
   "|Hæld dejen i en smurt springform og bag ved 180 °C, til kagen er gylden og fast.|35",
   "|Lad kagen køle af. Læg evt. en skabelon af et kors på, og drys med flormelis.|"])

recipe("Baskisk cheesecake (San Sebastián)",
  "Bagt cheesecake med mørk, karamelliseret top og cremet midte – uden bund. Skal køle helt af, gerne natten over.", 10, 90,
  ["Dessert", "Spansk", "Gæster"],
  ["|Flødeost|900|g|naturel, stuetemperatur", "|Sukker|250|g|", "|Æg|5|stk|", "|Fløde|4|dl|",
   "|Hvedemel|2|spsk|", "|Salt|1|knsp|"],
  ["|Beklæd en springform (22–24 cm) med to lag krøllet bagepapir, så papiret stikker godt op over kanten.|",
   "|Rør flødeost og sukker glat. Tilsæt æggene ét ad gangen, og rør fløde, mel og salt i til en glat masse.|",
   "|Hæld massen i formen og bag ved 220 °C, til toppen er meget mørk, men midten stadig dirrer.|55",
   "|Lad kagen køle helt af i formen, og stil den derefter koldt mindst 4 timer.|240"])


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
