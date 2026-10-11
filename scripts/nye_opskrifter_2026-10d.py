"""Runde 4 (hverdagsmad): genererer SQL til nye opskrifter i Astons Køkken.

Kør:  python3 scripts/nye_opskrifter_2026-10d.py chunk <n>   -> SQL for opskrift-chunk n (8 pr. chunk)
      python3 scripts/nye_opskrifter_2026-10d.py names       -> alle ingrediensnavne og tags (til kontrol)
"""
import json, sys

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"

NEW_INGREDIENTS = {
    "Østerssauce": "Krydderier & smagsgivere",
    "Cashewnødder": "Kolonial",
    "Gnocchi": "Kolonial",
}

R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))


# ======================================================================= Kylling
recipe("Kyllingequesadillas",
  "Sprøde tortillas med kylling og smeltet ost. Brug gerne rester af kylling.", 4, 25,
  ["Hovedretter", "Kylling", "Mexicansk", "Panderet", "Hurtig", "Børnevenlig"],
  ["Fyld|Kyllingebryst|400|g|i små tern, eller rester", "Fyld|Olivenolie|1|spsk|", "Fyld|Tacokrydderi|1|spsk|",
   "Fyld|Majs (dåse)|1|dåse|", "Fyld|Peberfrugt|1|stk|i små tern", "Fyld|Forårsløg|2|stk|",
   "Fyld|Revet ost|200|g|", "Fyld|Tortillas|8|stk|",
   "Servering|Creme fraiche|2|dl|", "Servering|Salsa|1|glas|"],
  ["Fyld|Steg kyllingen gennem i olien og vend den i tacokrydderi. Bland med majs, peberfrugt og forårsløg.|8",
   "Fyld|Fordel ost og fyld på halvdelen af tortillaerne og læg en tortilla ovenpå.|",
   "Fyld|Steg quesadillaerne på en tør pande ved middel varme, til de er gyldne og osten smeltet, ca. 2 minutter på hver side.|4",
   "Servering|Skær dem i trekanter og server med creme fraiche og salsa.|"])

recipe("Stegte nudler med kylling og grøntsager",
  "Hurtig wokret, hvor du kan bruge de grøntsager, du har.", 4, 25,
  ["Hovedretter", "Kylling", "Asiatisk", "Wok", "Hurtig"],
  ["|Nudler|250|g|ægnudler", "|Kyllingebryst|400|g|i tynde strimler", "|Rapsolie|2|spsk|",
   "|Hvidløg|2|fed|", "|Ingefær|1|spsk|revet", "|Gulerod|2|stk|i tynde stave",
   "|Peberfrugt|1|stk|i strimler", "|Spidskål|200|g|i strimler", "|Forårsløg|3|stk|",
   "Sauce|Soya|4|spsk|", "Sauce|Østerssauce|2|spsk|", "Sauce|Sesamolie|1|tsk|", "Sauce|Sukker|1|tsk|",
   "Sauce|Sriracha|||efter smag"],
  ["|Kog nudlerne efter anvisningen, skyl dem i koldt vand og lad dem dryppe af.|4",
   "Sauce|Rør saucen sammen.|",
   "|Steg kyllingen ved høj varme i en wok. Tilsæt hvidløg, ingefær og grøntsager og steg et par minutter, så de stadig er sprøde.|8",
   "|Tilsæt nudler og sauce og vend det hele, til nudlerne er varme. Drys forårsløg over.|2"])

recipe("Kylling i wok med cashewnødder",
  "Klassisk kinesisk-inspireret wokret med sprøde cashewnødder.", 4, 25,
  ["Hovedretter", "Kylling", "Asiatisk", "Wok", "Hurtig"],
  ["Kylling|Kyllingebryst|600|g|i tern", "Kylling|Soya|1|spsk|", "Kylling|Maizena|1|spsk|",
   "Wok|Rapsolie|2|spsk|", "Wok|Cashewnødder|75|g|", "Wok|Løg|1|stk|i både",
   "Wok|Peberfrugt|1|stk|i tern", "Wok|Broccoli|1|stk|i små buketter", "Wok|Hvidløg|2|fed|",
   "Wok|Ingefær|1|spsk|revet",
   "Sauce|Soya|3|spsk|", "Sauce|Østerssauce|2|spsk|", "Sauce|Honning|1|spsk|", "Sauce|Vand|1|dl|",
   "Sauce|Maizena|1|tsk|", "Tilbehør|Jasminris|300|g|"],
  ["Tilbehør|Sæt risene over.|",
   "Kylling|Vend kyllingen i soya og maizena. Rør saucen sammen.|",
   "Wok|Rist cashewnødderne gyldne i lidt olie og tag dem op.|2",
   "Wok|Steg kyllingen ved høj varme, til den er gylden. Tilsæt løg, peberfrugt, broccoli, hvidløg og ingefær og steg et par minutter.|8",
   "Wok|Hæld saucen i og lad den tykne. Vend cashewnødderne i og server med ris.|"])

recipe("Kyllingeshawarma i pita",
  "Krydret kylling fra ovnen med hvidløgsdressing. Kyllingen kan marinere fra morgenen.", 4, 40,
  ["Hovedretter", "Kylling", "Mellemøstlig", "Ovnret"],
  ["Kylling|Kyllingelår|700|g|uden ben", "Kylling|Græsk yoghurt|1|dl|", "Kylling|Citron|1|stk|saften",
   "Kylling|Hvidløg|3|fed|presset", "Kylling|Spidskommen|2|tsk|", "Kylling|Paprika|2|tsk|",
   "Kylling|Koriander (stødt)|1|tsk|", "Kylling|Gurkemeje|0.5|tsk|", "Kylling|Kanel|0.25|tsk|",
   "Kylling|Salt|1|tsk|", "Kylling|Olivenolie|2|spsk|",
   "Hvidløgsdressing|Græsk yoghurt|2|dl|", "Hvidløgsdressing|Hvidløg|1|fed|presset",
   "Hvidløgsdressing|Citron|0.5|stk|saften", "Hvidløgsdressing|Salt|||",
   "Servering|Pitabrød|4|stk|", "Servering|Tomater|2|stk|", "Servering|Agurk|0.5|stk|",
   "Servering|Rødløg|1|stk|i tynde ringe", "Servering|Salat|||"],
  ["Kylling|Bland marinaden og vend kyllingen i. Lad den trække mindst 15 minutter.|15",
   "Kylling|Fordel kyllingen på en bageplade og bag ved 220 °C, til den er gennemstegt med sprøde kanter.|25",
   "Hvidløgsdressing|Rør dressingen sammen.|",
   "Servering|Skær kyllingen i strimler, lun pitabrødene og fyld dem med kylling, grøntsager og dressing.|"])

recipe("Pasta med kylling og broccoli i flødesauce",
  "Cremet og hurtig – en sikker hverdagsret.", 4, 25,
  ["Hovedretter", "Kylling", "Pasta", "Italiensk", "Hurtig", "Børnevenlig"],
  ["|Pasta|400|g|fx penne", "|Kyllingebryst|500|g|i strimler", "|Smør|1|spsk|", "|Broccoli|1|stk|i små buketter",
   "|Hvidløg|2|fed|", "|Fløde|2.5|dl|", "|Parmesan|50|g|revet", "|Citron|0.5|stk|revet skal",
   "|Salt|||", "|Peber|||"],
  ["|Kog pastaen. Kom broccolien i gryden de sidste 3 minutter.|10",
   "|Steg kyllingen gylden i smør. Tilsæt hvidløg det sidste minut.|8",
   "|Hæld fløden ved, kog op og rør parmesan og citronskal i. Smag til.|2",
   "|Vend pasta og broccoli i saucen med lidt pastavand og server med ekstra parmesan.|"])

recipe("Kyllingenudelsuppe med ingefær",
  "Let og hurtig asiatisk suppe.", 4, 30,
  ["Hovedretter", "Kylling", "Asiatisk", "Suppe", "Hurtig"],
  ["|Hønsebouillon|2|terning|", "|Vand|1.5|l|", "|Ingefær|2|spsk|i tynde skiver", "|Hvidløg|2|fed|",
   "|Kyllingebryst|400|g|i tynde skiver", "|Soya|3|spsk|", "|Fiskesauce|1|spsk|",
   "|Nudler|200|g|", "|Gulerod|1|stk|i tynde stave", "|Pak choi|2|stk|i kvarte",
   "Servering|Forårsløg|3|stk|", "Servering|Lime|1|stk|", "Servering|Koriander|||",
   "Servering|Chili|1|stk|i tynde skiver"],
  ["|Kog vand, bouillon, ingefær og hvidløg op og lad det trække lidt.|5",
   "|Kom kylling og gulerod i og lad det simre, til kyllingen er gennemkogt.|6",
   "|Tilsæt nudler og pak choi og kog, til nudlerne er møre. Smag til med soya og fiskesauce.|4",
   "Servering|Server med forårsløg, limebåde, koriander og chili.|"])

# ======================================================================= Oksekød
recipe("Oksekød og broccoli i wok",
  "Mørt oksekød i blank, sød-salt sauce. Skær kødet tyndt på tværs af fibrene.", 4, 25,
  ["Hovedretter", "Oksekød", "Asiatisk", "Wok", "Hurtig"],
  ["Kød|Oksefilet|500|g|eller inderlår, i tynde skiver", "Kød|Soya|1|spsk|", "Kød|Maizena|1|spsk|",
   "Wok|Rapsolie|2|spsk|", "Wok|Broccoli|1|stk|i små buketter", "Wok|Hvidløg|3|fed|", "Wok|Ingefær|1|spsk|revet",
   "Sauce|Soya|3|spsk|", "Sauce|Østerssauce|3|spsk|", "Sauce|Brun farin|1|spsk|", "Sauce|Vand|1|dl|",
   "Sauce|Maizena|1|tsk|", "Sauce|Sesamolie|1|tsk|",
   "Servering|Jasminris|300|g|", "Servering|Sesam|1|spsk|"],
  ["Servering|Sæt risene over.|",
   "Kød|Vend kødet i soya og maizena. Rør saucen sammen.|",
   "Wok|Steg broccolien et par minutter i lidt olie med en skvat vand, så den bliver sprødmør. Tag den op.|3",
   "Kød|Steg kødet hurtigt ved meget høj varme i små portioner. Tilsæt hvidløg og ingefær til sidst.|4",
   "Wok|Kom broccoli og sauce i, og lad det koge, til saucen er blank. Drys sesam over og server med ris.|2"])

recipe("Tacosuppe med hakket oksekød",
  "Mættende suppe med alt det bedste fra tacos. Server med tortillachips og ost.", 4, 35,
  ["Hovedretter", "Oksekød", "Suppe", "Mexicansk", "Børnevenlig"],
  ["|Hakket oksekød|500|g|", "|Løg|1|stk|", "|Hvidløg|2|fed|", "|Peberfrugt|1|stk|i tern",
   "|Tacokrydderi|3|spsk|", "|Hakkede tomater|1|dåse|", "|Kidneybønner|1|dåse|skyllet",
   "|Majs (dåse)|1|dåse|", "|Oksebouillon|1|terning|", "|Vand|8|dl|", "|Flødeost|100|g|",
   "Servering|Tortillachips|150|g|", "Servering|Revet ost|100|g|", "Servering|Creme fraiche|1|dl|",
   "Servering|Koriander|||"],
  ["|Brun kødet med løg og hvidløg i en gryde. Tilsæt peberfrugt og tacokrydderi.|8",
   "|Tilsæt tomater, bønner, majs, vand og bouillon, og lad suppen simre.|15",
   "|Rør flødeosten i, til den er smeltet, og smag til.|",
   "Servering|Server med tortillachips, revet ost, creme fraiche og koriander.|"])

# ======================================================================= Svinekød
recipe("Æggekage med bacon og purløg",
  "Dansk klassiker på panden – server på rugbrød med sennep.", 4, 25,
  ["Hovedretter", "Svinekød", "Dansk", "Panderet", "Hurtig"],
  ["|Bacon|200|g|i skiver", "|Æg|8|stk|", "|Mælk|1|dl|", "|Hvedemel|1|spsk|", "|Salt|0.5|tsk|",
   "|Peber|||", "|Tomater|3|stk|i både", "|Purløg|1|bundt|",
   "Servering|Rugbrød|8|skive|", "Servering|Sennep|||stærk"],
  ["|Steg bacon sprødt på en stor pande. Tag det op og hæld det meste af fedtet fra.|6",
   "|Pisk æg, mælk, mel, salt og peber sammen og hæld det på panden.|",
   "|Lad æggekagen stivne ved lav varme under låg, og træk forsigtigt i den med en spatel, så den sætter sig jævnt.|10",
   "|Læg bacon og tomatbåde på toppen og drys rigeligt purløg over. Server med rugbrød og sennep.|"])

recipe("Stegt ris med skinke og æg",
  "Perfekt til rester – brug kolde, kogte ris fra dagen før, så de ikke klistrer.", 4, 20,
  ["Hovedretter", "Svinekød", "Asiatisk", "Wok", "Hurtig", "Børnevenlig"],
  ["|Ris|300|g|kogt og afkølet, gerne dagen før", "|Rapsolie|2|spsk|", "|Æg|3|stk|",
   "|Skinke|200|g|i tern", "|Ærter (frost)|150|g|", "|Gulerod|1|stk|i små tern",
   "|Forårsløg|3|stk|", "|Hvidløg|2|fed|", "|Soya|3|spsk|", "|Sesamolie|1|tsk|", "|Sriracha|||efter smag"],
  ["|Pisk æggene og steg dem som røræg i lidt olie i en wok. Tag dem op.|2",
   "|Steg gulerod, hvidløg og skinke ved høj varme et par minutter.|3",
   "|Tilsæt risene og steg dem, til de er varme og let sprøde. Vend ærter, soya og sesamolie i.|5",
   "|Vend æggene og forårsløg i og server med sriracha.|"])

# ======================================================================= Fisk
recipe("Laksepasta med citron og spinat",
  "Hurtig og frisk pasta med laks.", 4, 20,
  ["Hovedretter", "Fisk", "Pasta", "Italiensk", "Hurtig"],
  ["|Pasta|400|g|", "|Laks|400|g|uden skind, i tern", "|Olivenolie|1|spsk|", "|Hvidløg|2|fed|",
   "|Madlavningsfløde|2|dl|", "|Citron|1|stk|skal og saft", "|Spinat|100|g|frisk",
   "|Parmesan|40|g|revet", "|Dild|||", "|Salt|||", "|Peber|||"],
  ["|Kog pastaen.|10",
   "|Svits hvidløg kort i olien, tilsæt fløde, citronskal og -saft, og kog op.|2",
   "|Kom laksen i saucen og lad den simre forsigtigt, til den netop er gennemstegt.|4",
   "|Vend pasta, spinat og parmesan i, og smag til. Drys dild over.|"])

recipe("Laks i fad med pesto og cherrytomater",
  "Nem ovnret – laksen bliver saftig under pestoen.", 4, 30,
  ["Hovedretter", "Fisk", "Ovnret", "Italiensk", "Hurtig"],
  ["|Laks|600|g|i 4 stykker", "|Pesto|4|spsk|", "|Cherrytomater|250|g|", "|Citron|1|stk|",
   "|Olivenolie|1|spsk|", "|Salt|||", "|Peber|||", "Tilbehør|Kartofler|800|g|små"],
  ["Tilbehør|Kog kartoflerne.|20",
   "|Læg laksen i et ovnfast fad, smør pesto på, og fordel tomaterne rundt om. Dryp med olie, salt og peber.|",
   "|Bag ved 200 °C, til laksen netop er gennemstegt.|15",
   "|Pres citron over og server med kartoflerne.|"])

# ======================================================================= Vegetar
recipe("Gnocchi i fad med tomat og mozzarella",
  "Nem ovnret med boblende ost på toppen.", 4, 30,
  ["Hovedretter", "Vegetar", "Italiensk", "Ovnret", "Børnevenlig"],
  ["|Gnocchi|800|g|", "|Olivenolie|1|spsk|", "|Løg|1|stk|finthakket", "|Hvidløg|2|fed|",
   "|Hakkede tomater|2|dåse|", "|Oregano|1|tsk|", "|Sukker|1|tsk|", "|Salt|||",
   "|Mozzarella|250|g|", "|Parmesan|30|g|", "|Basilikum|||"],
  ["|Svits løg og hvidløg i olien, tilsæt tomater, oregano, sukker og salt, og lad saucen simre.|10",
   "|Vend de ukogte gnocchi i saucen og hæld det i et ovnfast fad. Riv mozzarella over og drys parmesan på.|",
   "|Bag ved 200 °C, til osten bobler og gnocchien er mør.|15",
   "|Drys basilikum over.|"])

recipe("Pandestegte gnocchi med tomatsauce",
  "Sprøde gnocchi fra panden i en hurtig tomatsauce.", 4, 25,
  ["Hovedretter", "Vegetar", "Italiensk", "Panderet", "Hurtig", "Børnevenlig"],
  ["|Gnocchi|800|g|", "|Olivenolie|2|spsk|", "|Smør|1|spsk|",
   "Tomatsauce|Hvidløg|2|fed|", "Tomatsauce|Cherrytomater|250|g|halveret",
   "Tomatsauce|Hakkede tomater|1|dåse|", "Tomatsauce|Chiliflager|||efter smag",
   "Tomatsauce|Sukker|1|tsk|", "Tomatsauce|Salt|||", "Tomatsauce|Basilikum|||",
   "Servering|Parmesan|40|g|"],
  ["|Steg gnocchien i olie og smør på en stor pande ved god varme, til de er gyldne og sprøde. Rør ikke for tit. Tag dem op.|8",
   "Tomatsauce|Svits hvidløg og cherrytomater på panden, til tomaterne falder sammen. Tilsæt hakkede tomater, chili, sukker og salt, og lad det simre.|8",
   "|Vend gnocchien i saucen og server med parmesan og basilikum.|"])

recipe("Linsebolognese",
  "Bolognese uden kød – røde linser giver fylde og koger ud i saucen.", 4, 35,
  ["Hovedretter", "Vegetar", "Pasta", "Italiensk", "Børnevenlig"],
  ["Sovs|Røde linser|200|g|skyllet", "Sovs|Olivenolie|2|spsk|", "Sovs|Løg|1|stk|finthakket",
   "Sovs|Gulerod|2|stk|fintrevet", "Sovs|Bladselleri|1|stilk|finthakket", "Sovs|Hvidløg|2|fed|",
   "Sovs|Tomatpuré|2|spsk|", "Sovs|Rødvin|1|dl|kan udelades", "Sovs|Hakkede tomater|2|dåse|",
   "Sovs|Grøntsagsbouillon|1|terning|", "Sovs|Vand|4|dl|", "Sovs|Oregano|1|tsk|",
   "Sovs|Salt|||", "Sovs|Peber|||",
   "Servering|Spaghetti|400|g|", "Servering|Parmesan|40|g|"],
  ["Sovs|Svits løg, gulerod, selleri og hvidløg i olien, til det er blødt.|5",
   "Sovs|Rør tomatpuré i, hæld rødvinen ved og lad den koge ind.|",
   "Sovs|Tilsæt linser, tomater, vand, bouillon og oregano, og lad det simre, til linserne er møre. Rør af og til.|20",
   "Servering|Kog spaghettien. Smag sovsen til og server med parmesan.|10"])


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
