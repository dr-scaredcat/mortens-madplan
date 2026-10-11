"""Runde 5 (forretter og desserter): genererer SQL til nye opskrifter i Astons Køkken.

Kør:  python3 scripts/nye_opskrifter_2026-10e.py chunk <n>   -> SQL for opskrift-chunk n (8 pr. chunk)
      python3 scripts/nye_opskrifter_2026-10e.py names       -> alle ingrediensnavne og tags (til kontrol)
"""
import json, sys

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"

NEW_INGREDIENTS = {
    "Kammuslinger": "Kød & fisk",
    "Kalveinderlår": "Kød & fisk",
    "Serranoskinke": "Pålæg",
    "Melon": "Frugt & grønt",
    "Burrata": "Mejeri & æg",
    "Mascarpone": "Mejeri & æg",
    "Grødris": "Kolonial",
    "Kirsebærsauce": "Dåser & glas",
    "Blandede bær (frost)": "Frost",
    "Vaniljeis": "Frost",
    "Kartoffelmel": "Kolonial",
    "Kammerjunkere": "Kolonial",
    "Syltetøj": "Kolonial",
    "Savoiardi (ladyfingers)": "Kolonial",
    "Kaffe": "Kolonial",
}

R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))

# ======================================================================= Forretter
recipe("Rejecocktail",
  "Klassisk forret med håndpillede rejer i cremet dressing.", 4, 20,
  ["Forret", "Skaldyr", "Dansk"],
  ["|Rejer|300|g|kogte, pillede", "|Salat|1|stk|hjertesalat, i strimler", "|Agurk|0.5|stk|i små tern",
   "Dressing|Mayonnaise|0.75|dl|", "Dressing|Creme fraiche|0.75|dl|", "Dressing|Ketchup|1|spsk|",
   "Dressing|Citron|0.5|stk|saften", "Dressing|Peberrod|1|tsk|revet, kan udelades", "Dressing|Salt|||",
   "Servering|Dild|||", "Servering|Citron|0.5|stk|i både", "Servering|Franskbrød|||ristet"],
  ["Dressing|Rør dressingen sammen og smag til.|",
   "|Fordel salat og agurk i glas eller skåle, og læg rejerne ovenpå.|",
   "Servering|Kom dressingen over lige før servering, og pynt med dild og citron. Server med ristet brød.|"])

recipe("Laksetatar med avocado og lime",
  "Frisk og let forret uden ovn. Brug meget frisk laks (sushikvalitet).", 4, 20,
  ["Forret", "Fisk"],
  ["Tatar|Laks|300|g|meget frisk, uden skind", "Tatar|Skalotteløg|1|stk|finthakket", "Tatar|Kapers|1|spsk|hakkede",
   "Tatar|Dild|||hakket", "Tatar|Lime|1|stk|skal og saft", "Tatar|Olivenolie|1|spsk|", "Tatar|Salt|||",
   "Tatar|Peber|||",
   "Avocado|Avocado|2|stk|modne", "Avocado|Lime|0.5|stk|saften", "Avocado|Salt|||",
   "Servering|Rugbrød|4|skive|i tynde, ristede stykker"],
  ["Tatar|Skær laksen i små tern og vend med skalotteløg, kapers, dild, limeskal, -saft og olie. Smag til og stil koldt.|",
   "Avocado|Mos avocado med limesaft og salt.|",
   "Servering|Anret avocado i en ring på tallerkenen med laksetataren ovenpå. Server med sprødt rugbrød.|"])

recipe("Røget laks med rygeostcreme og rugbrødschips",
  "Nem forret, der kan forberedes i god tid.", 4, 25,
  ["Forret", "Fisk", "Dansk"],
  ["Rugbrødschips|Rugbrød|4|skive|i tynde skiver", "Rugbrødschips|Olivenolie|1|spsk|", "Rugbrødschips|Salt|||",
   "Rygeostcreme|Rygeost|200|g|", "Rygeostcreme|Creme fraiche|0.5|dl|", "Rygeostcreme|Purløg|||hakket",
   "Rygeostcreme|Citron|0.5|stk|skal", "Rygeostcreme|Peber|||",
   "Servering|Røget laks|200|g|i skiver", "Servering|Radiser|6|stk|i tynde skiver", "Servering|Dild|||"],
  ["Rugbrødschips|Pensl rugbrødet med olie, drys med salt og bag ved 180 °C, til det er sprødt.|12",
   "Rygeostcreme|Rør rygeost, creme fraiche, purløg og citronskal sammen og smag til med peber.|",
   "Servering|Anret laks, rygeostcreme, radiser og dild på tallerkener, og server med rugbrødschips.|"])

recipe("Gambas al ajillo",
  "Spansk tapas: rejer i sydende hvidløgsolie. Server med brød til at dyppe.", 4, 15,
  ["Forret", "Skaldyr", "Hurtig"],
  ["|Rejer|400|g|rå, pillede", "|Olivenolie|1|dl|", "|Hvidløg|6|fed|i tynde skiver",
   "|Chiliflager|0.5|tsk|", "|Persille|||hakket", "|Citron|0.5|stk|", "|Salt|||",
   "Servering|Flutes|1|stk|"],
  ["|Varm olien op i en pande eller lerfad med hvidløg og chili ved middel varme, til hvidløget lige begynder at tage farve.|3",
   "|Kom rejerne i og steg dem, til de netop er lyserøde.|3",
   "|Drys persille og salt over, pres citron over, og server sydende varmt med brød.|"])

recipe("Kammuslinger med blomkålspuré",
  "Lidt festlig forret. Kammuslingerne skal kun have kort tid på en meget varm pande.", 4, 30,
  ["Forret", "Skaldyr", "Fransk", "Gæster"],
  ["Blomkålspuré|Blomkål|0.5|stk|i buketter", "Blomkålspuré|Mælk|2|dl|", "Blomkålspuré|Smør|20|g|",
   "Blomkålspuré|Salt|||",
   "Kammuslinger|Kammuslinger|8|stk|", "Kammuslinger|Smør|1|spsk|", "Kammuslinger|Olivenolie|1|spsk|",
   "Kammuslinger|Salt|||", "Kammuslinger|Citron|0.5|stk|",
   "Topping|Bacon|50|g|i små tern, kan udelades", "Topping|Purløg|||"],
  ["Blomkålspuré|Kog blomkålen mør i mælken. Blend med smør til en glat puré og smag til med salt.|12",
   "Topping|Steg baconternene sprøde.|",
   "Kammuslinger|Dup kammuslingerne tørre og krydr med salt. Steg dem i olie og smør på en meget varm pande, ca. 1½ minut på hver side.|3",
   "Kammuslinger|Pres lidt citron over. Anret på puréen med bacon og purløg.|"])

recipe("Carpaccio af oksefilet med parmesan og rucola",
  "Læg kødet i fryseren en time, så det er nemt at skære i papirtynde skiver.", 4, 20,
  ["Forret", "Oksekød", "Italiensk", "Gæster"],
  ["|Oksefilet|250|g|", "|Rucola|50|g|", "|Parmesan|40|g|i flager", "|Pinjekerner|2|spsk|ristede",
   "|Olivenolie|3|spsk|god kvalitet", "|Citron|0.5|stk|", "|Salt|||groft", "|Peber|||"],
  ["|Læg oksefileten i fryseren, til den er stivnet, men ikke frossen.|60",
   "|Skær kødet i papirtynde skiver og fordel dem på tallerkener.|",
   "|Dryp med olie og citron, drys groft salt og peber over, og top med rucola, parmesan og pinjekerner.|"])

recipe("Vitello tonnato",
  "Italiensk klassiker: kold, tyndt skåret kalvesteg med cremet tunsauce. Kødet kan steges dagen før.", 6, 90,
  ["Forret", "Italiensk", "Gæster"],
  ["Kalv|Kalveinderlår|600|g|", "Kalv|Olivenolie|1|spsk|", "Kalv|Salt|||", "Kalv|Peber|||",
   "Tunsauce|Tun i vand|1|dåse|drænet", "Tunsauce|Mayonnaise|1.5|dl|", "Tunsauce|Ansjos|2|stk|",
   "Tunsauce|Kapers|1|spsk|", "Tunsauce|Citron|0.5|stk|saften", "Tunsauce|Vand|2|spsk|",
   "Servering|Kapers|1|spsk|", "Servering|Rucola|||"],
  ["Kalv|Krydr kødet, brun det på alle sider og steg det i ovnen ved 160 °C, til kernen er ca. 58 °C. Lad det køle helt af.|40",
   "Tunsauce|Blend tun, mayonnaise, ansjos, kapers, citron og vand til en glat sauce.|",
   "|Skær kødet i meget tynde skiver, anret på et fad og fordel saucen over. Pynt med kapers og rucola.|"])

recipe("Serranoskinke med melon",
  "Ingen madlavning – sødt og salt i én bid.", 4, 5,
  ["Forret", "Svinekød", "Hurtig"],
  ["|Melon|0.5|stk|cantaloupe eller galia", "|Serranoskinke|100|g|", "|Rucola|||", "|Olivenolie|||",
   "|Peber|||"],
  ["|Skær melonen i både og fjern skræl og kerner.|",
   "|Anret melon og skinke på tallerkener med lidt rucola, en stribe olie og friskkværnet peber.|"])

recipe("Mini-tarteletter med hønsesalat",
  "Hønsesalaten kan laves dagen før. Fyld tarteletterne lige før servering, så de forbliver sprøde.", 6, 30,
  ["Forret", "Kylling", "Dansk"],
  ["Hønsesalat|Kyllingebryst|400|g|", "Hønsesalat|Hønsebouillon|1|terning|", "Hønsesalat|Vand|5|dl|",
   "Hønsesalat|Mayonnaise|0.75|dl|", "Hønsesalat|Creme fraiche|0.75|dl|", "Hønsesalat|Asparges (glas)|1|glas|i stykker",
   "Hønsesalat|Bacon|100|g|sprødstegt, kan udelades", "Hønsesalat|Citron|0.5|stk|saften",
   "Hønsesalat|Salt|||", "Hønsesalat|Peber|||",
   "Servering|Tarteletter|12|stk|små", "Servering|Purløg|||", "Servering|Cherrytomater|6|stk|i kvarte"],
  ["Hønsesalat|Pochér kyllingen i vand og bouillon, til den er gennemkogt. Lad den køle og skær i små tern.|15",
   "Hønsesalat|Rør mayonnaise, creme fraiche og citron sammen, og vend kylling, asparges og bacon i. Smag til.|",
   "Servering|Lun tarteletterne kort i ovnen, lad dem køle, fyld dem og pynt med tomat og purløg.|5"])

recipe("Bruschetta med tomat og basilikum",
  "Hurtig italiensk forret – brug modne tomater.", 4, 15,
  ["Forret", "Vegetar", "Italiensk", "Hurtig"],
  ["|Flutes|1|stk|eller ciabatta", "|Olivenolie|3|spsk|", "|Hvidløg|1|fed|",
   "|Tomater|4|stk|modne, i små tern", "|Basilikum|||", "|Salt|||", "|Peber|||"],
  ["|Skær brødet i skiver, pensl med olie og rist dem på en pande eller under grill.|4",
   "|Gnid de varme brød med et halveret hvidløgsfed.|",
   "|Vend tomater med olie, revet basilikum, salt og peber, og fordel på brødene lige før servering.|"])

recipe("Burrata med tomater og pesto",
  "Ingen madlavning – kun gode råvarer. Server med godt brød.", 4, 10,
  ["Forret", "Vegetar", "Italiensk", "Hurtig"],
  ["|Burrata|2|stk|", "|Cherrytomater|300|g|gerne forskellige farver", "|Pesto|3|spsk|",
   "|Olivenolie|2|spsk|", "|Basilikum|||", "|Salt|||groft", "|Peber|||", "Servering|Flutes|1|stk|"],
  ["|Halvér tomaterne og vend dem i olie, salt og peber.|",
   "|Anret tomaterne på et fad, læg burrataen i midten, og dryp med pesto og basilikum. Server med brød.|"])

recipe("Caprese",
  "Tomat, mozzarella og basilikum – Italiens farver på en tallerken.", 4, 10,
  ["Forret", "Vegetar", "Italiensk", "Hurtig"],
  ["|Tomater|4|stk|modne", "|Mozzarella|250|g|", "|Basilikum|||", "|Olivenolie|3|spsk|",
   "|Balsamicoeddike|1|spsk|kan udelades", "|Salt|||groft", "|Peber|||"],
  ["|Skær tomater og mozzarella i skiver og læg dem skiftevis på et fad med basilikumblade.|",
   "|Dryp med olie og evt. balsamico, og drys med groft salt og peber.|"])

# ======================================================================= Desserter
recipe("Risalamande med kirsebærsauce",
  "Grøden laves dagen før, så den er helt kold. Husk den hele mandel til mandelgaven!", 6, 60,
  ["Dessert", "Dansk"],
  ["Risengrød|Grødris|2|dl|", "Risengrød|Vand|2|dl|", "Risengrød|Mælk|1|l|", "Risengrød|Salt|0.5|tsk|",
   "Risalamande|Mandler|75|g|smuttede, hakkede (+ 1 hel)", "Risalamande|Sukker|2|spsk|",
   "Risalamande|Vaniljepulver|1|tsk|", "Risalamande|Fløde|4|dl|piskefløde",
   "Servering|Kirsebærsauce|1|glas|lun"],
  ["Risengrød|Kog risene i vandet et par minutter. Tilsæt mælken og kog op under omrøring.|2",
   "Risengrød|Lad grøden simre under låg ved meget lav varme. Rør jævnligt, så den ikke brænder på.|35",
   "Risengrød|Rør salt i og lad grøden køle helt af – gerne til næste dag.|",
   "Risalamande|Rør sukker, vanilje og hakkede mandler i den kolde grød. Pisk fløden til let skum og vend den i.|",
   "Servering|Gem den hele mandel i portionen og server med lun kirsebærsauce.|"])

recipe("Rødgrød med fløde",
  "Dansk sommerdessert. Kan laves med friske eller frosne bær.", 4, 20,
  ["Dessert", "Dansk"],
  ["|Blandede bær (frost)|600|g|eller jordbær, ribs og hindbær", "|Vand|3|dl|", "|Sukker|100|g|",
   "|Kartoffelmel|2|spsk|udrørt i lidt koldt vand", "Servering|Fløde|2|dl|kold, eller let pisket",
   "Servering|Sukker|||til drys"],
  ["|Kog bær, vand og sukker op og lad det simre, til bærrene falder fra hinanden.|5",
   "|Tag gryden af varmen og rør kartoffelmelet i under omrøring. Kog ikke grøden op igen.|",
   "|Hæld i en skål, drys lidt sukker over og lad den køle af.|",
   "Servering|Server med kold fløde.|"])

recipe("Citronfromage",
  "Let og luftig dansk klassiker. Skal stivne i køleskabet i mindst 3 timer.", 6, 30,
  ["Dessert", "Dansk"],
  ["|Husblas|5|stk|blade", "|Æg|3|stk|", "|Sukker|100|g|", "|Citron|2|stk|skal og saft",
   "|Fløde|2.5|dl|piskefløde", "Servering|Fløde|1|dl|pisket, til pynt"],
  ["|Læg husblassen i koldt vand.|5",
   "|Pisk æggeblommer og sukker hvidt og luftigt. Rør citronskal og -saft i.|",
   "|Smelt husblassen i en lille gryde med lidt af citronsaften, og rør den i æggemassen.|",
   "|Pisk fløden til let skum og æggehviderne stive. Vend først fløden og så hviderne forsigtigt i.|",
   "|Hæld i en skål eller glas og lad fromagen stivne i køleskabet. Pynt med flødeskum.|180"])

recipe("Koldskål med kammerjunkere",
  "Hjemmelavet koldskål – perfekt en varm sommerdag.", 4, 15,
  ["Dessert", "Dansk", "Hurtig", "Børnevenlig"],
  ["|Æg|2|stk|kun blommerne, pasteuriserede", "|Sukker|60|g|", "|Vaniljepulver|1|tsk|",
   "|Kærnemælk|1|l|kold", "|Citron|0.5|stk|saft og skal", "Servering|Kammerjunkere|||",
   "Servering|Blandede bær (frost)|||eller friske jordbær"],
  ["|Pisk æggeblommer, sukker og vanilje hvidt og luftigt.|",
   "|Pisk kærnemælken i lidt ad gangen, og smag til med citron.|",
   "|Stil koldskålen koldt og server med kammerjunkere og bær.|"])

recipe("Pandekager med is og syltetøj",
  "Tynde pandekager – dejen bliver bedst, hvis den hviler en halv time.", 4, 40,
  ["Dessert", "Børnevenlig"],
  ["|Hvedemel|125|g|", "|Mælk|3|dl|", "|Æg|3|stk|", "|Sukker|1|spsk|", "|Salt|1|knsp|",
   "|Smør|30|g|smeltet + til stegning", "Servering|Vaniljeis|||", "Servering|Syltetøj|||",
   "Servering|Sukker|||til drys"],
  ["|Pisk mel, sukker, salt og halvdelen af mælken til en klumpfri dej. Pisk resten af mælken, æggene og det smeltede smør i.|",
   "|Lad dejen hvile.|30",
   "|Steg tynde pandekager i lidt smør på en varm pande, ca. 1 minut på hver side.|",
   "Servering|Server med is, syltetøj og sukker.|"])

recipe("Æble-crumble med vaniljeis",
  "Lun frugtdessert med sprød smuldredej. Kan laves med friske eller frosne bær.", 6, 45,
  ["Dessert", "Børnevenlig"],
  ["Frugt|Æble|4|stk|i tern", "Frugt|Blandede bær (frost)|200|g|", "Frugt|Sukker|2|spsk|", "Frugt|Kanel|1|tsk|",
   "Crumble|Hvedemel|100|g|", "Crumble|Havregryn|75|g|", "Crumble|Brun farin|75|g|", "Crumble|Smør|100|g|koldt",
   "Crumble|Salt|1|knsp|", "Servering|Vaniljeis|||"],
  ["Frugt|Vend æbler og bær i sukker og kanel, og fordel i et ovnfast fad.|",
   "Crumble|Smuldr mel, havregryn, farin, salt og smør sammen med fingrene, til det ligner grove krummer. Drys over frugten.|",
   "|Bag ved 200 °C, til toppen er gylden og frugten bobler.|30",
   "Servering|Server lun med vaniljeis.|"])

recipe("Chokolademousse",
  "Luftig og intens. Laves gerne dagen før, så den kan sætte sig.", 6, 25,
  ["Dessert", "Fransk"],
  ["|Mørk chokolade|200|g|ca. 60–70 %", "|Æg|3|stk|pasteuriserede", "|Sukker|2|spsk|",
   "|Fløde|2.5|dl|piskefløde", "|Salt|1|knsp|"],
  ["|Smelt chokoladen over vandbad og lad den køle lidt.|",
   "|Pisk æggeblommerne i chokoladen. Pisk fløden til let skum.|",
   "|Pisk æggehviderne stive med salt og sukker.|",
   "|Vend først fløden og så hviderne forsigtigt i chokoladen. Fordel i glas og stil koldt.|180"])

recipe("Chokoladefondant",
  "Lille chokoladekage med flydende midte. Dejen kan laves i forvejen – bag lige før servering.", 4, 25,
  ["Dessert", "Fransk", "Gæster"],
  ["|Mørk chokolade|100|g|", "|Smør|100|g|+ til forme", "|Æg|2|stk|", "|Sukker|60|g|",
   "|Hvedemel|30|g|", "|Kakao|||til forme", "Servering|Vaniljeis|||"],
  ["|Smør 4 små forme og drys dem med kakao.|",
   "|Smelt chokolade og smør sammen. Pisk æg og sukker luftigt, og vend chokoladen og melet i.|",
   "|Fordel dejen i formene og bag ved 220 °C, til kanten er fast, men midten stadig blød.|9",
   "|Lad dem hvile et minut, vend dem ud og server straks med is.|"])

recipe("Tiramisu",
  "Italiensk klassiker. Skal stå koldt i mindst 4 timer – gerne til næste dag.", 6, 30,
  ["Dessert", "Italiensk", "Gæster"],
  ["|Kaffe|3|dl|stærk, afkølet", "|Æg|3|stk|pasteuriserede", "|Sukker|75|g|",
   "|Mascarpone|250|g|", "|Fløde|2|dl|piskefløde", "|Savoiardi (ladyfingers)|200|g|", "|Kakao|||til drys"],
  ["|Pisk æggeblommer og sukker hvidt og luftigt. Rør mascarponen i.|",
   "|Pisk fløden til let skum og vend den i. Pisk evt. hviderne stive og vend dem i for en lettere creme.|",
   "|Dyp kiksene kort i kaffen og læg dem i bunden af et fad. Fordel halvdelen af cremen over, og gentag.|",
   "|Stil tiramisuen koldt, og drys kakao over lige før servering.|240"])

recipe("Panna cotta med bærcoulis",
  "Silkeblød italiensk dessert. Skal stivne i mindst 4 timer.", 6, 30,
  ["Dessert", "Italiensk"],
  ["Panna cotta|Husblas|3|stk|blade", "Panna cotta|Fløde|4|dl|", "Panna cotta|Mælk|1|dl|",
   "Panna cotta|Sukker|60|g|", "Panna cotta|Vaniljepulver|1|tsk|",
   "Bærcoulis|Blandede bær (frost)|250|g|", "Bærcoulis|Sukker|2|spsk|", "Bærcoulis|Citron|0.5|stk|saften"],
  ["Panna cotta|Læg husblassen i koldt vand.|5",
   "Panna cotta|Varm fløde, mælk, sukker og vanilje op til lige under kogepunktet. Tag gryden af varmen og rør den udblødte husblas i.|",
   "Panna cotta|Fordel i glas eller forme og lad dem stivne i køleskabet.|240",
   "Bærcoulis|Kog bær, sukker og citron op, blend og si sovsen. Lad den køle og hæld over panna cottaen.|5"])

recipe("Crème brûlée",
  "Cremet vaniljecreme med sprød karamel. Du skal bruge en gasbrænder til sukkeret.", 6, 60,
  ["Dessert", "Fransk", "Gæster"],
  ["|Fløde|5|dl|", "|Æg|6|stk|kun blommerne", "|Sukker|75|g|", "|Vaniljepulver|1|tsk|",
   "|Rørsukker|6|spsk|til karamel"],
  ["|Varm fløden op med vanilje. Pisk æggeblommer og sukker sammen, og pisk den varme fløde i.|",
   "|Fordel cremen i 6 lave forme, stil dem i en bradepande og hæld kogende vand i panden, så det når halvt op ad formene.|",
   "|Bag ved 150 °C, til cremen har sat sig, men stadig dirrer i midten. Lad dem køle og stil dem koldt.|35",
   "|Drys et tyndt lag rørsukker over og brænd det til karamel med en gasbrænder lige før servering.|"])

recipe("Affogato",
  "Den hurtigste dessert: vaniljeis 'druknet' i varm espresso.", 4, 5,
  ["Dessert", "Italiensk", "Hurtig"],
  ["|Vaniljeis|4|stk|kugler", "|Kaffe|4|stk|shots espresso, varm", "|Mørk chokolade|20|g|revet"],
  ["|Læg en kugle is i hvert glas eller kop.|",
   "|Hæld varm espresso over isen ved bordet og drys revet chokolade over.|"])


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
