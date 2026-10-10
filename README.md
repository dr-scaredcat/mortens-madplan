# Astons Køkken

Husstandens app til opskrifter, indkøbsliste, varelager og ugeplan — bygget i samme stil som Astons Bar.

- **Frontend:** TanStack Start + React, Tailwind og shadcn/ui
- **Database og login:** Supabase (samme projekt som Astons Bar og Fællesrejser, men i sit eget schema `madplan`)
- **Hosting:** Cloudflare Workers

## Status

**Fase 1 (færdig):** login og adgang, temaer, app-navn, opskrifter med tags, søgning, billeder, skalering, score og noter, import fra link, "hold skærmen tændt" og madlavningstilstand.

**Fase 2 (færdig):** indkøbsliste med kategorier og live-opdatering mellem telefoner, tilføjelse fra opskrifter, fritekst-varer og varelager med "løbet tør".

**Fase 3 (færdig):** ugeplan med forslag ud fra score, tid siden sidst, weekendmad og variation i hovedingrediens; låste dage, nyt forslag og vælg selv; standarduge; hele ugen på indkøbslisten; automatisk "spist"-registrering og "Hvordan var den?"-forespørgsler.

## Opsætning

1. **Databasen:** kør de to SQL-filer i `supabase/migrations/` i rækkefølge (Supabase → SQL Editor). De opretter schemaet `madplan` med tabeller, sikkerhedsregler, billed-bucket og startdata, og gør `mortenrose@protonmail.com` til admin.
2. **Eksponér schemaet:** Supabase → Project Settings → Data API → *Exposed schemas*: tilføj `madplan`.
3. **Installér og kør lokalt:**
   ```sh
   npm install
   npm run dev
   ```
4. **Deploy:**
   ```sh
   npm run deploy
   ```

## Adgang

Brugerne er de samme konti som i Fællesrejser. En admin giver adgang under **Admin → Adgang**.
