"""
Engangsimport af opskrifter fra Paprika (eksport 10.10.2026) til Astons Køkken.

Ingredienslinjerne i Paprika er fritekst med afsnit og noter, så de er
gennemgået og matchet mod ingredienskataloget i hånden herunder. Scriptet
genererer én SQL-fil, der kan køres i Supabase (idempotent: opskrifter med
samme titel springes over).

Brug:  python3 scripts/paprika_import.py > import.sql
"""
import json

# ── Nye ingredienser til kataloget: (navn, kategori, standardenhed) ──────────
NEW_INGREDIENTS = [
    ("Kardemomme", "Krydderier & smagsgivere", "tsk"),
    ("Kærnemælk", "Mejeri & æg", "dl"),
    ("Margarine", "Mejeri & æg", "g"),
    ("Flormelis", "Kolonial", "g"),
    ("Kakao", "Kolonial", "spsk"),
    ("Radiser", "Frugt & grønt", "g"),
    ("Rygeost", "Mejeri & æg", "g"),
    ("Lammekød", "Kød & fisk", "g"),
    ("Tahin", "Kolonial", "spsk"),
    ("Sumak", "Krydderier & smagsgivere", "tsk"),
    ("Ricotta", "Mejeri & æg", "g"),
    ("Svinespæk", "Kød & fisk", "g"),
    ("Pølsetarm", "Kød & fisk", None),
    ("Pizzamel (tipo 00)", "Kolonial", "g"),
    ("Durummel", "Kolonial", "g"),
    ("Hvidvinseddike", "Kolonial", "spsk"),
    ("Misopasta", "Krydderier & smagsgivere", "g"),
    ("Pulled pork", "Kød & fisk", "g"),
    ("Udonnudler", "Kolonial", "g"),
    ("Østershatte", "Frugt & grønt", "g"),
    ("Mandler", "Kolonial", "g"),
]

# Nye tags i gruppen "Type"
NEW_TAGS = ["Brød", "Kage", "Snacks", "Tilbehør"]

NEVER = "Aldrig i ugeplan"

# ── Opskrifterne ─────────────────────────────────────────────────────────────
# Ingrediens: (afsnit, mængde, enhed, katalognavn, note)
# Trin:       (afsnit, tekst, timer-minutter)
R = []

R.append(dict(
    title="Fødselsdagsboller", servings=32, description="Ca. 32 boller.",
    tags=["Brød", NEVER],
    ingredients=[
        (None, 200, "g", "Smør", None),
        (None, 5, "dl", "Sødmælk", None),
        (None, 50, "g", "Gær", None),
        (None, 1, "tsk", "Salt", "groft"),
        (None, 140, "g", "Sukker", None),
        (None, 2, "stk", "Æg", None),
        (None, 1200, "g", "Hvedemel", "hold lidt igen – der er forskel på mel"),
        (None, 2, "tsk", "Kardemomme", None),
        (None, 2, "stk", "Æg", "til pensling"),
    ],
    steps=[
        (None, "Kom smør og mælk i en gryde. Varm det langsomt op, til smørret er næsten helt smeltet. Sluk for gryden og lad blandingen blive lunken (lillefingervarm). Det gør ikke noget, at lidt af smørret ikke er helt smeltet.", None),
        (None, "Kom blandingen i en skål (gerne røremaskine). Tilsæt gær og rør rundt.", None),
        (None, "Tilsæt salt, sukker og æg.", None),
        (None, "Tilsæt mel. Hold lidt igen – der kan være forskel på mel, så du skal måske bruge lidt mindre eller mere. Lad dejen køre på røremaskinen i cirka 10 minutter ved lav hastighed. Dejen skal være blank og smidig, men ikke klistre for meget. Lad dejen hæve i skålen med et viskestykke over i 60 minutter.", 60),
        (None, "Form bollerne – cirka 70 g stykket. Tril dem på et bord (uden mel) og placér dem på en bageplade. Sæt et ildfast fad med kogende vand nederst i ovnen, og sæt bagepladen med boller ind, så de hæver med damp. Tænd ikke for ovnen. Lad dem hæve i 30 minutter.", 30),
        (None, "Tag pladen med boller og fadet ud, og tænd ovnen på 210 grader (ikke varmluft).", None),
        (None, "Pensl bollerne. Når ovnen er varm (efter cirka 15 minutter), sættes bagepladen i midten af ovnen.", None),
        (None, "Bag i 10-12 minutter. Hold øje – der er forskel på ovne. Bank under bunden for at tjekke, at de er færdige; de skal lyde hule.", 12),
    ],
))

R.append(dict(
    title="Kanelkage", servings=4, description=None,
    tags=["Kage", NEVER],
    ingredients=[
        ("Dej", 600, "g", "Hvedemel", None),
        ("Dej", 500, "g", "Sukker", None),
        ("Dej", 7, "dl", "Kærnemælk", None),
        ("Dej", 3, "tsk", "Natron", None),
        ("Dej", 175, "g", "Margarine", "smeltet"),
        ("Dej", 12, "tsk", "Kanel", "1 brev à 30 g"),
        ("Glasur", 175, "g", "Margarine", "smeltet"),
        ("Glasur", 350, "g", "Flormelis", None),
        ("Glasur", 2, "spsk", "Kakao", None),
        ("Glasur", 1, "stk", "Æg", None),
    ],
    steps=[
        (None, "Forvarm ovnen til 200 grader over-/undervarme.", None),
        (None, "Rør alle ingredienser til dejen sammen og hæld den i en stor bradepande (smurt eller med bagepapir).", None),
        (None, "Bag kagen i 30-40 minutter.", 35),
        (None, "Pisk glasuren sammen og smør den på den afkølede kage.", None),
    ],
))

R.append(dict(
    title="Kartoffelsalat med rygeost og radiser", servings=4, description=None,
    tags=["Vegetar", "Salat", "Dansk"],
    ingredients=[
        (None, 400, "g", "Kartofler", None),
        (None, 100, "g", "Radiser", None),
        (None, 300, "g", "Spidskål", None),
        (None, 50, "ml", "Mayonnaise", None),
        (None, 170, "g", "Rygeost", "100-170 g"),
        (None, 1, "stk", "Citron", None),
        (None, 1, "stk", "Rødløg", None),
        (None, 0.5, "tsk", "Sukker", None),
        (None, 1, "spsk", "Eddike", None),
        (None, None, None, "Salt", None),
        (None, None, None, "Peber", None),
    ],
    steps=[
        (None, "Kog kartoflerne: Kog dem møre i let saltet vand – gerne tidligt på dagen eller aftenen før.", None),
        (None, "Sylt rødløg: Hak rødløget fint og kom det i en stor skål. Tilsæt saften fra citronen og ½ tsk sukker.", None),
        (None, "Forbered grøntsagerne: Skær spidskålen i mundrette stykker og radiserne i tynde skiver. Kom dem i en separat skål og krydr med salt og 1 spsk eddike. Vend godt sammen og lad det trække.", None),
        (None, "Rør dressingen: Kom mayonnaise og rygeost i skålen med rødløg og rør godt sammen.", None),
        (None, "Rør salaten: Skær kartoflerne i skiver og bland alle dele sammen. Smag til med salt og peber.", None),
    ],
))

R.append(dict(
    title="Kebab à la Umut", servings=4,
    description="Opskrift fra Umut. Kebab og salsa laves gerne dagen forinden.",
    tags=["Lam", "Mellemøstlig"],
    ingredients=[
        ("Kebab", 1000, "g", "Lammekød", "filet eller culotte – svin eller okse kan også bruges"),
        ("Kebab", 1, "spsk", "Paprika", None),
        ("Kebab", 1, "spsk", "Spidskommen", None),
        ("Kebab", 1, "spsk", "Peber", None),
        ("Kebab", 2, "fed", "Hvidløg", "finthakket"),
        ("Kebab", 10, "g", "Salt", None),
        ("Kebab", 2, None, "Frisk timian", "kviste"),
        ("Fladbrød", 400, "g", "Hvedemel", None),
        ("Fladbrød", 10, "g", "Salt", None),
        ("Fladbrød", None, None, "Vand", None),
        ("Chilisovs", 2, "spsk", "Tomatpuré", None),
        ("Chilisovs", 2, "spsk", "Chiliflager", None),
        ("Chilisovs", 2, "tsk", "Spidskommen", None),
        ("Chilisovs", 2, "tsk", "Paprika", None),
        ("Chilisovs", 1, "tsk", "Karry", None),
        ("Chilisovs", 1, "spsk", "Soya", None),
        ("Chilisovs", 1, "spsk", "Olivenolie", None),
        ("Chilisovs", None, None, "Peber", "en smule"),
        ("Tahindressing", None, None, "Græsk yoghurt", "1 del"),
        ("Tahindressing", None, None, "Tahin", "1 del"),
        ("Tahindressing", None, None, "Salt", None),
        ("Tomatsalsa", None, None, "Tomater", None),
        ("Tomatsalsa", 0.5, "stk", "Rødløg", None),
        ("Tomatsalsa", None, None, "Forårsløg", None),
        ("Tomatsalsa", 1, "stk", "Peberfrugt", "rød"),
        ("Tomatsalsa", None, None, "Koriander", None),
        ("Tomatsalsa", None, None, "Lime", None),
        ("Tomatsalsa", None, None, "Citron", None),
        ("Tomatsalsa", None, None, "Soya", None),
        ("Tomatsalsa", 2, "spsk", "Tomatpuré", None),
        ("Tomatsalsa", 1, "fed", "Hvidløg", None),
        ("Løgsalat", 0.5, "stk", "Rødløg", None),
        ("Løgsalat", None, None, "Forårsløg", None),
        ("Løgsalat", None, None, "Persille", None),
        ("Løgsalat", None, None, "Olivenolie", None),
        ("Løgsalat", None, None, "Sumak", None),
        ("Agurkesalat", 1, "stk", "Agurk", None),
        ("Agurkesalat", None, None, "Dild", None),
        ("Agurkesalat", 4, "spsk", "Creme fraiche", "38 %"),
        ("Agurkesalat", None, None, "Salt", None),
        ("Spidskålssalat", 1, "stk", "Spidskål", "hvidkål kan også bruges"),
        ("Spidskålssalat", None, None, "Citron", None),
        ("Spidskålssalat", None, None, "Olivenolie", None),
        ("Spidskålssalat", None, None, "Salt", None),
    ],
    steps=[
        ("Kebab", "Marineres gerne dagen før.", None),
        ("Kebab", "Pud kødet af for de værste sener og skær det i tynde stykker i passende størrelse. Fedt må gerne komme med.", None),
        ("Kebab", "Vend kødet med lidt olivenolie, salt, peber, paprika, spidskommen, finthakket frisk timian og finthakket hvidløg.", None),
        ("Kebab", "Lad kødet trække så længe som muligt, gerne fra dagen før.", None),
        ("Kebab", "Lynsteg kødet på en godt varm pande.", None),
        ("Fladbrød", "Bland mel og salt med vand til en passende konsistens.", None),
        ("Fladbrød", "Dæk dejen til og lad den hvile.", None),
        ("Fladbrød", "Rul dejen ud til tynde fladbrød.", None),
        ("Fladbrød", "Bag brødene på en tør, varm pande. De må gerne få lidt grillmærker.", None),
        ("Tahindressing", "Rør tahin og yoghurt sammen og smag til med salt.", None),
        ("Chilisovs", "Laves gerne dagen før. Rør alle ingredienser sammen til en chilisovs. Hvis sovsen har stået, kan olien skille – rør den bare sammen igen.", None),
        ("Tomatsalsa", "Laves gerne dagen før. Ønskes en meget fin salsa, kan alle ingredienser køres i foodprocessor.", None),
        ("Tomatsalsa", "Hak tomater, løg, forårsløg, peberfrugt, hvidløg og koriander så groft eller fint, som du ønsker salsaen.", None),
        ("Tomatsalsa", "Bland det hele med lidt soya, limesaft, lidt limeskal, citronsaft, lidt citronskal og tomatpuré.", None),
        ("Tomatsalsa", "Smag til med en smule salt.", None),
        ("Løgsalat", "Skær løg og forårsløg i tynde strimler, og hak persillen fint.", None),
        ("Løgsalat", "Bland med sumak, lidt olivenolie, citronsaft og en smule salt.", None),
        ("Agurkesalat", "Skær agurken i tynde skiver (nemt på foodprocessor). Salt skiverne ganske let og vend dem i saltet.", None),
        ("Agurkesalat", "Hak lidt dild fint og bland det i creme fraiche. Salt dressingen let.", None),
        ("Agurkesalat", "Pres vandet fra agurkeskiverne med et rent viskestykke, og vend skiverne i dressingen.", None),
        ("Spidskålssalat", "Hak spidskålen i fine strimler og marinér med lidt citronsaft.", None),
        ("Spidskålssalat", "Salt kålen ganske let og vend saltet rundt, så der trækker vand ud.", None),
        ("Spidskålssalat", "Når kålen er faldet sammen, presses væsken godt ud med et rent viskestykke. Vend kålen i lidt olivenolie, citronsaft og salt.", None),
        ("Servering", "Smør dressing i en stribe på fladbrødet, og læg de øvrige ingredienser på efter ønske. Servér rullet i bagepapir og sølvpapir.", None),
    ],
))

R.append(dict(
    title="Medister", servings=4, description=None,
    tags=["Svinekød", "Dansk"],
    ingredients=[
        (None, 1000, "g", "Hakket svinekød", "eller fx nakkefilet, du selv hakker"),
        (None, 200, "g", "Svinespæk", "hakket"),
        (None, 4, "dl", "Fond", "suppe kogt på svinekød/ben med porre, løg og gulerod (ikke selleri) – eller kraftig svinefond"),
        (None, None, None, "Pølsetarm", None),
        (None, None, None, "Salt", None),
        (None, None, None, "Peber", None),
    ],
    steps=[
        (None, "Hak svinekødet 1½ gang, dvs. halvdelen køres gennem maskinen to gange. Kør gerne spækket igennem, hvis det er grofthakket.", None),
        (None, "Ælt kød og spæk sammen, og rør farsen sej med salt (ca. 15 g salt pr. kg kød).", None),
        (None, "Rør suppen i farsen – den skal være lind, men ikke alt for tynd. Smag til med salt og peber (2-3 g pr. kg kød).", None),
        (None, "Læg tarmen i blød i lunkent vand, og kør lidt vand igennem den, så den er \"åben\".", None),
        (None, "Sæt tarmen på pølsehornet og stop pølsen. Undgå luft så vidt muligt – tarmen kan prikkes med en nål, hvis det sker.", None),
        (None, "Kog pølsen 5-10 minutter. Kogevandet kan bruges til saucen.", 10),
        (None, "Steg medisteren inden servering.", None),
    ],
))

R.append(dict(
    title="Pizzadej", servings=4, description="To varianter: hurtig dej og langtidshævet dej. Vælg én af dem.",
    tags=["Pizza", "Italiensk"],
    ingredients=[
        ("Hurtig dej", 2.5, "dl", "Vand", "lunkent"),
        ("Hurtig dej", 0.75, "tsk", "Salt", "fint havsalt"),
        ("Hurtig dej", 15, "g", "Gær", None),
        ("Hurtig dej", 1, "knsp", "Sukker", None),
        ("Hurtig dej", None, None, "Citron", "3-4 dråber saft"),
        ("Hurtig dej", 400, "g", "Pizzamel (tipo 00)", None),
        ("Hurtig dej", None, None, "Hvedemel", "til udrulning"),
        ("Langtidshævet dej", 350, "g", "Pizzamel (tipo 00)", None),
        ("Langtidshævet dej", 50, "g", "Durummel", "fint"),
        ("Langtidshævet dej", 2.5, "dl", "Vand", "lunkent"),
        ("Langtidshævet dej", 10, "g", "Gær", "8-10 g"),
        ("Langtidshævet dej", 1.75, "tsk", "Salt", "fint havsalt"),
        ("Langtidshævet dej", None, None, "Hvedemel", "til udrulning"),
    ],
    steps=[
        ("Hurtig dej", "Rør vand, salt, gær, sukker og citronsaft sammen.", None),
        ("Hurtig dej", "Tilsæt melet lidt ad gangen.", None),
        ("Hurtig dej", "Ælt dejen omhyggeligt og længe, til den er blank og elastisk.", None),
        ("Hurtig dej", "Dæk skålen med plastfilm og lad dejen hæve til mindst dobbelt størrelse på et lunt sted (2-3 timer).", 150),
        ("Hurtig dej", "Slå dejen ned, del den i portioner og form dem til kugler. Vend dem i mel og lad dem efterhæve på køkkenbordet i 15-30 minutter.", 20),
        ("Hurtig dej", "Tænd ovnen på maks. almindelig over-/undervarme, helst 275 grader – gerne 300. Drys mel på bordet og rul en dejkugle ud til en stor, ca. 3-4 mm tynd bund. Den behøver ikke være rund, bare den kan være på en bageplade.", None),
        ("Hurtig dej", "Rul bunden let om kagerullen og flyt den over på bagepapir. Gør det samme med den anden portion – så er bundene klar til fyld.", None),
        ("Langtidshævet dej", "Vej de to slags mel af hver for sig.", None),
        ("Langtidshævet dej", "Rør ½ dl af vandet, salt og gær med 4 spsk af hvedemelet (tipo 00) til en fordej med jævn pastakonsistens.", None),
        ("Langtidshævet dej", "Dæk fordejen med plastfilm og lad den hæve til dobbelt størrelse på et lunt sted (ca. 40 minutter).", 40),
        ("Langtidshævet dej", "Rør resten af hvedemelet, durummelet og vandet i fordejen, og ælt omhyggeligt, til dejen er blank og elastisk.", None),
        ("Langtidshævet dej", "Dæk skålen med plastfilm og lad dejen hæve langsomt et køligt sted (5-10 grader) i 12-18 timer.", None),
        ("Langtidshævet dej", "Slå dejen ned og lad den efterhæve – så er den klar til at blive rullet ud og få fyld på.", None),
    ],
))

R.append(dict(
    title="Pulled pork-ramen", servings=2, description=None,
    tags=["Svinekød", "Asiatisk", "Suppe"],
    ingredients=[
        ("Syltede gulerødder", 1, "stk", "Gulerod", None),
        ("Syltede gulerødder", 15, "ml", "Hvidvinseddike", None),
        ("Syltede gulerødder", 0.5, "tsk", "Sukker", None),
        ("Syltede gulerødder", 1, "spsk", "Vand", None),
        ("Misosuppe", 300, "g", "Pulled pork", None),
        ("Misosuppe", 1, "fed", "Hvidløg", None),
        ("Misosuppe", 2, "tsk", "Ingefær", "revet"),
        ("Misosuppe", 50, "g", "Misopasta", None),
        ("Misosuppe", 10, "ml", "Fiskesauce", None),
        ("Misosuppe", 0.5, "l", "Hønsebouillon", "kyllingebouillon"),
        ("Misosuppe", 25, "ml", "Soya", None),
        ("Misosuppe", 1, "tsk", "Sukker", None),
        ("Misosuppe", 0.5, "stk", "Lime", None),
        ("Nudler", 150, "g", "Udonnudler", None),
        ("Topping", 200, "g", "Østershatte", None),
        ("Topping", None, None, "Sukkerærter", None),
        ("Topping", 1, "stk", "Chili", "rød"),
        ("Topping", 2, "stk", "Forårsløg", None),
    ],
    steps=[
        ("Syltede gulerødder", "Skær guleroden i tynde stave.", None),
        ("Syltede gulerødder", "Bland hvidvinseddike, sukker, vand og et nip salt, og vend guleroden i lagen. Hæld lagen fra inden servering.", None),
        ("Stegte svampe", "Hak svampene groft. Varm lidt olie op i en gryde ved høj varme og steg svampene i 3-4 minutter.", 4),
        ("Stegte svampe", "Krydr med salt og peber, og læg dem over på en tallerken.", None),
        ("Misosuppe", "Sæt samme gryde på middelhøj varme. Riv ingefær fint og pres hvidløg.", None),
        ("Misosuppe", "Kom svinekød (inkl. væsken fra pakken), kyllingebouillon, ingefær, hvidløg, misopasta, sojasauce, sukker og fiskesauce i gryden. Lad det simre 10-12 minutter under låg.", 12),
        ("Misosuppe", "Træk kødet fra hinanden med to gafler i gryden.", None),
        ("Nudler", "Bring saltet vand i kog i en anden gryde og kog nudlerne efter anvisningen.", None),
        ("Nudler", "Tilsæt nudler og limesaft til misosuppen lige inden servering, og vend sammen.", None),
        ("Topping", "Halvér sukkerærterne på langs. Flæk chilien, fjern kernerne og skær den i tynde skiver.", None),
        ("Servering", "Anret nudlerne i dybe skåle. Top med pulled pork, svampe, sukkerærter og gulerod, og drys med forårsløg og chili.", None),
    ],
))

R.append(dict(
    title="Pølsehorn", servings=32, description="32 stk.",
    tags=["Brød", NEVER],
    ingredients=[
        (None, 25, "g", "Gær", None),
        (None, 3, "dl", "Sødmælk", None),
        (None, 100, "g", "Smør", None),
        (None, 1, "tsk", "Salt", None),
        (None, 1, "tsk", "Sukker", None),
        (None, 1, "stk", "Æg", None),
        (None, 600, "g", "Hvedemel", None),
        (None, 32, "stk", "Pølser", None),
        (None, 1, "stk", "Æg", "til pensling"),
    ],
    steps=[
        (None, "Lun mælken og rør gæren ud heri.", None),
        (None, "Smuldr smørret i melet med fingrene, til det ligner revet ost.", None),
        (None, "Tilsæt mælken med gær, salt, sukker og æg, og ælt dejen glat og smidig. Lad den hæve overdækket i 1 time.", 60),
        (None, "Ælt dejen let igennem og del den i 4 lige store stykker. Rul hvert stykke ud til en cirkel og skær den i 8 trekanter (32 i alt).", None),
        (None, "Læg en pølse på hver trekant og rul hornet.", None),
        (None, "Lad hornene efterhæve i 30 minutter. Pensl med æg og bag dem 15-20 minutter i en forvarmet ovn ved 200 grader (alm. ovn).", 30),
    ],
))

R.append(dict(
    title="Saltede mandler", servings=4, description=None,
    tags=["Snacks", NEVER],
    ingredients=[
        (None, 7, "spsk", "Salt", "groft"),
        (None, 4, "dl", "Vand", None),
        (None, 400, "g", "Mandler", None),
        (None, None, None, "Olivenolie", None),
        (None, None, None, "Salt", "groft"),
    ],
    steps=[
        (None, "Kog vandet op med salt, til saltet er opløst.", None),
        (None, "Tilsæt mandlerne og sluk for varmen. Lad mandlerne trække i 20 minutter.", 20),
        (None, "Dryp mandlerne af, vend dem i olie og groft salt, og læg dem på bagepapir.", None),
        (None, "Bag dem i ovnen ved 180 grader i 10-12 minutter. Vend dem undervejs.", 12),
    ],
))

R.append(dict(
    title="Tomatsalsa", servings=4, description="Laves gerne dagen før.",
    tags=["Tilbehør", NEVER],
    ingredients=[
        (None, None, None, "Tomater", None),
        (None, None, None, "Rødløg", None),
        (None, None, None, "Forårsløg", None),
        (None, None, None, "Peberfrugt", "rød"),
        (None, None, None, "Koriander", None),
        (None, None, None, "Lime", None),
        (None, None, None, "Citron", None),
        (None, None, None, "Soya", None),
        (None, None, None, "Tomatpuré", None),
        (None, None, None, "Hvidløg", None),
    ],
    steps=[
        (None, "Ønskes en meget fin salsa, kan alle ingredienser blot køres i foodprocessor.", None),
        (None, "Hak tomater, løg, forårsløg, peberfrugt, hvidløg og koriander så groft eller fint, som du ønsker salsaen.", None),
        (None, "Bland det hele med lidt soya, limesaft, lidt limeskal, citronsaft, lidt citronskal og tomatpuré.", None),
        (None, "Smag til med en smule salt.", None),
    ],
))


def build_sql() -> str:
    """Kompakt SQL: data som JSON + én plpgsql-blok, der indsætter det hele."""
    data = {
        "ingredients": [{"n": n, "c": c, "u": u} for n, c, u in NEW_INGREDIENTS],
        "tags": NEW_TAGS,
        "recipes": [
            {
                "t": r["title"],
                "d": r["description"],
                "s": r["servings"],
                "tags": r["tags"],
                "i": [[sec, amt, unit, name, note] for sec, amt, unit, name, note in r["ingredients"]],
                "st": [[sec, text, timer] for sec, text, timer in r["steps"]],
            }
            for r in R
        ],
    }
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("$", "")
    return f"""-- Engangsimport fra Paprika — genereret af scripts/paprika_import.py
do $import$
declare
  d jsonb := $json${payload}$json$::jsonb;
  ing jsonb; rec jsonb; item jsonb; t text; rid uuid; iid uuid; idx int; missing text;
  owner uuid := (select id from auth.users where lower(email) = 'mortenrose@protonmail.com');
begin
  -- Nye ingredienser
  for ing in select * from jsonb_array_elements(d->'ingredients') loop
    insert into madplan.ingredients (name, category_id, default_unit)
    select ing->>'n', (select id from madplan.shop_categories where name = ing->>'c'), ing->>'u'
    where not exists (select 1 from madplan.ingredients where lower(name) = lower(ing->>'n'));
  end loop;

  -- Vand skal ikke på indkøbslisten: basisvare der altid er "på lager"
  update madplan.ingredients set is_staple = true, in_stock = true where lower(name) = 'vand';

  -- Nye tags i gruppen "Type"
  for t in select * from jsonb_array_elements_text(d->'tags') loop
    insert into madplan.tags (name, group_id, sort_order)
    select t, (select id from madplan.tag_groups where name = 'Type'), 100
    where not exists (select 1 from madplan.tags where lower(name) = lower(t));
  end loop;

  -- Tjek at alle ingredienser og tags findes, før noget oprettes
  select string_agg(distinct x->>3, ', ') into missing
  from jsonb_array_elements(d->'recipes') r, jsonb_array_elements(r->'i') x
  where not exists (select 1 from madplan.ingredients i where lower(i.name) = lower(x->>3));
  if missing is not null then raise exception 'Mangler ingredienser: %', missing; end if;

  select string_agg(distinct x, ', ') into missing
  from jsonb_array_elements(d->'recipes') r, jsonb_array_elements_text(r->'tags') x
  where not exists (select 1 from madplan.tags tg where lower(tg.name) = lower(x));
  if missing is not null then raise exception 'Mangler tags: %', missing; end if;

  -- Opskrifter (springes over, hvis titlen allerede findes)
  for rec in select * from jsonb_array_elements(d->'recipes') loop
    if exists (select 1 from madplan.recipes where lower(title) = lower(rec->>'t')) then
      raise notice 'Springer over: %', rec->>'t';
      continue;
    end if;

    insert into madplan.recipes (title, description, servings, created_by)
    values (rec->>'t', rec->>'d', (rec->>'s')::int, owner)
    returning id into rid;

    idx := 0;
    for item in select * from jsonb_array_elements(rec->'i') loop
      select id into iid from madplan.ingredients where lower(name) = lower(item->>3);
      insert into madplan.recipe_ingredients (recipe_id, ingredient_id, amount, unit, note, section, sort_order)
      values (rid, iid, (item->>1)::numeric, item->>2, item->>4, item->>0, idx);
      idx := idx + 1;
    end loop;

    idx := 0;
    for item in select * from jsonb_array_elements(rec->'st') loop
      insert into madplan.recipe_steps (recipe_id, text, timer_minutes, section, sort_order)
      values (rid, item->>1, (item->>2)::int, item->>0, idx);
      idx := idx + 1;
    end loop;

    insert into madplan.recipe_tags (recipe_id, tag_id)
    select rid, tg.id from madplan.tags tg
    where lower(tg.name) in (select lower(x) from jsonb_array_elements_text(rec->'tags') x);
  end loop;
end
$import$;
"""


if __name__ == "__main__":
    print(build_sql())
