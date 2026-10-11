"""Genererer SQL til at lægge 24 nye opskrifter ind i Astons Køkken.

Kør:  python3 scripts/nye_opskrifter_2026-10.py > scripts/nye_opskrifter_2026-10.sql
Ingrediens-linjer:  "Sektion|Navn|mængde|enhed|note"  (tomme felter = null)
Trin-linjer:        "Sektion|Tekst|timer-minutter"
"""

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"

# Nye ingredienser, som ikke findes i forvejen -> indkøbskategori
NEW_INGREDIENTS = {
    "Cheddar": "Mejeri & æg",
    "Flæsk i skiver": "Kød & fisk",
    "Svinenakke": "Kød & fisk",
    "Ribeye": "Kød & fisk",
    "Pak choi": "Frugt & grønt",
    "Estragon": "Frugt & grønt",
    "Ribsgelé": "Kolonial",
    "Ristede løg": "Kolonial",
    "Pølsebrød": "Brød & bageri",
    "Remoulade": "Krydderier & smagsgivere",
    "Ramennudler": "Kolonial",
}

R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))

# ---------------------------------------------------------------- Hverdag
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

recipe("Kyllingewraps med salsa og guacamole",
  "Hurtig fredagsagtig hverdagsret, hvor alle selv samler deres wrap.", 4, 30,
  ["Hovedretter", "Kylling", "Mexicansk", "Hurtig", "Børnevenlig"],
  ["Kylling|Kyllingebryst|500|g|i strimler", "Kylling|Tacokrydderi|2|spsk|", "Kylling|Olivenolie|1|spsk|",
   "Guacamole|Avocado|2|stk|modne", "Guacamole|Lime|1|stk|saften", "Guacamole|Rødløg|0.5|stk|finthakket",
   "Guacamole|Koriander|0.5|bundt|", "Guacamole|Salt|||",
   "Servering|Tortillas|8|stk|", "Servering|Salat|1|stk|hjertesalat", "Servering|Tomater|2|stk|",
   "Servering|Agurk|0.5|stk|", "Servering|Revet ost|100|g|", "Servering|Creme fraiche|2|dl|",
   "Servering|Salsa|1|glas|"],
  ["Guacamole|Mos avocadoerne med limesaft, rødløg, hakket koriander og salt.|",
   "Kylling|Vend kyllingen i olie og tacokrydderi, og steg den gennem på en varm pande.|8",
   "Servering|Snit salat, tomat og agurk. Lun tortillaerne på en tør pande eller i ovnen.|",
   "Servering|Sæt det hele på bordet, så alle selv kan samle deres wraps.|"])

recipe("Thai rød karry med kylling",
  "Cremet og let stærk karry med kokosmælk. Justér styrken med mængden af karrypasta.", 4, 30,
  ["Hovedretter", "Kylling", "Asiatisk", "Gryderet", "Hurtig"],
  ["|Kyllingebryst|600|g|i tynde skiver", "|Rapsolie|1|spsk|", "|Rød karrypasta|3|spsk|",
   "|Kokosmælk|2|dåse|à 400 ml", "|Fiskesauce|2|spsk|", "|Brun farin|1|spsk|",
   "|Peberfrugt|1|stk|rød, i strimler", "|Sukkerærter|150|g|", "|Lime|1|stk|",
   "|Basilikum|1|håndfuld|gerne thai-basilikum", "Tilbehør|Jasminris|300|g|"],
  ["|Sæt risene over.|",
   "|Rist karrypastaen i olien i en wok eller gryde i 1–2 minutter, til den dufter.|",
   "|Tilsæt halvdelen af kokosmælken og lad det koge op, så fedtet skiller lidt. Kom kyllingen i og vend den rundt.|",
   "|Tilsæt resten af kokosmælken, fiskesauce og farin, og lad det simre.|8",
   "|Kom peberfrugt og sukkerærter i og kog et par minutter mere, så de stadig er sprøde.|3",
   "|Smag til med limesaft og evt. mere fiskesauce. Drys basilikum over og server med ris.|"])

recipe("Kylling tikka masala",
  "Kyllingen skal marinere mindst 1 time – gerne natten over. Server med ris eller naanbrød.", 4, 50,
  ["Hovedretter", "Kylling", "Indisk", "Gryderet"],
  ["Marinade|Kyllingelår|700|g|uden ben, i stykker", "Marinade|Græsk yoghurt|1.5|dl|",
   "Marinade|Hvidløg|2|fed|presset", "Marinade|Ingefær|1|spsk|revet", "Marinade|Garam masala|2|tsk|",
   "Marinade|Spidskommen|1|tsk|", "Marinade|Gurkemeje|0.5|tsk|", "Marinade|Salt|1|tsk|",
   "Sauce|Smør|2|spsk|", "Sauce|Løg|1|stk|finthakket", "Sauce|Hvidløg|3|fed|",
   "Sauce|Ingefær|1|spsk|revet", "Sauce|Garam masala|2|tsk|", "Sauce|Paprika|2|tsk|",
   "Sauce|Spidskommen|1|tsk|", "Sauce|Chiliflager|0.5|tsk|", "Sauce|Tomatpuré|2|spsk|",
   "Sauce|Hakkede tomater|1|dåse|", "Sauce|Fløde|2|dl|", "Sauce|Koriander|||til pynt",
   "Tilbehør|Ris|300|g|"],
  ["Marinade|Bland alle ingredienser til marinaden og vend kyllingen i. Stil på køl mindst 1 time.|60",
   "Marinade|Steg kyllingen i omgange på en meget varm pande, så den får farve. Den behøver ikke være gennemstegt.|",
   "Sauce|Smelt smør i en gryde og svits løg, til det er gyldent. Tilsæt hvidløg, ingefær og krydderier og rist et minut.|",
   "Sauce|Rør tomatpuré og hakkede tomater i og lad det simre.|10",
   "Sauce|Blend evt. saucen glat. Tilsæt fløde og kylling og lad det simre, til kyllingen er gennemstegt.|10",
   "Sauce|Smag til med salt, drys koriander over og server med ris eller naan.|"])

recipe("Spaghetti bolognese",
  "Jo længere sovsen simrer, jo bedre. Rester kan fryses.", 4, 75,
  ["Hovedretter", "Oksekød", "Pasta", "Italiensk", "Børnevenlig"],
  ["Sovs|Hakket oksekød|500|g|", "Sovs|Olivenolie|2|spsk|", "Sovs|Løg|1|stk|finthakket",
   "Sovs|Gulerod|2|stk|fintrevet", "Sovs|Bladselleri|1|stilk|finthakket", "Sovs|Hvidløg|2|fed|",
   "Sovs|Tomatpuré|2|spsk|", "Sovs|Rødvin|1|dl|kan udelades", "Sovs|Hakkede tomater|2|dåse|",
   "Sovs|Oksebouillon|1|terning|", "Sovs|Oregano|1|tsk|", "Sovs|Laurbærblade|2|stk|",
   "Sovs|Salt|||", "Sovs|Peber|||",
   "Servering|Spaghetti|400|g|", "Servering|Parmesan|50|g|revet"],
  ["Sovs|Brun kødet godt i olien i en gryde. Tilsæt løg, gulerod, selleri og hvidløg og svits et par minutter.|",
   "Sovs|Rør tomatpuré i og rist kort. Hæld rødvinen ved og lad den koge ind.|",
   "Sovs|Tilsæt tomater, bouillon, oregano og laurbær. Lad sovsen simre under halvt låg, og rør af og til.|40",
   "Servering|Kog spaghettien al dente. Smag sovsen til med salt og peber.|",
   "Servering|Server med revet parmesan.|"])

recipe("Chili con carne",
  "Kraftig gryderet, der bliver endnu bedre dagen efter.", 4, 60,
  ["Hovedretter", "Oksekød", "Gryderet", "Mexicansk"],
  ["Chili|Hakket oksekød|500|g|", "Chili|Olivenolie|1|spsk|", "Chili|Løg|1|stk|hakket",
   "Chili|Hvidløg|3|fed|", "Chili|Peberfrugt|1|stk|i tern", "Chili|Chili|1|stk|finthakket",
   "Chili|Spidskommen|2|tsk|", "Chili|Røget paprika|2|tsk|", "Chili|Oregano|1|tsk|",
   "Chili|Tomatpuré|2|spsk|", "Chili|Hakkede tomater|2|dåse|", "Chili|Kidneybønner|1|dåse|skyllet",
   "Chili|Sorte bønner|1|dåse|skyllet", "Chili|Oksebouillon|1|terning|",
   "Chili|Mørk chokolade|10|g|", "Chili|Salt|||",
   "Servering|Ris|300|g|", "Servering|Creme fraiche|2|dl|", "Servering|Koriander|||"],
  ["Chili|Brun kødet i olien. Tilsæt løg, hvidløg, peberfrugt og chili og svits et par minutter.|",
   "Chili|Rør krydderier og tomatpuré i og rist et minut.|",
   "Chili|Tilsæt tomater, bønner og bouillon og lad det simre under låg.|40",
   "Chili|Rør chokoladen i og smag til med salt.|",
   "Servering|Server med ris, creme fraiche og koriander.|"])

recipe("Burger med hjemmelavede boller",
  "Bollerne kan bages dagen før. Brug hakket oksekød med 14–18 % fedt, så bøfferne bliver saftige.", 4, 120,
  ["Hovedretter", "Oksekød", "Burger", "Weekendmad", "Børnevenlig"],
  ["Boller|Mælk|3|dl|lunken", "Boller|Gær|25|g|", "Boller|Sukker|2|spsk|", "Boller|Salt|1.5|tsk|",
   "Boller|Smør|50|g|blødt", "Boller|Æg|1|stk|+ 1 til pensling", "Boller|Hvedemel|500|g|ca.",
   "Boller|Sesam|2|spsk|",
   "Bøffer|Hakket oksekød|600|g|14–18 %", "Bøffer|Salt|||", "Bøffer|Peber|||",
   "Fyld|Cheddar|4|skive|", "Fyld|Salat|1|stk|", "Fyld|Tomater|2|stk|", "Fyld|Rødløg|1|stk|",
   "Fyld|Syltede agurker|||", "Fyld|Ketchup|||", "Fyld|Mayonnaise|||", "Fyld|Sennep|||"],
  ["Boller|Opløs gæren i den lune mælk. Rør sukker, salt, smør og æg i, og ælt melet i lidt ad gangen til en blød, smidig dej. Lad hæve tildækket.|45",
   "Boller|Form 6–8 boller, sæt dem på en plade med bagepapir og tryk dem lidt flade. Lad dem efterhæve.|30",
   "Boller|Pensl med sammenpisket æg, drys sesam over og bag ved 200 °C.|14",
   "Bøffer|Form kødet til 4 bøffer, lidt bredere end bollerne, og lav en lille fordybning i midten. Krydr med salt og peber lige før stegning.|",
   "Bøffer|Steg bøfferne på en meget varm pande eller grill, ca. 3 minutter på hver side. Læg osten på det sidste minut.|6",
   "Fyld|Rist bollerne let på snitfladen og saml burgerne med salat, tomat, løg, agurk og sauce.|"])

recipe("Frikadeller",
  "Klassiske danske frikadeller. Server med jeres kartoffelsalat, eller med kartofler og brun sovs.", 4, 45,
  ["Hovedretter", "Svinekød", "Dansk", "Panderet", "Børnevenlig"],
  ["|Hakket gris og kalv|500|g|", "|Løg|1|stk|fintrevet", "|Æg|1|stk|", "|Hvedemel|3|spsk|",
   "|Mælk|1.5|dl|", "|Salt|1.5|tsk|", "|Peber|0.5|tsk|", "|Smør|3|spsk|til stegning"],
  ["|Rør kød og salt godt sammen. Tilsæt løg, æg, mel og peber, og rør mælken i lidt ad gangen, til farsen er blød men holder formen.|",
   "|Lad farsen hvile i køleskabet.|20",
   "|Form frikadellerne med en spiseske og din hånd, og steg dem i smør ved middel varme, ca. 5 minutter på hver side, til de er gennemstegte.|10"])

recipe("Stegt flæsk med persillesovs",
  "Danmarks nationalret. Flæsket kan også bages i ovnen ved 200 °C på en rist i ca. 25–30 minutter.", 4, 45,
  ["Hovedretter", "Svinekød", "Dansk", "Panderet"],
  ["Flæsk|Flæsk i skiver|800|g|", "Flæsk|Salt|||",
   "Persillesovs|Smør|30|g|", "Persillesovs|Hvedemel|3|spsk|", "Persillesovs|Mælk|5|dl|",
   "Persillesovs|Persille|1|bundt|finthakket", "Persillesovs|Salt|||", "Persillesovs|Peber|||",
   "Persillesovs|Muskatnød|1|knsp|",
   "Tilbehør|Kartofler|1|kg|"],
  ["Tilbehør|Kog kartoflerne møre.|20",
   "Flæsk|Drys flæsket med salt og steg det på en pande ved middel varme, til det er gyldent og sprødt. Vend det undervejs og hæld fedtet fra.|20",
   "Persillesovs|Smelt smørret, rør melet i og spæd op med mælk lidt ad gangen under kraftig piskning. Lad sovsen koge et par minutter.|3",
   "Persillesovs|Rør persillen i og smag til med salt, peber og muskatnød. Server med flæsk og kartofler.|"])

recipe("Mørbradgryde med bacon og peberfrugt",
  "Cremet mørbradgryde uden champignon. Server med ris eller kartoffelmos.", 4, 40,
  ["Hovedretter", "Svinekød", "Gryderet", "Dansk", "Børnevenlig"],
  ["|Svinemørbrad|600|g|i skiver", "|Bacon|125|g|i tern", "|Løg|1|stk|hakket",
   "|Peberfrugt|1|stk|rød, i strimler", "|Smør|1|spsk|", "|Paprika|1|spsk|",
   "|Tomatpuré|2|spsk|", "|Fløde|2.5|dl|", "|Hønsebouillon|1|terning|", "|Vand|1|dl|",
   "|Salt|||", "|Peber|||", "Tilbehør|Ris|300|g|"],
  ["|Sæt risene over.|",
   "|Steg bacon sprødt i en gryde og tag det op. Brun mørbradskiverne i baconfedtet og smørret, og tag dem op.|",
   "|Svits løg og peberfrugt i gryden et par minutter. Rør paprika og tomatpuré i.|",
   "|Tilsæt fløde, vand og bouillon, og kom kød og bacon tilbage. Lad det simre under låg.|10",
   "|Smag til med salt og peber, og server med ris.|"])

recipe("Pasta carbonara",
  "Den ægte vare – uden fløde. Det er stivelsen i pastavandet, der gør saucen cremet.", 4, 20,
  ["Hovedretter", "Svinekød", "Pasta", "Italiensk", "Hurtig"],
  ["|Spaghetti|400|g|", "|Bacon|200|g|gerne i tykke tern eller guanciale",
   "|Æg|4|stk|3 hele + 1 blomme", "|Parmesan|80|g|fintrevet, gerne halvt pecorino",
   "|Peber|||rigeligt, friskkværnet", "|Salt|||til pastavandet"],
  ["|Kog spaghettien i godt saltet vand.|9",
   "|Steg bacon sprødt på en stor pande. Sluk for varmen.|",
   "|Pisk æg, blomme, ost og rigeligt peber sammen i en skål.|",
   "|Gem en kop pastavand, og hæld pastaen fra. Vend pastaen med bacon på panden (uden varme), hæld æggeblandingen over og rør hurtigt, mens du spæder med pastavand, til saucen er cremet.|",
   "|Server straks med ekstra ost og peber.|"])

recipe("Laks i ovn med citron og dild",
  "Nem ovnret, hvor laks og kartofler bages på samme plade.", 4, 35,
  ["Hovedretter", "Fisk", "Ovnret", "Hurtig"],
  ["|Laks|600|g|i 4 stykker", "|Citron|1|stk|", "|Dild|1|bundt|", "|Olivenolie|2|spsk|",
   "|Salt|||", "|Peber|||", "|Kartofler|800|g|små, halveret",
   "Dilddressing|Creme fraiche|2|dl|", "Dilddressing|Citron|0.5|stk|saft og skal"],
  ["|Vend kartoflerne i halvdelen af olien, salt og peber, og bag dem på en plade ved 200 °C.|15",
   "|Skub kartoflerne til side og læg laksen på pladen. Dryp med olie, krydr og læg citronskiver og dild ovenpå. Bag til laksen netop er gennemstegt.|12",
   "Dilddressing|Rør creme fraiche med hakket dild, citronsaft, skal og salt.|",
   "|Server laks og kartofler med dressingen.|"])

recipe("Dal med linser og spinat",
  "Mættende og billig vegetarret. Server med ris eller naanbrød.", 4, 40,
  ["Hovedretter", "Vegetar", "Indisk", "Gryderet"],
  ["|Røde linser|250|g|skyllet", "|Rapsolie|2|spsk|", "|Løg|1|stk|hakket", "|Hvidløg|3|fed|",
   "|Ingefær|1|spsk|revet", "|Spidskommen|1|tsk|", "|Gurkemeje|1|tsk|", "|Garam masala|2|tsk|",
   "|Chiliflager|0.5|tsk|", "|Hakkede tomater|1|dåse|", "|Kokosmælk|1|dåse|",
   "|Grøntsagsbouillon|1|terning|", "|Vand|5|dl|", "|Spinat|100|g|frisk", "|Lime|1|stk|",
   "|Salt|||", "Tilbehør|Ris|300|g|"],
  ["|Svits løg i olien, til det er blødt. Tilsæt hvidløg, ingefær og krydderier og rist et minut.|",
   "|Tilsæt linser, tomater, kokosmælk, vand og bouillon. Lad det simre under omrøring, til linserne er møre og dal'en tyk.|20",
   "|Rør spinaten i, til den falder sammen. Smag til med limesaft og salt.|",
   "|Server med ris eller naanbrød.|"])

recipe("Shakshuka",
  "Æg pocheret i krydret tomatsauce. Server med godt brød til at dyppe.", 4, 35,
  ["Hovedretter", "Vegetar", "Mellemøstlig", "Hurtig"],
  ["|Olivenolie|2|spsk|", "|Løg|1|stk|", "|Peberfrugt|2|stk|i strimler", "|Hvidløg|3|fed|",
   "|Spidskommen|1|tsk|", "|Røget paprika|2|tsk|", "|Chiliflager|0.5|tsk|",
   "|Hakkede tomater|2|dåse|", "|Æg|8|stk|", "|Feta|100|g|", "|Persille|||",
   "|Salt|||", "|Peber|||", "Servering|Flutes|1|stk|"],
  ["|Svits løg og peberfrugt i olien på en stor pande, til de er bløde.|8",
   "|Tilsæt hvidløg og krydderier og rist et minut. Hæld tomaterne ved og lad saucen simre, til den tykner. Smag til.|10",
   "|Lav fordybninger i saucen og slå æggene ud i dem. Læg låg på og lad æggene stivne, så hviden er fast og blommen stadig blød.|7",
   "|Smuldr feta og drys persille over. Server direkte fra panden med brød.|"])

recipe("Kartoffel-porresuppe",
  "Cremet og mild suppe. Top evt. med sprøde baconstykker.", 4, 40,
  ["Hovedretter", "Vegetar", "Suppe", "Dansk"],
  ["|Smør|2|spsk|", "|Porre|3|stk|i skiver", "|Løg|1|stk|", "|Hvidløg|2|fed|",
   "|Kartofler|800|g|i tern", "|Grøntsagsbouillon|2|terning|", "|Vand|1.2|l|", "|Fløde|1|dl|",
   "|Salt|||", "|Peber|||",
   "Topping|Purløg|1|bundt|", "Topping|Bacon|100|g|kan udelades", "Servering|Flutes|1|stk|"],
  ["|Svits porre, løg og hvidløg i smør, til det er blødt, uden at det tager farve.|8",
   "|Tilsæt kartofler, vand og bouillon, og kog til kartoflerne er møre.|20",
   "|Blend suppen glat, rør fløden i og smag til med salt og peber.|",
   "Topping|Steg evt. bacon sprødt. Server suppen med purløg, bacon og brød.|"])

recipe("Kyllingeramen med blødkogte æg",
  "Ramen uden svampe. Æggene kan med fordel koges og marineres dagen før.", 4, 45,
  ["Hovedretter", "Kylling", "Asiatisk", "Suppe"],
  ["Æg|Æg|4|stk|", "Æg|Soya|3|spsk|til marinade",
   "Bouillon|Kyllingelår|500|g|uden ben", "Bouillon|Hønsebouillon|2|terning|", "Bouillon|Vand|1.5|l|",
   "Bouillon|Hvidløg|3|fed|", "Bouillon|Ingefær|2|spsk|i skiver", "Bouillon|Soya|4|spsk|",
   "Bouillon|Misopasta|2|spsk|", "Bouillon|Sesamolie|1|tsk|",
   "Servering|Ramennudler|300|g|", "Servering|Pak choi|2|stk|halveret", "Servering|Forårsløg|3|stk|",
   "Servering|Sesam|1|spsk|", "Servering|Sriracha|||efter smag"],
  ["Æg|Kog æggene i præcis 6½ minut og læg dem i isvand. Pil dem og læg dem i soya fortyndet med lidt vand.|7",
   "Bouillon|Kog vand, bouillon, hvidløg og ingefær op. Kom kyllingelårene i og lad dem simre, til de er møre.|25",
   "Bouillon|Tag kyllingen op og skær den i skiver eller riv den fra hinanden. Rør soya, miso og sesamolie i bouillonen.|",
   "Servering|Kog nudlerne efter anvisningen, og blancher pak choi kort i bouillonen.|3",
   "Servering|Fordel nudler i skåle, hæld bouillon over og top med kylling, pak choi, halverede æg, forårsløg, sesam og sriracha.|"])

# ---------------------------------------------------------------- Weekend
recipe("Pulled pork i burgerboller",
  "Kødet skal i ovnen i ca. 5 timer. Server med syltede rødløg i bløde boller.", 6, 330,
  ["Hovedretter", "Svinekød", "Ovnret", "Burger", "Weekendmad", "Gæster"],
  ["Kød|Svinenakke|1.5|kg|uden ben",
   "Rub|Brun farin|2|spsk|", "Rub|Røget paprika|2|spsk|", "Rub|Salt|1|spsk|", "Rub|Peber|1|tsk|",
   "Rub|Hvidløgspulver|1|tsk|", "Rub|Spidskommen|1|tsk|", "Rub|Cayennepeber|0.5|tsk|",
   "BBQ-sauce|Ketchup|2|dl|", "BBQ-sauce|Æbleeddike|3|spsk|", "BBQ-sauce|Brun farin|2|spsk|",
   "BBQ-sauce|Sennep|1|spsk|", "BBQ-sauce|Soya|1|spsk|",
   "Syltede rødløg|Rødløg|2|stk|i tynde ringe", "Syltede rødløg|Æbleeddike|1|dl|",
   "Syltede rødløg|Vand|1|dl|", "Syltede rødløg|Sukker|2|spsk|", "Syltede rødløg|Salt|1|tsk|",
   "Servering|Burgerboller|8|stk|"],
  ["Kød|Bland rub'en og gnid den grundigt ind i kødet. Gerne dagen før.|",
   "Kød|Læg kødet i et ovnfast fad med 1 dl vand, dæk tæt med låg eller folie, og steg ved 140 °C, til kødet falder fra hinanden.|300",
   "Syltede rødløg|Kog eddike, vand, sukker og salt op og hæld over løgene. Lad dem trække mindst 30 minutter.|30",
   "BBQ-sauce|Kog alle ingredienser til saucen sammen et par minutter.|5",
   "Servering|Riv kødet fra hinanden med to gafler og vend det med BBQ-sauce og lidt af stegeskyen. Server i lune boller med syltede rødløg.|"])

recipe("Hjemmelavet pizza",
  "Brug jeres opskrift på Pizzadej. Toppingen her er en klassisk skinkepizza – byt frit.", 4, 30,
  ["Hovedretter", "Pizza", "Italiensk", "Weekendmad", "Børnevenlig"],
  ["Tomatsauce|Passata|4|dl|", "Tomatsauce|Hvidløg|1|fed|", "Tomatsauce|Oregano|1|tsk|",
   "Tomatsauce|Olivenolie|1|spsk|", "Tomatsauce|Salt|||",
   "Topping|Mozzarella|250|g|", "Topping|Revet ost|100|g|", "Topping|Skinke|150|g|eller pepperoni",
   "Topping|Basilikum|||"],
  ["Tomatsauce|Rør passata med presset hvidløg, oregano, olie og salt. Den skal ikke koges.|",
   "|Sæt ovnen på max (250–275 °C) med en bageplade eller pizzasten indeni.|",
   "|Rul dejen ud, smør et tyndt lag sauce på og fordel ost og topping.|",
   "|Bag pizzaen nederst i ovnen, til bunden er sprød og osten bobler.|8",
   "|Drys frisk basilikum over.|"])

recipe("Oksesteg med brun sovs",
  "Langtidsstegt ved lav temperatur, så stegen bliver jævnt rosa. Brug et stegetermometer.", 6, 150,
  ["Hovedretter", "Oksekød", "Ovnret", "Dansk", "Weekendmad", "Gæster"],
  ["Steg|Oksesteg|1.2|kg|fx culotte eller inderlår", "Steg|Salt|||", "Steg|Peber|||",
   "Steg|Smør|2|spsk|", "Steg|Løg|1|stk|i både", "Steg|Gulerod|2|stk|i stykker",
   "Steg|Frisk timian|4|stilk|", "Steg|Laurbærblade|2|stk|",
   "Sovs|Vand|5|dl|", "Sovs|Oksebouillon|1|terning|", "Sovs|Fløde|1|dl|",
   "Sovs|Maizena|2|spsk|udrørt i lidt koldt vand", "Sovs|Ribsgelé|1|spsk|", "Sovs|Salt|||",
   "Tilbehør|Kartofler|1|kg|"],
  ["Steg|Tag kødet ud af køleskabet en time før. Krydr med salt og peber og brun det godt på alle sider i smør.|",
   "Steg|Læg løg, gulerod, timian og laurbær i et fad, læg stegen ovenpå og hæld 5 dl vand med bouillon ved. Steg ved 120 °C, til kernetemperaturen er 55–57 °C.|90",
   "Steg|Lad stegen hvile under folie, mens sovsen laves.|15",
   "Tilbehør|Kog kartoflerne.|20",
   "Sovs|Si skyen over i en gryde, tilsæt fløde og kog op. Jævn med maizena og smag til med ribsgelé og salt.|",
   "|Skær stegen i tynde skiver på tværs af fibrene og server med sovs og kartofler.|"])

recipe("Tacos med oksekød og pico de gallo",
  "Små bløde tortillas med krydret oksekød og frisk tomatsalsa.", 4, 35,
  ["Hovedretter", "Oksekød", "Mexicansk", "Weekendmad", "Børnevenlig"],
  ["Kød|Hakket oksekød|500|g|", "Kød|Løg|1|stk|", "Kød|Hvidløg|2|fed|", "Kød|Tacokrydderi|3|spsk|",
   "Kød|Tomatpuré|2|spsk|", "Kød|Vand|1|dl|",
   "Pico de gallo|Tomater|4|stk|i små tern", "Pico de gallo|Rødløg|1|stk|finthakket",
   "Pico de gallo|Chili|1|stk|", "Pico de gallo|Koriander|0.5|bundt|", "Pico de gallo|Lime|1|stk|",
   "Pico de gallo|Salt|||",
   "Servering|Tortillas|12|stk|små", "Servering|Avocado|2|stk|", "Servering|Creme fraiche|2|dl|",
   "Servering|Revet ost|150|g|", "Servering|Salat|||"],
  ["Pico de gallo|Bland tomat, rødløg, finthakket chili og koriander. Smag til med limesaft og salt.|",
   "Kød|Brun kødet med løg og hvidløg. Rør tacokrydderi, tomatpuré og vand i og lad det simre.|8",
   "Servering|Lun tortillaerne på en tør pande og server med kød, pico de gallo, avocado, creme fraiche, ost og salat.|"])

recipe("Steak med bearnaise og pommes frites",
  "Ribeye kan byttes til oksefilet eller entrecôte. Lad kødet få stuetemperatur inden stegning.", 4, 45,
  ["Hovedretter", "Oksekød", "Panderet", "Fransk", "Weekendmad", "Gæster"],
  ["Steak|Ribeye|4|stk|à ca. 250 g", "Steak|Salt|||groft", "Steak|Peber|||",
   "Steak|Smør|2|spsk|", "Steak|Hvidløg|2|fed|knust", "Steak|Frisk timian|3|stilk|",
   "Bearnaise|Skalotteløg|1|stk|finthakket", "Bearnaise|Hvidvinseddike|3|spsk|",
   "Bearnaise|Estragon|2|spsk|hakket", "Bearnaise|Æg|3|stk|kun blommerne",
   "Bearnaise|Smør|200|g|smeltet", "Bearnaise|Salt|||", "Bearnaise|Peber|||",
   "Tilbehør|Pommes frites (frost)|800|g|"],
  ["Tilbehør|Bag pommes frites i ovnen efter anvisningen.|25",
   "Bearnaise|Kog skalotteløg, eddike og halvdelen af estragonen ind til ca. 1 spsk væske. Si og lad afkøle lidt.|",
   "Bearnaise|Pisk reduktionen med æggeblommerne i en skål over svagt simrende vand, til det er tykt og luftigt. Pisk det lune smør i i en tynd stråle. Rør resten af estragonen i og smag til.|",
   "Steak|Krydr kødet med salt og steg det på en meget varm pande, 2–3 minutter på hver side. Tilsæt smør, hvidløg og timian og øs kødet det sidste minut.|6",
   "Steak|Lad kødet hvile et par minutter, krydr med peber og server med bearnaise og pommes frites.|4"])

# ---------------------------------------------------------------- Ønsker
recipe("Danske hotdogs",
  "Klassiske ristede hotdogs med det hele.", 4, 20,
  ["Hovedretter", "Svinekød", "Dansk", "Hurtig", "Børnevenlig"],
  ["|Pølser|8|stk|ristede eller røde", "|Pølsebrød|8|stk|", "|Remoulade|||",
   "|Ketchup|||", "|Sennep|||stærk", "|Rødløg|1|stk|finthakket (rå løg)",
   "|Ristede løg|1|dl|", "|Syltede agurker|||i skiver"],
  ["|Steg pølserne på en pande eller grill, til de er gyldne og gennemvarme.|8",
   "|Lun pølsebrødene i ovnen et par minutter.|3",
   "|Læg pølsen i brødet og top med remoulade, ketchup, sennep, rå og ristede løg og agurker.|"])

# ---------------------------------------------------------------- Brød
recipe("Naanbrød",
  "Bløde indiske fladbrød – bages på en tør, meget varm pande.", 8, 90,
  ["Brød", "Indisk"],
  ["Dej|Hvedemel|400|g|", "Dej|Gær|10|g|", "Dej|Mælk|1|dl|lunken", "Dej|Græsk yoghurt|1.5|dl|",
   "Dej|Sukker|1|tsk|", "Dej|Salt|1|tsk|", "Dej|Olivenolie|2|spsk|",
   "Hvidløgssmør|Smør|50|g|", "Hvidløgssmør|Hvidløg|2|fed|presset", "Hvidløgssmør|Koriander|||hakket"],
  ["Dej|Opløs gæren i mælken, og rør yoghurt, sukker, salt og olie i. Ælt melet i til en blød, let klistret dej. Lad hæve tildækket.|60",
   "Dej|Del dejen i 8 stykker og rul dem tynde og aflange.|",
   "Dej|Bag dem én ad gangen på en tør, meget varm pande, til de bobler og får brune pletter – ca. 1 minut på hver side.|",
   "Hvidløgssmør|Smelt smørret med hvidløg og pensl de varme brød. Drys koriander over.|"])

# ---------------------------------------------------------------- Kage
recipe("Brownies",
  "Fudgy brownies – de skal være lidt klistrede i midten. Giver ca. 16 stykker.", 16, 45,
  ["Kage"],
  ["|Mørk chokolade|200|g|", "|Smør|200|g|", "|Sukker|250|g|", "|Æg|4|stk|",
   "|Hvedemel|100|g|", "|Kakao|30|g|", "|Salt|0.5|tsk|", "|Vaniljepulver|1|tsk|"],
  ["|Smelt chokolade og smør sammen ved svag varme. Lad det køle lidt af.|",
   "|Pisk æg og sukker luftigt, og rør chokoladeblandingen i.|",
   "|Sigt mel, kakao, salt og vanilje i og vend det forsigtigt sammen.|",
   "|Hæld dejen i en form på ca. 20×30 cm beklædt med bagepapir, og bag ved 175 °C.|25",
   "|Lad kagen køle helt af i formen, før den skæres i stykker.|"])


# ---------------------------------------------------------------- SQL
def q(s):
    return "null" if s is None or s == "" else "'" + str(s).replace("'", "''") + "'"

def num(s):
    return "null" if s in (None, "") else str(float(s)).rstrip("0").rstrip(".")

out = ["-- Nye opskrifter til Astons Køkken (genereret af nye_opskrifter_2026-10.py)", "begin;"]
for name, cat in NEW_INGREDIENTS.items():
    out.append(
        f"insert into madplan.ingredients (name, category_id) select {q(name)}, (select id from madplan.shop_categories where name = {q(cat)}) "
        f"where not exists (select 1 from madplan.ingredients where lower(name) = lower({q(name)}));")

used = set()
for r in R:
    for line in r["ings"]:
        used.add(line.split("|")[1])
out.append("do $$ declare missing text; begin")
out.append("  select string_agg(n, ', ') into missing from unnest(array[" + ", ".join(q(n) for n in sorted(used)) + "]) n")
out.append("  where not exists (select 1 from madplan.ingredients i where lower(i.name) = lower(n));")
out.append("  if missing is not null then raise exception 'Mangler ingredienser: %', missing; end if; end $$;")

for r in R:
    out.append(f"\n-- {r['title']}")
    out.append("with r as (insert into madplan.recipes (title, description, servings, prep_minutes, created_by) "
               f"select {q(r['title'])}, {q(r['desc'])}, {r['servings']}, {r['prep']}, '{CREATED_BY}' "
               f"where not exists (select 1 from madplan.recipes where lower(title) = lower({q(r['title'])})) returning id),")
    ing_vals = []
    for i, line in enumerate(r["ings"]):
        sec, name, amt, unit, note = (line.split("|") + [""] * 5)[:5]
        ing_vals.append(f"({i}, {q(name)}, {num(amt)}::numeric, {q(unit)}, {q(note)}, {q(sec)})")
    step_vals = []
    for i, line in enumerate(r["steps"]):
        sec, text, timer = (line.split("|") + [""] * 3)[:3]
        step_vals.append(f"({i}, {q(text)}, {timer or 'null'}::int, {q(sec)})")
    out.append("  ri as (insert into madplan.recipe_ingredients (recipe_id, ingredient_id, amount, unit, note, sort_order, section) "
               "select r.id, i.id, v.amount, v.unit, v.note, v.ord, v.sec from r, (values " + ", ".join(ing_vals) +
               ") v(ord, name, amount, unit, note, sec) join madplan.ingredients i on lower(i.name) = lower(v.name)),")
    out.append("  rs as (insert into madplan.recipe_steps (recipe_id, sort_order, text, timer_minutes, section) "
               "select r.id, v.ord, v.txt, v.timer, v.sec from r, (values " + ", ".join(step_vals) + ") v(ord, txt, timer, sec))")
    out.append("insert into madplan.recipe_tags (recipe_id, tag_id) select r.id, t.id from r join madplan.tags t on t.name in (" +
               ", ".join(q(t) for t in r["tags"]) + ");")

out.append("\ncommit;")
import sys as _s
if len(_s.argv) == 1:
    print("\n".join(out))


# ---------------------------------------------------------------- Kompakt JSON-variant (til MCP / SQL Editor)
import json, sys
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

if len(sys.argv) > 1 and sys.argv[1] == "json":
    n = int(sys.argv[2]); size = 8
    chunk = R[n * size:(n + 1) * size]
    print(TEMPLATE.format(payload=payload(chunk), created_by=CREATED_BY))
