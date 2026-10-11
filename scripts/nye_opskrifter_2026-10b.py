"""Runde 2: genererer SQL til nye opskrifter i Astons Køkken.

Kør:  python3 scripts/nye_opskrifter_2026-10b.py chunk <n>   -> SQL for opskrift-chunk n (8 pr. chunk)
      python3 scripts/nye_opskrifter_2026-10b.py names       -> alle ingrediensnavne (til kontrol)
Ingrediens-linjer:  "Sektion|Navn|mængde|enhed|note"
Trin-linjer:        "Sektion|Tekst|timer-minutter"
"""
import json, sys

CREATED_BY = "50c3e6e1-49ab-4602-9c4b-b1b657e97d3c"

NEW_INGREDIENTS = {
    "Peanuts": "Kolonial",
    "Grøn karrypasta": "Krydderier & smagsgivere",
    "Risnudler": "Kolonial",
    "Tamarindpasta": "Krydderier & smagsgivere",
    "Citrongræs": "Frugt & grønt",
    "Tarteletter": "Brød & bageri",
    "Asparges (glas)": "Dåser & glas",
    "Syltede rødbeder": "Dåser & glas",
    "Oksekød i tern": "Kød & fisk",
    "Tortillachips": "Kolonial",
    "Jalapeños": "Dåser & glas",
    "Hamburgerryg": "Kød & fisk",
    "Svinebryst": "Kød & fisk",
    "Tørrede kikærter": "Kolonial",
}

R = []

def recipe(title, desc, servings, prep, tags, ings, steps):
    R.append(dict(title=title, desc=desc, servings=servings, prep=prep, tags=tags, ings=ings, steps=steps))

COLESLAW = ["Coleslaw|Hvidkål|250|g|finsnittet", "Coleslaw|Gulerod|1|stk|groftrevet",
            "Coleslaw|Mayonnaise|0.75|dl|", "Coleslaw|Creme fraiche|0.75|dl|", "Coleslaw|Æbleeddike|1|spsk|",
            "Coleslaw|Sukker|1|tsk|", "Coleslaw|Salt|||", "Coleslaw|Peber|||"]
GUACAMOLE = ["Guacamole|Avocado|2|stk|modne", "Guacamole|Lime|1|stk|saften", "Guacamole|Rødløg|0.5|stk|finthakket",
             "Guacamole|Koriander|0.5|bundt|", "Guacamole|Salt|||"]
MOS = ["Kartoffelmos|Kartofler|1|kg|melede", "Kartoffelmos|Mælk|2|dl|", "Kartoffelmos|Smør|50|g|",
       "Kartoffelmos|Muskatnød|1|knsp|", "Kartoffelmos|Salt|||"]
MOS_STEP = "Kartoffelmos|Kog kartoflerne møre, hæld vandet fra og mos dem med varm mælk og smør. Smag til med salt og muskat.|20"

# ======================================================================= Kylling
recipe("Kylling teriyaki med ris og sesam",
  "Sød og salt glaseret kylling – hurtig hverdagsmad.", 4, 30,
  ["Hovedretter", "Kylling", "Asiatisk", "Wok", "Hurtig", "Børnevenlig"],
  ["Kylling|Kyllingelår|600|g|uden ben, i stykker", "Kylling|Rapsolie|1|spsk|",
   "Teriyakisauce|Soya|1|dl|", "Teriyakisauce|Honning|3|spsk|", "Teriyakisauce|Hvidløg|2|fed|presset",
   "Teriyakisauce|Ingefær|1|spsk|revet", "Teriyakisauce|Maizena|1|tsk|", "Teriyakisauce|Vand|0.5|dl|",
   "Servering|Jasminris|300|g|", "Servering|Broccoli|1|stk|i små buketter",
   "Servering|Forårsløg|2|stk|", "Servering|Sesam|1|spsk|"],
  ["Servering|Sæt risene over.|",
   "Teriyakisauce|Rør alle ingredienser til saucen sammen.|",
   "Kylling|Steg kyllingen gylden i olien på en varm pande.|8",
   "Kylling|Hæld saucen over og lad den koge ind, til den er tyk og blank og kyllingen glaseret.|4",
   "Servering|Damp broccolien et par minutter. Server kyllingen på ris med broccoli, forårsløg og sesam.|3"])

recipe("Grøn karry med kylling og aubergine",
  "Frisk og lidt stærkere end den røde karry.", 4, 30,
  ["Hovedretter", "Kylling", "Asiatisk", "Gryderet", "Hurtig"],
  ["|Kyllingebryst|600|g|i tynde skiver", "|Rapsolie|1|spsk|", "|Grøn karrypasta|3|spsk|",
   "|Kokosmælk|2|dåse|à 400 ml", "|Aubergine|1|stk|i tern", "|Peberfrugt|1|stk|grøn, i strimler",
   "|Fiskesauce|2|spsk|", "|Brun farin|1|spsk|", "|Lime|1|stk|", "|Basilikum|1|håndfuld|gerne thai-basilikum",
   "Tilbehør|Jasminris|300|g|"],
  ["|Sæt risene over.|",
   "|Rist karrypastaen i olien, til den dufter. Tilsæt en dåse kokosmælk og kog op.|2",
   "|Kom aubergine i og lad den simre, til den er næsten mør.|8",
   "|Tilsæt kylling, peberfrugt og resten af kokosmælken, og lad det simre, til kyllingen er gennemstegt.|8",
   "|Smag til med fiskesauce, farin og limesaft. Drys basilikum over og server med ris.|"])

recipe("Kylling korma",
  "Mild, cremet indisk karry med mandler og kokos – god til børn.", 4, 45,
  ["Hovedretter", "Kylling", "Indisk", "Gryderet", "Børnevenlig"],
  ["|Kyllingebryst|600|g|i tern", "|Rapsolie|2|spsk|", "|Løg|2|stk|hakket", "|Hvidløg|3|fed|",
   "|Ingefær|1|spsk|revet", "|Garam masala|2|tsk|", "|Gurkemeje|1|tsk|", "|Koriander (stødt)|1|tsk|",
   "|Kardemomme|0.5|tsk|", "|Mandler|50|g|malede", "|Kokosmælk|1|dåse|", "|Græsk yoghurt|1|dl|",
   "|Fløde|1|dl|", "|Sukker|1|tsk|", "|Salt|||", "Tilbehør|Ris|300|g|"],
  ["|Sæt risene over.|",
   "|Svits løg i olien ved lav varme, til det er blødt og let gyldent. Tilsæt hvidløg, ingefær og krydderier og rist et minut.|10",
   "|Kom kyllingen i og vend den rundt i krydderierne.|",
   "|Tilsæt mandler, kokosmælk og sukker, og lad det simre under låg.|15",
   "|Rør yoghurt og fløde i, varm igennem uden at koge, og smag til med salt. Server med ris.|"])

recipe("Kung pao kylling med peanuts",
  "Kinesisk wokret med sprøde peanuts. Styr styrken med mængden af chili.", 4, 30,
  ["Hovedretter", "Kylling", "Asiatisk", "Wok", "Hurtig"],
  ["Kylling|Kyllingebryst|600|g|i tern", "Kylling|Soya|1|spsk|", "Kylling|Maizena|1|spsk|",
   "Sauce|Soya|2|spsk|", "Sauce|Eddike|1|spsk|", "Sauce|Sukker|1|spsk|", "Sauce|Maizena|1|tsk|",
   "Sauce|Vand|0.5|dl|", "Sauce|Sesamolie|1|tsk|",
   "Wok|Rapsolie|2|spsk|", "Wok|Peanuts|75|g|usaltede", "Wok|Chiliflager|1|tsk|eller tørrede chilier",
   "Wok|Hvidløg|3|fed|", "Wok|Ingefær|1|spsk|revet", "Wok|Peberfrugt|1|stk|rød, i tern",
   "Wok|Forårsløg|4|stk|i stykker", "Tilbehør|Ris|300|g|"],
  ["Tilbehør|Sæt risene over.|",
   "Kylling|Vend kyllingen i soya og maizena. Rør saucen sammen i en skål.|",
   "Wok|Rist peanuts i lidt olie i wokken og tag dem op.|",
   "Wok|Steg kyllingen ved høj varme, til den er gylden. Tilsæt chili, hvidløg, ingefær og peberfrugt og steg 2 minutter.|6",
   "Wok|Hæld saucen i og lad den tykne. Vend peanuts og forårsløg i og server med ris.|"])

recipe("Kyllingespyd med satay-peanutsauce",
  "Kan steges på pande eller grill. Læg træspyd i blød i vand, hvis du bruger grill.", 4, 40,
  ["Hovedretter", "Kylling", "Asiatisk", "Børnevenlig"],
  ["Spyd|Kyllingebryst|600|g|i lange strimler", "Spyd|Soya|2|spsk|", "Spyd|Karry|1|tsk|",
   "Spyd|Gurkemeje|0.5|tsk|", "Spyd|Brun farin|1|spsk|", "Spyd|Hvidløg|1|fed|presset", "Spyd|Rapsolie|1|spsk|",
   "Peanutsauce|Peanutbutter|4|spsk|", "Peanutsauce|Kokosmælk|2|dl|", "Peanutsauce|Rød karrypasta|1|tsk|",
   "Peanutsauce|Soya|1|spsk|", "Peanutsauce|Brun farin|1|tsk|", "Peanutsauce|Lime|0.5|stk|saften",
   "Servering|Jasminris|300|g|", "Servering|Agurk|1|stk|i stave", "Servering|Peanuts|2|spsk|hakkede"],
  ["Spyd|Vend kyllingen i marinaden og lad den trække mindst 20 minutter.|20",
   "Servering|Sæt risene over.|",
   "Spyd|Træk kyllingen på spyd og steg dem på en varm pande eller grill, til de er gennemstegte.|10",
   "Peanutsauce|Varm alle ingredienser til saucen op under omrøring, til den er glat. Spæd med vand, hvis den er for tyk.|",
   "Servering|Server spyddene med ris, agurk, sauce og hakkede peanuts.|"])

recipe("Pad thai med kylling",
  "Thailands mest kendte nudelret. Hav alt klar, før du går i gang – det går hurtigt.", 4, 35,
  ["Hovedretter", "Kylling", "Asiatisk", "Wok"],
  ["|Risnudler|250|g|flade", "|Kyllingebryst|400|g|i tynde strimler", "|Rapsolie|2|spsk|",
   "|Hvidløg|2|fed|", "|Æg|2|stk|", "|Bønnespirer|150|g|", "|Forårsløg|4|stk|",
   "Sauce|Tamarindpasta|2|spsk|", "Sauce|Fiskesauce|3|spsk|", "Sauce|Brun farin|2|spsk|",
   "Sauce|Sriracha|1|tsk|",
   "Servering|Peanuts|50|g|hakkede", "Servering|Lime|1|stk|i både", "Servering|Koriander|||"],
  ["|Læg nudlerne i lunkent vand, til de er bøjelige men stadig faste. Hæld vandet fra.|20",
   "Sauce|Rør tamarind, fiskesauce, farin og sriracha sammen.|",
   "|Steg kyllingen og hvidløg i olien i en wok ved høj varme. Skub til side, slå æggene ud og rør dem til røræg.|5",
   "|Tilsæt nudler og sauce og vend det hele, til nudlerne er bløde. Spæd med en skvat vand, hvis de klistrer.|3",
   "|Vend bønnespirer og forårsløg i. Server med peanuts, limebåde og koriander.|"])

recipe("Kyllingefajitas med stegte peberfrugter",
  "Varm, sydende pande med kylling og peberfrugt, som alle selv ruller i tortillas.", 4, 35,
  ["Hovedretter", "Kylling", "Mexicansk", "Panderet", "Børnevenlig"],
  ["Kylling|Kyllingebryst|600|g|i strimler", "Kylling|Olivenolie|2|spsk|", "Kylling|Spidskommen|1|tsk|",
   "Kylling|Røget paprika|2|tsk|", "Kylling|Oregano|1|tsk|", "Kylling|Hvidløgspulver|1|tsk|",
   "Kylling|Chiliflager|0.5|tsk|", "Kylling|Salt|1|tsk|", "Kylling|Lime|1|stk|",
   "Grønt|Peberfrugt|3|stk|gerne forskellige farver", "Grønt|Løg|2|stk|i både",
   "Servering|Tortillas|8|stk|", "Servering|Avocado|2|stk|", "Servering|Creme fraiche|2|dl|",
   "Servering|Revet ost|100|g|", "Servering|Salsa|1|glas|"],
  ["Kylling|Vend kyllingen i olie, krydderier og saften af limen.|",
   "Grønt|Steg peberfrugt og løg ved høj varme på en stor pande, til de er bløde og let sværtede. Tag dem op.|6",
   "Kylling|Steg kyllingen på samme pande, til den er gennemstegt. Kom grøntsagerne tilbage og vend rundt.|8",
   "Servering|Lun tortillaerne og server direkte fra panden med avocado, creme fraiche, ost og salsa.|"])

recipe("Sprød kyllingeburger med coleslaw",
  "Kyllingen marineres i kærnemælk, så den bliver mør. Brug gerne jeres hjemmelavede burgerboller.", 4, 60,
  ["Hovedretter", "Kylling", "Burger", "Weekendmad", "Børnevenlig"],
  ["Kylling|Kyllingelår|4|stk|uden ben og skind", "Kylling|Kærnemælk|2.5|dl|", "Kylling|Salt|1|tsk|",
   "Panering|Hvedemel|2|dl|", "Panering|Paprika|2|tsk|", "Panering|Hvidløgspulver|1|tsk|",
   "Panering|Salt|1|tsk|", "Panering|Peber|0.5|tsk|", "Panering|Rapsolie|5|dl|til stegning",
   *COLESLAW,
   "Servering|Burgerboller|4|stk|", "Servering|Mayonnaise|0.5|dl|", "Servering|Sriracha|1|spsk|",
   "Servering|Salat|||", "Servering|Syltede agurker|||"],
  ["Kylling|Læg kyllingen i kærnemælk med salt i mindst 30 minutter – gerne flere timer.|30",
   "Coleslaw|Rør mayonnaise, creme fraiche, eddike og sukker sammen og vend kål og gulerod i. Smag til.|",
   "Panering|Bland mel og krydderier. Vend kyllingen i melet, dyp den i kærnemælken igen og vend den i melet en gang til.|",
   "Panering|Varm olien op til ca. 175 °C i en gryde eller dyb pande, og steg kyllingen gylden og gennemstegt.|8",
   "Servering|Rør mayonnaise med sriracha. Saml burgerne med salat, kylling, coleslaw, agurker og sriracha-mayo.|"])

recipe("Kyllingelår i ovn med citron, kartofler og rosmarin",
  "Alt bages på én plade. Kyllingeskindet bliver sprødt, og kartoflerne suger saften.", 4, 60,
  ["Hovedretter", "Kylling", "Ovnret", "Børnevenlig"],
  ["|Kyllingelår|8|stk|med ben og skind", "|Kartofler|1|kg|i både", "|Citron|1|stk|i skiver",
   "|Hvidløg|6|fed|hele, knuste", "|Rosmarin|3|stilk|", "|Olivenolie|3|spsk|",
   "|Paprika|1|tsk|", "|Salt|||", "|Peber|||"],
  ["|Vend kartofler, citron, hvidløg og rosmarin i halvdelen af olien, salt og peber, og fordel på en bageplade.|",
   "|Gnid kyllingelårene med resten af olien, paprika, salt og peber, og læg dem ovenpå med skindet opad.|",
   "|Bag ved 210 °C, til skindet er sprødt og kyllingen gennemstegt.|45",
   "|Server direkte fra pladen, gerne med en grøn salat.|"])

recipe("Thai kokossuppe med kylling (tom kha)",
  "Frisk, syrlig kokossuppe med citrongræs – uden svampe.", 4, 35,
  ["Hovedretter", "Kylling", "Asiatisk", "Suppe"],
  ["|Kokosmælk|2|dåse|", "|Hønsebouillon|1|terning|", "|Vand|5|dl|",
   "|Citrongræs|2|stilk|i stykker, knust", "|Ingefær|3|spsk|i skiver", "|Chili|1|stk|",
   "|Kyllingebryst|500|g|i tynde skiver", "|Cherrytomater|200|g|halveret", "|Fiskesauce|3|spsk|",
   "|Brun farin|1|tsk|", "|Lime|2|stk|", "|Koriander|1|bundt|", "Servering|Jasminris|200|g|"],
  ["Servering|Sæt risene over.|",
   "|Kog kokosmælk, vand, bouillon, citrongræs, ingefær og chili op, og lad det trække ved lav varme.|10",
   "|Kom kyllingen i og lad den simre, til den er gennemstegt. Tilsæt tomaterne det sidste minut.|6",
   "|Smag til med fiskesauce, farin og limesaft – suppen skal være både salt, sur og let sød. Fisk citrongræs og ingefær op.|",
   "|Server med koriander og ris ved siden af.|"])

recipe("Hønsekødssuppe med kød- og melboller",
  "Klassisk dansk suppe. Kyllingen koger i ca. 1½ time, så den er god til en weekenddag.", 6, 150,
  ["Hovedretter", "Kylling", "Suppe", "Dansk", "Børnevenlig"],
  ["Suppe|Hel kylling|1.5|kg|", "Suppe|Vand|3|l|", "Suppe|Løg|1|stk|halveret",
   "Suppe|Laurbærblade|2|stk|", "Suppe|Peber|1|tsk|hele korn", "Suppe|Salt|1|spsk|",
   "Suppe|Gulerod|4|stk|i skiver", "Suppe|Porre|2|stk|i skiver", "Suppe|Knoldselleri|0.25|stk|i tern",
   "Suppe|Persille|||",
   "Kødboller|Hakket svinekød|400|g|", "Kødboller|Løg|0.5|stk|fintrevet", "Kødboller|Æg|1|stk|",
   "Kødboller|Hvedemel|2|spsk|", "Kødboller|Mælk|0.5|dl|", "Kødboller|Salt|1|tsk|",
   "Melboller|Smør|50|g|", "Melboller|Vand|1.25|dl|", "Melboller|Hvedemel|75|g|",
   "Melboller|Æg|2|stk|", "Melboller|Salt|0.5|tsk|"],
  ["Suppe|Læg kyllingen i en stor gryde med koldt vand, løg, laurbær, peber og salt. Bring i kog, skum af, og lad den simre under låg.|90",
   "Kødboller|Rør farsen sammen og lad den hvile koldt.|",
   "Melboller|Kog vand og smør op, rør melet i, til dejen slipper gryden. Lad den køle lidt, og rør æggene i ét ad gangen.|",
   "Suppe|Tag kyllingen op og si suppen. Pil kødet fra benene.|",
   "Suppe|Kom grøntsagerne i suppen og kog dem næsten møre.|8",
   "Kødboller|Sæt kød- og melboller i suppen med to teskeer, og lad dem simre, til de flyder op og er gennemkogte.|6",
   "Suppe|Kom kyllingekødet tilbage, smag til og drys persille over.|"])

recipe("Tarteletter med høns i asparges",
  "Dansk klassiker. Brug kogt kylling – også en god måde at bruge rester fra hønsekødssuppe på.", 4, 40,
  ["Hovedretter", "Kylling", "Dansk", "Børnevenlig"],
  ["|Kyllingebryst|500|g|", "|Hønsebouillon|1|terning|", "|Vand|5|dl|",
   "|Asparges (glas)|1|glas|", "|Smør|40|g|", "|Hvedemel|4|spsk|", "|Fløde|1|dl|",
   "|Salt|||", "|Peber|||", "|Persille|||", "|Tarteletter|8|stk|"],
  ["|Pochér kyllingen i vand og bouillon, til den er gennemkogt. Tag den op og skær i tern. Gem bouillonen.|15",
   "|Smelt smørret, rør melet i og spæd op med bouillon og asparges-vand under piskning, til sovsen er tyk og jævn.|5",
   "|Tilsæt fløde, kylling og asparges i stykker, og varm igennem. Smag til med salt og peber.|",
   "|Lun tartelet-skallerne i ovnen ved 180 °C.|5",
   "|Fyld skallerne og drys persille over.|"])

recipe("Coq au vin",
  "Fransk kylling i rødvin. Bliver endnu bedre dagen efter. Lavet uden champignon.", 6, 120,
  ["Hovedretter", "Kylling", "Gryderet", "Fransk", "Weekendmad", "Gæster"],
  ["|Kyllingelår|1.2|kg|med ben og skind", "|Salt|||", "|Peber|||", "|Hvedemel|2|spsk|",
   "|Bacon|150|g|i tern", "|Smør|1|spsk|", "|Skalotteløg|10|stk|pillede, hele",
   "|Gulerod|3|stk|i stykker", "|Hvidløg|3|fed|", "|Tomatpuré|1|spsk|", "|Rødvin|5|dl|",
   "|Hønsebouillon|1|terning|", "|Vand|2|dl|", "|Frisk timian|4|stilk|", "|Laurbærblade|2|stk|",
   "|Persille|||", *MOS],
  ["|Krydr kyllingen med salt og peber og vend den i mel.|",
   "|Steg bacon sprødt i en stor gryde og tag det op. Brun kyllingen godt på alle sider i fedtet og smørret, og tag den op.|10",
   "|Brun skalotteløg og gulerod i gryden. Tilsæt hvidløg og tomatpuré og rist kort.|5",
   "|Hæld rødvinen ved og kog et par minutter. Tilsæt vand, bouillon, timian og laurbær, og kom kylling og bacon tilbage.|",
   "|Lad det simre under låg, til kyllingen er mør. Kog evt. saucen lidt ind uden låg til sidst.|60",
   MOS_STEP,
   "|Drys persille over og server med kartoffelmos.|"])

recipe("Nachos med kylling og ost",
  "Fredagshygge i et stort fad. Brug evt. jeres opskrift på Tomatsalsa i stedet for købt salsa.", 4, 35,
  ["Hovedretter", "Kylling", "Mexicansk", "Ovnret", "Weekendmad", "Børnevenlig"],
  ["Kylling|Kyllingebryst|500|g|i små tern", "Kylling|Olivenolie|1|spsk|", "Kylling|Tacokrydderi|2|spsk|",
   "Fad|Tortillachips|300|g|", "Fad|Revet ost|200|g|", "Fad|Cheddar|100|g|revet",
   "Fad|Jalapeños|||efter smag", "Fad|Forårsløg|2|stk|",
   *GUACAMOLE,
   "Servering|Salsa|1|glas|", "Servering|Creme fraiche|2|dl|"],
  ["Kylling|Steg kyllingen gennem i olien og vend den i tacokrydderi.|8",
   "Guacamole|Mos avocadoerne med limesaft, rødløg, koriander og salt.|",
   "Fad|Fordel halvdelen af chips, kylling og ost i et stort ovnfast fad, og gentag med resten. Top med jalapeños.|",
   "Fad|Bag ved 200 °C, til osten er smeltet og bobler.|8",
   "Servering|Drys forårsløg over og server straks med salsa, guacamole og creme fraiche.|"])

# ======================================================================= Oksekød
recipe("Bøf stroganoff med kartoffelmos",
  "Hurtig, cremet gryderet med paprika og sennep – lavet uden champignon.", 4, 40,
  ["Hovedretter", "Oksekød", "Gryderet", "Børnevenlig"],
  ["Stroganoff|Oksefilet|500|g|eller inderlår, i tynde strimler", "Stroganoff|Smør|2|spsk|",
   "Stroganoff|Løg|2|stk|i tynde skiver", "Stroganoff|Paprika|2|tsk|", "Stroganoff|Tomatpuré|1|spsk|",
   "Stroganoff|Dijonsennep|1|spsk|", "Stroganoff|Oksebouillon|1|terning|", "Stroganoff|Vand|1.5|dl|",
   "Stroganoff|Creme fraiche|2|dl|", "Stroganoff|Syltede agurker|2|stk|i tern", "Stroganoff|Salt|||",
   "Stroganoff|Peber|||", "Stroganoff|Persille|||", *MOS],
  [MOS_STEP,
   "Stroganoff|Brun kødet hurtigt i smør ved høj varme i et par omgange. Tag det op.|",
   "Stroganoff|Svits løget blødt i samme pande. Rør paprika og tomatpuré i.|5",
   "Stroganoff|Tilsæt vand, bouillon, sennep og creme fraiche, og lad det simre et par minutter.|3",
   "Stroganoff|Kom kødet og agurkerne i og varm kun igennem, så kødet forbliver mørt. Smag til og drys persille over.|"])

recipe("Hakkebøf med bløde løg og brun sovs",
  "Dansk klassiker med kartofler og syltede rødbeder.", 4, 40,
  ["Hovedretter", "Oksekød", "Dansk", "Panderet", "Børnevenlig"],
  ["Bøffer|Hakket oksekød|600|g|", "Bøffer|Salt|||", "Bøffer|Peber|||", "Bøffer|Smør|2|spsk|",
   "Bløde løg|Løg|4|stk|i skiver", "Bløde løg|Smør|2|spsk|", "Bløde løg|Sukker|1|tsk|",
   "Sovs|Vand|3|dl|", "Sovs|Oksebouillon|1|terning|", "Sovs|Fløde|1|dl|",
   "Sovs|Maizena|1|spsk|udrørt i lidt koldt vand",
   "Tilbehør|Kartofler|1|kg|", "Tilbehør|Syltede rødbeder|||"],
  ["Tilbehør|Kog kartoflerne.|20",
   "Bløde løg|Steg løgene langsomt i smør med sukker ved middel varme, til de er bløde og gyldne. Tag dem op.|15",
   "Bøffer|Form 4 bøffer, krydr dem og steg dem i smør, ca. 3–4 minutter på hver side.|8",
   "Sovs|Kom vand, bouillon og fløde på panden og kog op, så stegeskyen løsnes. Jævn med maizena og smag til.|",
   "|Server bøfferne med løg, sovs, kartofler og rødbeder.|"])

recipe("Gullasch med paprika",
  "Ungarsk-inspireret gryderet. Kan laves dagen før og bliver kun bedre.", 6, 150,
  ["Hovedretter", "Oksekød", "Gryderet"],
  ["|Oksekød i tern|1|kg|fx tykkam eller bov", "|Rapsolie|2|spsk|", "|Løg|3|stk|hakket",
   "|Hvidløg|3|fed|", "|Paprika|3|spsk|", "|Røget paprika|1|tsk|", "|Spidskommen|1|tsk|",
   "|Tomatpuré|2|spsk|", "|Hakkede tomater|1|dåse|", "|Peberfrugt|2|stk|i stykker",
   "|Oksebouillon|1|terning|", "|Vand|5|dl|", "|Laurbærblade|2|stk|", "|Salt|||", "|Peber|||",
   "Tilbehør|Kartofler|1|kg|", "Tilbehør|Creme fraiche|2|dl|"],
  ["|Brun kødet i olien i en stor gryde i et par omgange. Tag det op.|",
   "|Svits løget blødt i gryden. Tilsæt hvidløg, paprika, spidskommen og tomatpuré og rist et minut – pas på paprikaen ikke brænder.|5",
   "|Kom kødet tilbage med tomater, vand, bouillon og laurbær. Lad det simre under låg.|90",
   "|Tilsæt peberfrugt og lad det simre, til kødet er mørt.|30",
   "Tilbehør|Kog kartoflerne. Smag gryden til og server med kartofler og en klat creme fraiche.|20"])

recipe("Kødboller i tomatsauce med spaghetti",
  "Italienske kødboller med parmesan, simret i tomatsauce.", 4, 50,
  ["Hovedretter", "Oksekød", "Pasta", "Italiensk", "Børnevenlig"],
  ["Kødboller|Hakket oksekød|500|g|", "Kødboller|Rasp|0.5|dl|", "Kødboller|Mælk|0.5|dl|",
   "Kødboller|Æg|1|stk|", "Kødboller|Parmesan|40|g|revet", "Kødboller|Hvidløg|1|fed|presset",
   "Kødboller|Persille|||hakket", "Kødboller|Salt|1|tsk|", "Kødboller|Olivenolie|2|spsk|",
   "Sauce|Løg|1|stk|finthakket", "Sauce|Hvidløg|2|fed|", "Sauce|Hakkede tomater|2|dåse|",
   "Sauce|Sukker|1|tsk|", "Sauce|Basilikum|||", "Sauce|Salt|||",
   "Servering|Spaghetti|400|g|", "Servering|Parmesan|30|g|"],
  ["Kødboller|Udblød rasp i mælk, og rør resten af ingredienserne i. Form ca. 20 kødboller.|",
   "Kødboller|Brun kødbollerne i olien i en stor pande eller gryde. Tag dem op.|8",
   "Sauce|Svits løg og hvidløg i panden. Tilsæt tomater og sukker og kog op.|",
   "Sauce|Kom kødbollerne i saucen og lad dem simre under låg.|20",
   "Servering|Kog spaghettien. Smag saucen til, rør basilikum i og server med parmesan.|"])

recipe("Enchiladas med oksekød og ost",
  "Fyldte tortillas bagt i tomatsauce med ost på toppen.", 4, 50,
  ["Hovedretter", "Oksekød", "Mexicansk", "Ovnret", "Børnevenlig"],
  ["Fyld|Hakket oksekød|500|g|", "Fyld|Løg|1|stk|", "Fyld|Hvidløg|2|fed|", "Fyld|Tacokrydderi|2|spsk|",
   "Fyld|Kidneybønner|1|dåse|skyllet", "Fyld|Majs (dåse)|1|dåse|",
   "Sauce|Passata|5|dl|", "Sauce|Spidskommen|1|tsk|", "Sauce|Chili|1|stk|", "Sauce|Salt|||",
   "Samling|Tortillas|8|stk|", "Samling|Revet ost|200|g|",
   "Servering|Creme fraiche|2|dl|", "Servering|Koriander|||", "Servering|Salat|||"],
  ["Fyld|Brun kødet med løg og hvidløg. Rør tacokrydderi, bønner og majs i.|10",
   "Sauce|Rør passata med spidskommen, hakket chili og salt.|",
   "Samling|Fordel lidt sauce i bunden af et ovnfast fad. Fyld og rul tortillaerne og læg dem tæt i fadet.|",
   "Samling|Hæld resten af saucen over, drys ost på og bag ved 200 °C, til osten er gylden.|20",
   "Servering|Server med creme fraiche, koriander og salat.|"])

recipe("Boeuf bourguignon",
  "Fransk oksegryde i rødvin – lang simretid gør kødet mørt. Lavet uden champignon.", 6, 210,
  ["Hovedretter", "Oksekød", "Gryderet", "Fransk", "Weekendmad", "Gæster"],
  ["|Oksekød i tern|1.2|kg|fx tykkam", "|Salt|||", "|Peber|||", "|Hvedemel|2|spsk|",
   "|Bacon|150|g|i tern", "|Rapsolie|1|spsk|", "|Skalotteløg|12|stk|pillede, hele",
   "|Gulerod|3|stk|i stykker", "|Hvidløg|3|fed|", "|Tomatpuré|2|spsk|", "|Rødvin|7|dl|",
   "|Oksebouillon|1|terning|", "|Frisk timian|4|stilk|", "|Laurbærblade|2|stk|", "|Persille|||",
   *MOS],
  ["|Krydr kødet og vend det i mel. Steg bacon sprødt i en stor gryde og tag det op.|",
   "|Brun kødet godt i baconfedtet i flere omgange. Tag det op.|15",
   "|Brun skalotteløg og gulerødder. Tilsæt hvidløg og tomatpuré og rist kort.|5",
   "|Kom kød og bacon tilbage, hæld rødvin ved og tilsæt bouillon, timian og laurbær.|",
   "|Lad gryden simre under låg ved lav varme (eller i ovnen ved 150 °C), til kødet er helt mørt.|150",
   MOS_STEP,
   "|Smag til, drys persille over og server med kartoffelmos.|"])

# ======================================================================= Svinekød
recipe("Hamburgerryg med honning-sennepsglace",
  "Server med flødekartofler (se opskrift) og ærter.", 6, 75,
  ["Hovedretter", "Svinekød", "Ovnret", "Dansk"],
  ["|Hamburgerryg|1.2|kg|", "|Honning|2|spsk|", "|Dijonsennep|2|spsk|", "|Brun farin|1|spsk|",
   "Tilbehør|Ærter (frost)|400|g|", "Tilbehør|Smør|1|spsk|"],
  ["|Læg hamburgerryggen i et fad med lidt vand og steg den ved 180 °C, til kernetemperaturen er ca. 60 °C.|50",
   "|Rør honning, sennep og farin sammen, pensl ryggen og steg videre, til glacen er karamelliseret og kernen er 65 °C.|15",
   "|Lad kødet hvile et par minutter, før det skæres i skiver.|5",
   "Tilbehør|Kog ærterne kort og vend dem i smør. Server med flødekartofler.|3"])

recipe("Svinekoteletter i fad med fløde og peberfrugt",
  "Nem ovnret, hvor koteletterne bliver møre i en cremet paprikasauce.", 4, 50,
  ["Hovedretter", "Svinekød", "Ovnret", "Dansk", "Børnevenlig"],
  ["|Svinekoteletter|4|stk|", "|Salt|||", "|Peber|||", "|Smør|1|spsk|",
   "|Løg|1|stk|i skiver", "|Peberfrugt|2|stk|i strimler", "|Fløde|3|dl|", "|Tomatpuré|2|spsk|",
   "|Paprika|2|tsk|", "|Hønsebouillon|1|terning|", "Tilbehør|Ris|300|g|"],
  ["|Krydr koteletterne og brun dem kort på begge sider i smør. Læg dem i et ovnfast fad.|5",
   "|Fordel løg og peberfrugt over. Rør fløde, tomatpuré, paprika og smuldret bouillon sammen og hæld det over.|",
   "|Bag ved 200 °C, til kødet er gennemstegt og saucen bobler.|30",
   "Tilbehør|Kog risene imens og server sammen.|"])

recipe("Gyros i pita med tzatziki",
  "Græsk gadekøkken. Server med jeres tzatziki og evt. pommes frites i pitaen.", 4, 40,
  ["Hovedretter", "Svinekød", "Panderet", "Hurtig"],
  ["Kød|Svinekoteletter|600|g|uden ben, i tynde strimler", "Kød|Olivenolie|3|spsk|",
   "Kød|Citron|0.5|stk|saften", "Kød|Hvidløg|2|fed|presset", "Kød|Oregano|2|tsk|",
   "Kød|Paprika|1|tsk|", "Kød|Spidskommen|0.5|tsk|", "Kød|Salt|1|tsk|",
   "Servering|Pitabrød|4|stk|", "Servering|Tomater|2|stk|", "Servering|Rødløg|1|stk|i tynde ringe",
   "Servering|Salat|||", "Servering|Pommes frites (frost)|400|g|kan udelades"],
  ["Kød|Vend kødet i marinaden og lad det trække mindst 15 minutter.|15",
   "Servering|Bag evt. pommes frites efter anvisningen.|",
   "Kød|Steg kødet ved høj varme i en meget varm pande i små portioner, så det får sprøde kanter.|8",
   "Servering|Lun pitabrødene og fyld dem med kød, tzatziki, tomat, løg, salat og evt. pommes frites.|"])

recipe("Bao buns med sprødt flæsk",
  "Bløde dampede boller med glaseret svinebryst og syltede grøntsager. Bollerne kan fryses.", 4, 180,
  ["Hovedretter", "Svinekød", "Asiatisk", "Weekendmad", "Gæster"],
  ["Boller|Hvedemel|300|g|", "Boller|Gær|7|g|", "Boller|Mælk|1.5|dl|lunken", "Boller|Sukker|2|spsk|",
   "Boller|Bagepulver|1|tsk|", "Boller|Rapsolie|1|spsk|", "Boller|Salt|0.5|tsk|",
   "Flæsk|Svinebryst|800|g|uden svær", "Flæsk|Soya|3|spsk|", "Flæsk|Honning|2|spsk|",
   "Flæsk|Hvidløg|2|fed|", "Flæsk|Ingefær|1|spsk|revet", "Flæsk|Sriracha|1|tsk|",
   "Syltede grøntsager|Agurk|1|stk|i tynde skiver", "Syltede grøntsager|Gulerod|1|stk|i julienne",
   "Syltede grøntsager|Radiser|6|stk|i skiver", "Syltede grøntsager|Eddike|1|dl|",
   "Syltede grøntsager|Sukker|2|spsk|", "Syltede grøntsager|Salt|1|tsk|",
   "Servering|Koriander|||", "Servering|Forårsløg|2|stk|", "Servering|Peanuts|2|spsk|hakkede"],
  ["Flæsk|Læg flæsket i et fad, dæk med folie og steg ved 160 °C, til det er mørt.|90",
   "Boller|Rør gæren ud i mælken, og ælt resten af ingredienserne i til en glat dej. Lad hæve.|60",
   "Syltede grøntsager|Varm eddike, sukker og salt, til det er opløst, og hæld over grøntsagerne.|",
   "Boller|Del dejen i 12 stykker, rul dem ovale, pensl med lidt olie og fold på midten. Læg hver på et stykke bagepapir og lad efterhæve.|20",
   "Boller|Damp bollerne i en dampindsats over kogende vand.|10",
   "Flæsk|Skær flæsket i skiver. Rør soya, honning, hvidløg, ingefær og sriracha sammen, og steg skiverne sprøde på en pande med glacen.|6",
   "Servering|Fyld bollerne med flæsk, syltede grøntsager, koriander, forårsløg og peanuts.|"])

recipe("Pasta all'amatriciana",
  "Romersk pasta med bacon, tomat og chili – søster til carbonara.", 4, 30,
  ["Hovedretter", "Svinekød", "Pasta", "Italiensk", "Hurtig"],
  ["|Spaghetti|400|g|gerne bucatini", "|Bacon|150|g|i tern, gerne guanciale", "|Olivenolie|1|spsk|",
   "|Løg|1|stk|finthakket", "|Chiliflager|0.5|tsk|", "|Flåede tomater|1|dåse|",
   "|Parmesan|60|g|gerne pecorino", "|Salt|||", "|Peber|||"],
  ["|Steg bacon langsomt i olien, til fedtet smelter og det er sprødt.|6",
   "|Tilsæt løg og chili og svits blødt. Kom tomaterne i, mos dem og lad saucen simre.|15",
   "|Kog pastaen al dente og vend den i saucen med lidt pastavand.|9",
   "|Server med revet ost og peber.|"])

recipe("Mørbrad med sennepssauce og ovnkartofler",
  "Hel mørbrad i ovn med cremet sennepssauce – uden champignon.", 4, 50,
  ["Hovedretter", "Svinekød", "Ovnret", "Dansk"],
  ["Mørbrad|Svinemørbrad|600|g|", "Mørbrad|Smør|1|spsk|", "Mørbrad|Salt|||", "Mørbrad|Peber|||",
   "Ovnkartofler|Kartofler|800|g|i tern", "Ovnkartofler|Olivenolie|2|spsk|",
   "Ovnkartofler|Rosmarin|2|stilk|", "Ovnkartofler|Salt|||",
   "Sennepssauce|Fløde|2.5|dl|", "Sennepssauce|Dijonsennep|2|spsk|", "Sennepssauce|Sennep|1|spsk|grov",
   "Sennepssauce|Hønsebouillon|0.5|terning|", "Sennepssauce|Persille|||hakket"],
  ["Ovnkartofler|Vend kartoflerne i olie, rosmarin og salt, og bag dem ved 200 °C.|35",
   "Mørbrad|Krydr mørbraden og brun den på alle sider i smør. Læg den i ovnen sammen med kartoflerne, til kernen er 65 °C.|18",
   "Sennepssauce|Kog fløde, sennep og bouillon op på panden og lad det koge lidt ind. Rør persille i.|5",
   "Mørbrad|Lad mørbraden hvile et par minutter, skær den i skiver og server med sauce og kartofler.|"])

# ======================================================================= Vegetar
recipe("Falafel i pita med tahinsauce",
  "Kikærterne skal udblødes natten over – brug tørrede, ikke kogte, så falaflerne holder formen.", 4, 60,
  ["Hovedretter", "Vegetar", "Mellemøstlig"],
  ["Falafel|Tørrede kikærter|250|g|udblødt natten over", "Falafel|Løg|1|stk|", "Falafel|Hvidløg|3|fed|",
   "Falafel|Persille|1|bundt|", "Falafel|Koriander|1|bundt|", "Falafel|Spidskommen|2|tsk|",
   "Falafel|Koriander (stødt)|1|tsk|", "Falafel|Bagepulver|1|tsk|", "Falafel|Hvedemel|2|spsk|",
   "Falafel|Salt|1|tsk|", "Falafel|Rapsolie|5|dl|til stegning",
   "Tahinsauce|Tahin|4|spsk|", "Tahinsauce|Citron|1|stk|saften", "Tahinsauce|Vand|0.5|dl|",
   "Tahinsauce|Hvidløg|1|fed|", "Tahinsauce|Salt|||",
   "Servering|Pitabrød|4|stk|", "Servering|Tomater|2|stk|", "Servering|Agurk|0.5|stk|",
   "Servering|Rødløg|0.5|stk|", "Servering|Salat|||"],
  ["Falafel|Hæld kikærterne fra og kør dem i en foodprocessor med løg, hvidløg, krydderurter og krydderier til en grov masse. Rør bagepulver, mel og salt i.|",
   "Falafel|Lad massen hvile koldt, og form små boller.|20",
   "Falafel|Frituresteg falaflerne i olie ved ca. 175 °C, til de er mørkebrune og sprøde.|5",
   "Tahinsauce|Pisk tahin, citron, hvidløg og vand til en glat sauce. Smag til med salt.|",
   "Servering|Fyld pitabrødene med falafel, grøntsager og tahinsauce.|"])

recipe("Pasta med pesto og cherrytomater",
  "Hjemmelavet pesto på 5 minutter. Kan også laves med købt pesto, så går det endnu hurtigere.", 4, 20,
  ["Hovedretter", "Vegetar", "Pasta", "Italiensk", "Hurtig", "Børnevenlig"],
  ["Pesto|Basilikum|2|potte|kun bladene", "Pesto|Pinjekerner|40|g|ristede", "Pesto|Parmesan|50|g|",
   "Pesto|Hvidløg|1|fed|", "Pesto|Olivenolie|1|dl|", "Pesto|Salt|||",
   "|Pasta|400|g|", "|Cherrytomater|250|g|halveret", "|Parmesan|20|g|til servering"],
  ["|Kog pastaen al dente.|10",
   "Pesto|Blend basilikum, pinjekerner, parmesan og hvidløg, og tilsæt olien i en stråle. Smag til med salt.|",
   "|Vend pastaen med pesto, lidt pastavand og tomater. Server med ekstra parmesan.|"])

# ======================================================================= Tilbehør
recipe("Tzatziki",
  "Til gyros, koftas, grillmad og kartofler.", 4, 15,
  ["Tilbehør", "Mellemøstlig"],
  ["|Græsk yoghurt|4|dl|", "|Agurk|1|stk|", "|Hvidløg|2|fed|presset", "|Olivenolie|1|spsk|",
   "|Citron|0.5|stk|saften", "|Dild|||eller mynte", "|Salt|||"],
  ["|Riv agurken groft, drys med salt og pres væden ud.|",
   "|Rør agurk, hvidløg, olie og citron i yoghurten. Smag til med salt og krydderurter, og lad den trække koldt.|15"])

recipe("Hummus",
  "Cremet hummus – blend længe for den glatteste konsistens.", 4, 10,
  ["Tilbehør", "Mellemøstlig"],
  ["|Kikærter|1|dåse|skyllet", "|Tahin|3|spsk|", "|Citron|1|stk|saften", "|Hvidløg|1|fed|",
   "|Spidskommen|0.5|tsk|", "|Vand|4|spsk|iskoldt", "|Olivenolie|2|spsk|", "|Salt|||",
   "|Paprika|||til pynt"],
  ["|Blend tahin og citronsaft luftigt. Tilsæt kikærter, hvidløg, spidskommen og salt, og blend med isvand i flere minutter, til hummussen er helt glat.|",
   "|Kom den i en skål, dryp med olivenolie og drys paprika over.|"])

recipe("Kartoffelbåde i ovn",
  "Sprøde kartoffelbåde til burgere og grillmad.", 4, 45,
  ["Tilbehør", "Børnevenlig"],
  ["|Kartofler|1|kg|i både, med skræl", "|Olivenolie|3|spsk|", "|Paprika|1|tsk|",
   "|Hvidløgspulver|0.5|tsk|", "|Salt|1|tsk|", "|Rosmarin|1|stilk|kan udelades"],
  ["|Dup kartoffelbådene tørre og vend dem i olie og krydderier.|",
   "|Fordel dem i ét lag på en bageplade med bagepapir og bag ved 220 °C, til de er gyldne og sprøde. Vend dem halvvejs.|35"])

recipe("Flødekartofler",
  "Klassisk tilbehør til steg og hamburgerryg.", 6, 70,
  ["Tilbehør", "Dansk", "Børnevenlig"],
  ["|Kartofler|1|kg|i tynde skiver", "|Fløde|3|dl|", "|Mælk|2|dl|", "|Hvidløg|2|fed|presset",
   "|Revet ost|100|g|", "|Salt|1|tsk|", "|Peber|||", "|Muskatnød|1|knsp|"],
  ["|Varm fløde, mælk, hvidløg, salt, peber og muskat op.|",
   "|Læg kartoffelskiverne lagvis i et smurt fad og hæld flødeblandingen over. Drys ost på toppen.|",
   "|Bag ved 200 °C, til kartoflerne er møre og toppen gylden.|50"])

# ======================================================================= Brød
recipe("Focaccia med rosmarin",
  "Luftigt italiensk brød. Dejen kan med fordel hæve i køleskabet natten over.", 8, 180,
  ["Brød", "Italiensk"],
  ["|Hvedemel|500|g|", "|Vand|4|dl|lunkent", "|Gær|10|g|", "|Salt|10|g|", "|Olivenolie|6|spsk|",
   "|Rosmarin|2|stilk|", "|Salt|||groft, til toppen"],
  ["|Rør gær ud i vandet, tilsæt mel og salt og rør til en klistret dej. Rør 2 spsk olie i.|",
   "|Lad dejen hæve tildækket, og fold den et par gange undervejs.|90",
   "|Hæld 3 spsk olie i en bradepande, læg dejen i og stræk den ud. Lad den hæve igen.|30",
   "|Tryk huller i dejen med fingrene, dryp med resten af olien og drys rosmarin og groft salt over. Bag ved 220 °C, til den er gylden.|25"])

recipe("Hjemmelavede pitabrød",
  "Pitabrød, der puster sig op i en meget varm ovn. Brug dem til gyros og falafel.", 8, 90,
  ["Brød", "Mellemøstlig"],
  ["|Hvedemel|400|g|", "|Gær|10|g|", "|Vand|2.5|dl|lunkent", "|Olivenolie|2|spsk|",
   "|Salt|1|tsk|", "|Sukker|1|tsk|"],
  ["|Rør gær ud i vandet med sukker. Ælt mel, salt og olie i til en smidig dej. Lad hæve.|60",
   "|Sæt ovnen på 250 °C med en bageplade indeni. Del dejen i 8 stykker og rul dem ud til ca. ½ cm tykke runde brød.|",
   "|Bag 2–3 ad gangen på den varme plade, til de puster sig op.|5",
   "|Pak de færdige brød ind i et viskestykke, så de holder sig bløde.|"])


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
        print(len(R), "opskrifter")
    elif len(sys.argv) > 2 and sys.argv[1] == "chunk":
        n = int(sys.argv[2]); size = 9
        print(TEMPLATE.format(payload=payload(R[n * size:(n + 1) * size]), created_by=CREATED_BY))
