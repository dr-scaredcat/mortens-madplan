-- ════════════════════════════════════════════════════════════════════════════
-- Vin til retten
--
-- En fælles liste med 15 vinkategorier (type + stil), som både Astons Køkken
-- (vinforslag på opskrifter) og Astons Bar (vinene i vinkøleskabet) peger på.
-- Listen ligger i public, fordi Astons Bar bruger det schema; den læses af
-- begge apps og ændres kun via migrationer.
-- ════════════════════════════════════════════════════════════════════════════

create table if not exists public.wine_styles (
  id text primary key,
  wine_label text not null,          -- "Rødvin", "Hvidvin" … som vist i Astons Køkken
  style text not null,               -- "Let og frugtig" …
  bar_type text,                     -- vinens type i Astons Bar (rød, hvid, rosé, mousserende, dessertvin) — null for øl
  neighbors text[] not null default '{}', -- nærmeste bud, i prioriteret rækkefølge
  sort_order int not null default 0
);

insert into public.wine_styles (id, wine_label, style, bar_type, neighbors, sort_order) values
  ('rod-let-frugtig',         'Rødvin',      'Let og frugtig',          'rød',         '{rod-mellem-frugtig,rod-mellem-syrlig}', 10),
  ('rod-mellem-syrlig',       'Rødvin',      'Mellemfyldig og syrlig',  'rød',         '{rod-mellem-frugtig,rod-let-frugtig}', 20),
  ('rod-mellem-frugtig',      'Rødvin',      'Mellemfyldig og frugtig', 'rød',         '{rod-let-frugtig,rod-mellem-syrlig,rod-fyldig-kraftig}', 30),
  ('rod-fyldig-kraftig',      'Rødvin',      'Fyldig og kraftig',       'rød',         '{rod-fyldig-struktureret,rod-mellem-frugtig}', 40),
  ('rod-fyldig-struktureret', 'Rødvin',      'Fyldig og struktureret',  'rød',         '{rod-fyldig-kraftig,rod-mellem-syrlig}', 50),
  ('hvid-let-frisk',          'Hvidvin',     'Let, frisk og tør',       'hvid',        '{hvid-aromatisk-tor,hvid-mellem-rund}', 60),
  ('hvid-mellem-rund',        'Hvidvin',     'Mellemfyldig og rund',    'hvid',        '{hvid-let-frisk,hvid-aromatisk-tor}', 70),
  ('hvid-aromatisk-halvtor',  'Hvidvin',     'Aromatisk og halvtør',    'hvid',        '{hvid-aromatisk-tor}', 80),
  ('hvid-aromatisk-tor',      'Hvidvin',     'Aromatisk og tør',        'hvid',        '{hvid-let-frisk,hvid-aromatisk-halvtor}', 90),
  ('rose-tor-frisk',          'Rosé',        'Tør og frisk',            'rosé',        '{}', 100),
  ('mousserende-tor',         'Mousserende', 'Tør',                     'mousserende', '{}', 110),
  ('mousserende-sod',         'Mousserende', 'Sød og let',              'mousserende', '{}', 120),
  ('dessert-sod-frisk',       'Dessertvin',  'Sød og frisk',            'dessertvin',  '{dessert-sod-fyldig}', 130),
  ('dessert-sod-fyldig',      'Dessertvin',  'Sød og fyldig',           'dessertvin',  '{dessert-sod-frisk}', 140),
  ('ol-lys-frisk',            'Øl',          'Lys og frisk',            null,          '{}', 150)
on conflict (id) do update set
  wine_label = excluded.wine_label, style = excluded.style, bar_type = excluded.bar_type,
  neighbors = excluded.neighbors, sort_order = excluded.sort_order;

alter table public.wine_styles enable row level security;
drop policy if exists "anyone reads wine_styles" on public.wine_styles;
create policy "anyone reads wine_styles" on public.wine_styles for select to anon, authenticated using (true);
grant select on public.wine_styles to anon, authenticated;

-- Kategori på vinene i Astons Bar
alter table public.wines add column if not exists style_id text references public.wine_styles (id) on delete set null;

-- Vinforslag på opskrifterne i Astons Køkken
alter table madplan.recipes add column if not exists wine_style_id text references public.wine_styles (id) on delete set null;
alter table madplan.recipes add column if not exists wine_suggestion text;

-- ─── Vine på lager til en kategori ──────────────────────────────────────────
-- Returnerer vinene i vinkøleskabet (dem med mindst én placering) i tre trin:
--   'praecis'  = samme kategori
--   'naer'     = en nabokategori (wine_styles.neighbors)
--   'type'     = samme vintype i øvrigt (fx anden rødvin)
create or replace function madplan.wines_for_style(p_style_id text)
returns table (
  wine_id uuid,
  name text,
  producer text,
  vintage int,
  country text,
  region text,
  grapes text,
  image_url text,
  style_id text,
  style text,
  bottles int,
  placements jsonb,
  match text,
  rank int
)
language sql stable security invoker set search_path = madplan, public
as $$
  with s as (
    select * from public.wine_styles where id = p_style_id
  ),
  stock as (
    select w.id, w.name, w.producer, w.vintage, w.country, w.region, w.grapes, w.image_url,
           w.style_id, w.wine_type,
           count(p.id)::int as bottles,
           jsonb_agg(
             jsonb_build_object('shelf', p.shelf, 'slot', p.slot, 'depth', p.depth, 'layer', p.layer)
             order by p.shelf, p.slot, p.depth, p.layer
           ) as placements
      from public.wines w
      join public.wine_placements p on p.wine_id = w.id
     group by w.id
  )
  select st.id, st.name, st.producer, st.vintage, st.country, st.region, st.grapes, st.image_url,
         st.style_id, ws.style, st.bottles, st.placements,
         case
           when st.style_id = s.id then 'praecis'
           when st.style_id = any (s.neighbors) then 'naer'
           else 'type'
         end as match,
         case
           when st.style_id = s.id then 0
           when st.style_id = any (s.neighbors) then array_position(s.neighbors, st.style_id)
           else 99
         end as rank
    from stock st
    cross join s
    left join public.wine_styles ws on ws.id = st.style_id
   where madplan.is_member()
     and (
       st.style_id = s.id
       or st.style_id = any (s.neighbors)
       or (s.bar_type is not null and st.wine_type = s.bar_type)
     )
   order by rank, st.name;
$$;

grant execute on function madplan.wines_for_style(text) to authenticated;
revoke execute on function madplan.wines_for_style(text) from anon, public;

-- Vinforslag til de 135 retter (godkendt 23.10.2026)
update madplan.recipes r
   set wine_style_id = v.style_id, wine_suggestion = v.suggestion
  from (values
  ('e5023ab5-a3bc-4536-b7d8-cb4653174009'::uuid, 'hvid-let-frisk', 'Vermentino (Sardinien, Toscana), Verdicchio dei Castelli di Jesi, Soave Classico'),
  ('44cb4dd2-96a0-4d06-875c-0b5e5343eefa'::uuid, 'hvid-let-frisk', 'Vermentino di Gallura, Greco di Tufo, Falanghina (Campania)'),
  ('146f64a1-0f68-419e-8098-29c3c073fb26'::uuid, 'hvid-let-frisk', 'Falanghina (Campania), Vermentino, Pinot Grigio fra Alto Adige'),
  ('34c3b293-39bf-4836-b3fb-76e7f3e5ee94'::uuid, 'rod-let-frugtig', 'Valpolicella Classico, Bardolino, Pinot Noir fra Alto Adige'),
  ('bc052377-0752-487a-b29b-84e909d2873b'::uuid, 'rod-fyldig-kraftig', 'Rioja Crianza, Garnacha fra Calatayud eller Campo de Borja, Monastrell (Jumilla)'),
  ('31774312-18b9-41e1-94eb-1ce0a96a40be'::uuid, 'hvid-let-frisk', 'Albariño (Rías Baixas), Verdejo (Rueda), Manzanilla sherry'),
  ('9da8aaea-5385-4070-befb-2502cdcdcf83'::uuid, 'rose-tor-frisk', 'Rosado fra Navarra, Provence-rosé, Fino sherry'),
  ('0926776c-1553-4939-9249-fc2618efb07d'::uuid, 'hvid-mellem-rund', 'Bourgogne Chardonnay (Mâcon, Saint-Véran), Chablis, Champagne'),
  ('a71fb739-5247-4231-b419-16d315a72f31'::uuid, 'hvid-let-frisk', 'Sauvignon Blanc (Sancerre, Marlborough), Grüner Veltliner (Østrig), Albariño'),
  ('83984a38-5114-4292-a6a8-652c38d24fc8'::uuid, 'mousserende-tor', 'Crémant de Bourgogne eller d''Alsace, Cava Brut, Champagne Brut'),
  ('0beb9774-4f04-4eb4-a120-4844a09a89bc'::uuid, 'rod-let-frugtig', 'Garnacha (Campo de Borja), ung Tempranillo (Rioja Joven), Mencía (Bierzo)'),
  ('c98a5c05-26c8-4bde-a07d-54bf69477c6d'::uuid, 'hvid-let-frisk', 'Albariño (Rías Baixas), Godello (Valdeorras), Fino sherry'),
  ('ee5b3fa9-7cf2-4da6-9887-606332360d17'::uuid, 'hvid-let-frisk', 'Chablis, Muscadet Sèvre et Maine, tør Riesling fra Tyskland'),
  ('883e7f7c-a87a-41c6-b16b-4b61b5cc7b38'::uuid, 'hvid-let-frisk', 'Tør Riesling (Mosel, Alsace), Sauvignon Blanc (Loire), Champagne Brut'),
  ('c6a5f89b-0ddb-43db-8ee5-06b691e52705'::uuid, 'hvid-let-frisk', 'Fino eller Manzanilla sherry, Verdejo (Rueda), Moscato d''Asti til de søde'),
  ('87939692-1e35-48ab-a95e-f84b0a343bd8'::uuid, 'hvid-let-frisk', 'Sauvignon Blanc (Touraine, Sancerre), Grüner Veltliner, Chablis'),
  ('0b21a72f-fa86-452b-b311-4314f7ee2334'::uuid, 'hvid-let-frisk', 'Muscadet, Picpoul de Pinet, Vinho Verde'),
  ('f9849771-8054-4282-b695-b6ba126218df'::uuid, 'hvid-let-frisk', 'Gavi di Gavi (Piemonte), Arneis (Roero), Soave Classico'),
  ('78902a8a-d634-40e8-92e1-35c7e859dc5d'::uuid, 'ol-lys-frisk', 'Pilsner eller lys lager; vin: Grüner Veltliner eller tør Riesling'),
  ('a35b6451-92e0-4473-9a7b-e896c0c6036f'::uuid, 'rod-mellem-frugtig', 'Rioja Crianza, Garnacha (Campo de Borja, Calatayud), Montsant'),
  ('384763c6-193c-4b96-bd77-85173db221bb'::uuid, 'rod-mellem-syrlig', 'Pinot Noir (Bourgogne, Central Otago), Spätburgunder, Cru Beaujolais (Morgon)'),
  ('2ef8a067-b4ce-4512-94ae-165a089a91c2'::uuid, 'rod-mellem-frugtig', 'Pinot Noir (Bourgogne), Châteauneuf-du-Pape, Rioja Reserva'),
  ('936535b3-b8e3-47e9-858b-f7ac52b3ce91'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett (Mosel), Gewürztraminer (Alsace); alternativ: let Pinot Noir'),
  ('c976b078-e65e-4459-9aae-475c98564e75'::uuid, 'hvid-mellem-rund', 'Chardonnay (Mâcon, Bourgogne Blanc), Chenin Blanc (Vouvray sec), Pinot Blanc (Alsace)'),
  ('825c9947-8f11-4bf3-9c1d-36bd31930214'::uuid, 'rod-mellem-syrlig', 'Bourgogne Rouge (Pinot Noir), Côte de Nuits-Villages, Côtes du Rhône Villages'),
  ('a209d9f3-102e-4553-b11e-04a66685d3ea'::uuid, 'rod-mellem-frugtig', 'Côtes du Rhône, Merlot (Bordeaux Supérieur), Zweigelt (Østrig)'),
  ('2ed366c1-8b5d-4fa5-bf24-534955ba00fc'::uuid, 'rod-fyldig-kraftig', 'Zinfandel (Californien), Malbec (Mendoza), Shiraz (Australien)'),
  ('58011ef5-a74f-4d12-bfa2-170c6038ac4e'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett eller Spätlese (Pfalz, Mosel), Gewürztraminer (Alsace), Viognier'),
  ('7e1992b5-d736-486a-99d4-faad8fb60a44'::uuid, 'hvid-let-frisk', 'Frascati Superiore (Lazio), Verdicchio, Grechetto (Umbrien)'),
  ('6ca75472-652b-44f2-8488-4e6ba1f83dda'::uuid, 'rod-fyldig-kraftig', 'Zinfandel (Californien), Malbec (Mendoza), Primitivo (Puglia)'),
  ('282cbfab-dd31-40ae-833b-a613d018a6a0'::uuid, 'rod-fyldig-struktureret', 'Cahors (Malbec), Madiran, Saint-Émilion'),
  ('3000fd00-9aee-4201-a5cd-5850d2396ac3'::uuid, 'rod-mellem-syrlig', 'Bourgogne Rouge (Pinot Noir), Cru Beaujolais (Fleurie, Morgon), Spätburgunder'),
  ('89ae92c5-a8ca-43cf-be7b-50713832b56f'::uuid, 'hvid-let-frisk', 'Franciacorta Brut, Lugana (Lombardiet), Soave Classico'),
  ('f75cd680-b99e-42e8-b2f9-02ee02249e7e'::uuid, 'hvid-aromatisk-tor', 'Grüner Veltliner (Østrig), tør Riesling, Pinot Gris (Alsace)'),
  ('57313f2d-fba0-4016-827c-67346cee620a'::uuid, 'ol-lys-frisk', 'Pilsner eller lys lager; vin: let Beaujolais-Villages'),
  ('9eaba411-b2b8-45f5-ad91-7d6dec708f7e'::uuid, 'rod-mellem-frugtig', 'Garnacha (Spanien), Malbec (Mendoza), Tempranillo (Ribera del Duero Roble)'),
  ('75b34204-3fb5-49d4-ba9a-ed25cd1a1776'::uuid, 'hvid-let-frisk', 'Assyrtiko (Santorini), Sauvignon Blanc (Loire), tør rosé fra Provence'),
  ('5847dc76-9d25-4115-925b-432099d6be9f'::uuid, 'rod-mellem-frugtig', 'Côtes du Rhône Villages, Pinot Noir (Baden), Valpolicella Ripasso'),
  ('3d0e4a83-a402-4478-8f0b-00ddb068b4b6'::uuid, 'hvid-mellem-rund', 'Riesling eller Pinot Gris (Alsace), Mâcon-Villages; rødt alternativ: Beaujolais'),
  ('6ba28890-764c-453c-b9fe-4787287241fd'::uuid, 'rod-let-frugtig', 'Beaujolais-Villages, Zweigelt (Østrig), Côtes du Rhône'),
  ('a5caefb5-c78f-4032-8391-8f095efcdb74'::uuid, 'hvid-mellem-rund', 'Chardonnay fra Alto Adige, Soave Classico, Lugana'),
  ('3c202727-d934-4322-aa7e-b6b914184dd7'::uuid, 'rod-mellem-syrlig', 'Barbera d''Asti/d''Alba, Chianti Classico, Valpolicella Classico'),
  ('e17f79a9-62ba-4ffb-83b3-01c99b217d34'::uuid, 'hvid-aromatisk-tor', 'Viognier (Rhône, Languedoc), Pinot Gris (Alsace), Chenin Blanc (Sydafrika)'),
  ('a74d099b-c5ee-4c68-8fd4-a1c336b7cfb5'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett (Mosel), Gewürztraminer (Alsace), Grüner Veltliner'),
  ('2c9effb4-7720-45d9-8f4c-41d3199551e3'::uuid, 'rod-fyldig-kraftig', 'Blaufränkisch (Østrig), Kékfrankos (Ungarn), Côtes du Rhône Villages'),
  ('e4de57cc-b3b9-449e-8c18-d9f00f6fe1d1'::uuid, 'rod-mellem-frugtig', 'Agiorgitiko (Nemea), Xinomavro-rosé, Côtes du Rhône'),
  ('2a4127a4-4d76-4f2b-899c-95ab37fa80e3'::uuid, 'rod-mellem-frugtig', 'Merlot (Bordeaux), Côtes du Rhône, Montepulciano d''Abruzzo'),
  ('cd7b389a-ffe4-4f03-9ba9-995ff533cfc9'::uuid, 'hvid-mellem-rund', 'Riesling Spätlese trocken (Pfalz), Pinot Gris (Alsace); rødt: Pinot Noir'),
  ('7bc66f5b-b20e-416f-9fb9-6c7087de824b'::uuid, 'rod-mellem-syrlig', 'Montepulciano d''Abruzzo, Chianti, Barbera, Nero d''Avola'),
  ('e732fe57-d7dd-418b-9750-653409a10dd7'::uuid, 'hvid-let-frisk', 'Grüner Veltliner, Chablis, Pinot Blanc (Alsace)'),
  ('fad8b1f0-8dc6-447c-a040-50242035011a'::uuid, 'hvid-let-frisk', 'Chablis, Sauvignon Blanc (Touraine), Pinot Blanc'),
  ('6f738993-8ab3-4545-8ac1-3fdde54d3e58'::uuid, 'rod-let-frugtig', 'Beaujolais-Villages, Pinot Noir (Baden), Zweigelt'),
  ('9eb9d689-d487-40d1-8356-5431c7be9365'::uuid, 'rod-fyldig-kraftig', 'Syrah (Nordlige Rhône, Crozes-Hermitage), Öküzgözü/Boğazkere (Tyrkiet), Grenache-blend (Languedoc)'),
  ('e81bc87b-01df-497f-b4f4-e223163d5ed6'::uuid, 'rod-mellem-syrlig', 'Chianti Classico, Montepulciano d''Abruzzo, Barbera'),
  ('b3280bbe-e9f5-4104-b7b6-611565429082'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett (Mosel), Gewürztraminer, Off-dry Chenin Blanc (Vouvray demi-sec)'),
  ('f45d5d56-0ac5-41cb-b9c5-aeea9dffbaf0'::uuid, 'hvid-mellem-rund', 'Bourgogne Blanc, Mâcon-Villages, Chardonnay fra Jura'),
  ('1e545860-ec1a-4569-bde9-f3c26c61f6ee'::uuid, 'hvid-aromatisk-halvtor', 'Pinot Gris (Alsace), Riesling halvtør, Viognier'),
  ('ccf09bb7-e7bb-4e2b-8120-566f79a0c0f4'::uuid, 'hvid-aromatisk-tor', 'Riesling (Pfalz, Alsace), Grüner Veltliner, Pinot Gris'),
  ('b6129abe-a5c0-421b-b78b-461d91a26c55'::uuid, 'hvid-aromatisk-halvtor', 'Viognier (Rhône), Gewürztraminer (Alsace), Chenin Blanc (Sydafrika)'),
  ('b7299ec4-a614-4540-852b-86733bbffd11'::uuid, 'rod-let-frugtig', 'Pinot Noir (New Zealand, Chile), Beaujolais; hvidt: Riesling Kabinett'),
  ('528e04e2-b326-4cd7-985c-fb979d8a0563'::uuid, 'hvid-aromatisk-halvtor', 'Gewürztraminer (Alsace), Riesling Spätlese, Grenache-rosé'),
  ('656718db-a1ef-4dfe-9185-88e6dfc963fd'::uuid, 'hvid-mellem-rund', 'Bourgogne Blanc, Chardonnay (Limoux), Chenin Blanc (Anjou)'),
  ('492cd423-fe77-4125-bde7-52957b119063'::uuid, 'rod-mellem-frugtig', 'Garnacha (Spanien), Malbec (ung, Mendoza), Carménère (Chile)'),
  ('6454ed7f-9da3-4e87-b170-1c6b4916e4a3'::uuid, 'hvid-aromatisk-tor', 'Riesling (Clare Valley, Mosel trocken), Grüner Veltliner, Albariño'),
  ('6e333485-a5c7-4dfe-855f-9339e8083c8b'::uuid, 'rose-tor-frisk', 'Rosado (Navarra), Provence-rosé; rødt: let Garnacha'),
  ('41751334-38d0-4c8d-acfd-35ff2c261a51'::uuid, 'hvid-aromatisk-tor', 'Riesling Kabinett, Grüner Veltliner, Champagne/Crémant'),
  ('c2ba3409-d385-4a4c-b14e-cc736bd0cb3c'::uuid, 'hvid-aromatisk-tor', 'Assyrtiko (Grækenland), tør Riesling, rosé fra Provence eller Libanon'),
  ('bbe7bdfa-270b-4166-bd1e-a89dee2afc06'::uuid, 'hvid-aromatisk-halvtor', 'Gewürztraminer (Alsace), Riesling Kabinett, Pinot Gris'),
  ('7eeddd31-d8a5-4779-8ea1-c54f28103f49'::uuid, 'hvid-let-frisk', 'Sauvignon Blanc (Chile, Marlborough), Verdejo (Rueda), Albariño'),
  ('93ccd08b-8af9-4d0f-ae7b-20a16fe6ef7a'::uuid, 'hvid-let-frisk', 'Vermentino (Liguria, Sardinien), Gavi, Pinot Grigio fra Friuli; rødt: let Pinot Noir'),
  ('7d2299eb-601e-4f15-9063-fc1e13788094'::uuid, 'hvid-let-frisk', 'Sancerre, Chablis, Grüner Veltliner'),
  ('23ea550d-5d07-4176-8532-8201e0d63e93'::uuid, 'hvid-let-frisk', 'Soave Classico, Chardonnay fra Alto Adige, Gavi'),
  ('8082c6b3-a488-4510-8936-60acd3054061'::uuid, 'rod-mellem-syrlig', 'Chianti Classico Riserva, Barbera d''Alba, Rosso di Montalcino'),
  ('188ac28f-8d08-4014-a7e4-817217471893'::uuid, 'rod-mellem-frugtig', 'Montepulciano d''Abruzzo, Sangiovese di Romagna, Nero d''Avola'),
  ('e11358bf-8872-41e3-9294-cd719d0ad187'::uuid, 'rod-let-frugtig', 'Beaujolais-Villages, Pinot Noir (Baden), Gamay (Loire)'),
  ('d8fa414d-1d58-4b20-873b-2e08b6d5e75a'::uuid, 'rod-mellem-frugtig', 'Montepulciano d''Abruzzo, Côtes du Rhône, Merlot (Languedoc)'),
  ('32626aa8-8d3a-4568-be29-7a7b1b836088'::uuid, 'rod-let-frugtig', 'Sangiovese (Chianti), Valpolicella; hvidt: Verdicchio'),
  ('112339ff-3e2b-42ed-a3cd-120facbbecb2'::uuid, 'hvid-mellem-rund', 'Bourgogne Blanc, Chenin Blanc (Savennières, Anjou); rødt: Pinot Noir'),
  ('6acba8e6-e472-404f-b8a0-b303792db1a4'::uuid, 'rod-let-frugtig', 'Côtes du Rhône, Zweigelt, Pinot Noir (Baden)'),
  ('515e9f01-93b1-4856-9310-63b4f1d94f90'::uuid, 'rose-tor-frisk', 'Rosado (Navarra, Rioja); rødt: ung Garnacha eller Zinfandel'),
  ('991be323-b0c8-4098-bd63-87c7b6d86367'::uuid, 'rod-let-frugtig', 'Pinot Noir (New Zealand, Chile), Zinfandel (Californien), Grenache'),
  ('d52e2885-e3c4-46b8-8269-75fe614cb2f1'::uuid, 'rod-let-frugtig', 'Beaujolais, Pinot Noir; hvidt: Grüner Veltliner'),
  ('8d796965-bebb-4154-8116-1a2a8c6fea7a'::uuid, 'rod-fyldig-struktureret', 'Bordeaux (Médoc, Saint-Émilion), Rioja Reserva, Cabernet Sauvignon (Chile)'),
  ('b78e8434-58c0-4771-9b19-e8b09d036f2c'::uuid, 'rod-mellem-syrlig', 'Barbera d''Alba, Nebbiolo (Langhe), Valpolicella Ripasso'),
  ('d156b8f2-a28a-4f2a-9c6f-116d90559fbb'::uuid, 'hvid-mellem-rund', 'Bourgogne Blanc, Chardonnay (Mâcon); rødt: Beaujolais eller Pinot Noir'),
  ('4b312eb8-4466-4c36-89df-fb7d39a3bf93'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett (Mosel), Gewürztraminer, Grüner Veltliner'),
  ('3d530b86-fafc-460a-8cc3-11ce7c3be9e4'::uuid, 'rod-mellem-syrlig', 'Barbera d''Asti, Valpolicella Classico, Chianti'),
  ('a03cfc80-b06f-4bdb-b444-a05b2565ed3c'::uuid, 'rod-mellem-syrlig', 'Cesanese (Lazio), Montepulciano d''Abruzzo, Chianti Classico'),
  ('de7c8b29-8e24-4899-8ed6-9668a3bb6484'::uuid, 'hvid-mellem-rund', 'Frascati Superiore, Verdicchio, Soave Classico; rødt: Cesanese'),
  ('382dce87-bb2b-4727-a6ed-681ed0e545f2'::uuid, 'hvid-mellem-rund', 'Chardonnay (Alto Adige, Mâcon), Soave, Lugana'),
  ('d181e9a2-3d71-4315-8980-392d2a5ba254'::uuid, 'hvid-let-frisk', 'Vermentino (Liguria), Pigato (Liguria), Gavi'),
  ('684dc725-39a7-4a1c-b2e1-97942679480a'::uuid, 'rod-fyldig-kraftig', 'Tempranillo (Ribera del Duero Roble), Garnacha, Monastrell (Jumilla)'),
  ('04f86978-3905-4bf0-b0f7-d1a4f5cec015'::uuid, 'hvid-mellem-rund', 'Godello (Valdeorras), Verdejo (Rueda), hvid Rioja'),
  ('498b6d43-4227-4549-a2ee-7b64fef1615b'::uuid, 'rod-mellem-syrlig', 'Rosso di Montalcino, Chianti Classico, Montefalco Rosso'),
  ('a9ad2afe-9f37-4357-8d6b-1ac7496929ba'::uuid, 'rod-fyldig-kraftig', 'Zinfandel (Californien), Shiraz (Australien), Malbec (Mendoza)'),
  ('c0789e0c-c1ed-4b15-a4fd-fd9194d2a0b8'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett, Gewürztraminer; rødt: let Pinot Noir'),
  ('70f9068a-f144-4aa9-ae8a-7cce308d93f2'::uuid, 'hvid-mellem-rund', 'Riesling eller Pinot Gris (Alsace), Chablis, Crémant d''Alsace'),
  ('9a5dcae2-578e-4047-85df-5e2811480f2b'::uuid, 'rose-tor-frisk', 'Provence-rosé, Bandol-rosé; rødt: Côtes du Rhône'),
  ('61156194-6b12-4fad-90fb-88080240e2af'::uuid, 'hvid-let-frisk', 'Frascati Superiore, Verdicchio; rødt: Pinot Noir fra Alto Adige'),
  ('bb60483c-c624-479d-bc3c-6728cf96442c'::uuid, 'hvid-let-frisk', 'Verdicchio, Vermentino, Falanghina'),
  ('3c84dec3-7a5d-4b39-a0eb-bf465a5a412d'::uuid, 'rod-mellem-syrlig', 'Sangiovese di Romagna, Chianti, Barbera'),
  ('570df1f1-4735-4ed6-8b32-1a78bc4362ea'::uuid, 'mousserende-tor', 'Cava Brut, Crémant; hvidt: Riesling trocken'),
  ('dca37359-45fb-4573-9ffb-c5f67e1ead22'::uuid, 'rod-fyldig-kraftig', 'Syrah (Saint-Joseph, Crozes-Hermitage), Bordeaux, Shiraz'),
  ('3ca2c0ca-43d8-4d74-864c-cf29461e7ef9'::uuid, 'rod-fyldig-struktureret', 'Bordeaux (Médoc), Cabernet Sauvignon (Chile, Californien), Malbec'),
  ('a2092ce7-05ac-4f9a-90a9-cea0b31ff6fb'::uuid, 'ol-lys-frisk', 'Pilsner; vin: tør Riesling, Grüner Veltliner'),
  ('327a39e4-1338-4821-8edc-20b6f2fe62f0'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett, Pinot Gris, Grüner Veltliner'),
  ('d27dd299-9cd4-4e4e-87e6-69768a46bede'::uuid, 'rod-let-frugtig', 'Côtes du Rhône, Pinot Noir (Baden), Beaujolais'),
  ('79a57025-3dce-481b-b3f1-892a089338af'::uuid, 'hvid-aromatisk-tor', 'Riesling (halvtør), Grüner Veltliner, Pinot Gris'),
  ('02624d05-c416-43a0-a6f8-ac7b4bf6afaa'::uuid, 'rod-let-frugtig', 'Beaujolais, Zweigelt; hvidt: Pinot Gris (Alsace)'),
  ('f8f7111f-8cdd-48d0-a376-eac2ab31d438'::uuid, 'rod-mellem-frugtig', 'Garnacha (Spanien), Malbec (Mendoza), Tempranillo (ung Rioja)'),
  ('1e64caf2-a594-4e1f-898e-a9480afb4b68'::uuid, 'rod-mellem-frugtig', 'Zinfandel, Malbec, Garnacha'),
  ('c0618889-cebe-42f2-a4e4-d4f1c8bd7364'::uuid, 'hvid-mellem-rund', 'Pinot Blanc eller Riesling (Alsace), Chablis'),
  ('ea9c8b3d-716f-4ab1-99f2-519f51b03e29'::uuid, 'hvid-mellem-rund', 'Riesling (Alsace), Chenin Blanc (Loire), Mâcon-Villages'),
  ('170a8f1b-2331-4734-bb05-11ef3c7557d1'::uuid, 'rod-let-frugtig', 'Pinot Noir (Bourgogne, Alto Adige), Cru Beaujolais; hvidt: Chenin Blanc'),
  ('3c118e44-d243-4220-9b72-16b05c397d32'::uuid, 'hvid-mellem-rund', 'Pinot Blanc (Alsace), Mâcon-Villages, Grüner Veltliner'),
  ('1b356d29-877e-4c9d-a981-eed47e223090'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Kabinett, Gewürztraminer, Sauvignon Blanc (Marlborough)'),
  ('e451bb2c-7dd2-4dcc-a47e-7ce22e9f233d'::uuid, 'hvid-aromatisk-halvtor', 'Riesling Spätlese (Mosel), Gewürztraminer (Alsace), Pinot Gris'),
  ('07b3dcd5-d158-432c-9b89-abd4b6dd2580'::uuid, 'hvid-let-frisk', 'Grüner Veltliner (Wachau, Kamptal), Riesling (Østrig), Weissburgunder'),
  ('d26b8aea-f664-4618-8876-a2bf188069ad'::uuid, 'dessert-sod-frisk', 'Sen høst Riesling (Spätlese/Auslese), Coteaux du Layon, Cidre/Pommeau'),
  ('1eadb556-b845-4fd5-aea9-0687aa24f094'::uuid, 'dessert-sod-fyldig', 'Pedro Ximénez sherry, Marsala Superiore; eller blot espresso'),
  ('f8a9d74e-0132-44b4-9d97-ea5579c38c53'::uuid, 'dessert-sod-frisk', 'Moscatel de Setúbal, Tokaji Aszú 5 puttonyos, Pedro Ximénez over isen'),
  ('370281d0-f14a-4020-9047-479e1f4ef81d'::uuid, 'dessert-sod-fyldig', 'Banyuls, Maury, Ruby eller LBV Port'),
  ('088dcc96-c42d-42bd-a611-20bccd2f56ef'::uuid, 'dessert-sod-fyldig', 'Banyuls, Ruby Port, Recioto della Valpolicella'),
  ('12ea3f4a-5f79-4ae7-9d82-cd72627d72eb'::uuid, 'dessert-sod-frisk', 'Moscato d''Asti, Riesling Auslese, Muscat de Beaumes-de-Venise'),
  ('8380e9da-6082-4bb0-92bc-8d47eab8b6e8'::uuid, 'dessert-sod-fyldig', 'Moscatel (Valencia, Alicante), Pedro Ximénez, Tokaji'),
  ('2ae648b7-ad51-4c1d-b4df-b591627f1ad3'::uuid, 'dessert-sod-fyldig', 'Sauternes, Monbazillac, Tokaji Aszú'),
  ('8f0faeb9-0233-4298-934e-7e9982b011a9'::uuid, 'mousserende-sod', 'Moscato d''Asti; ellers ingen vin'),
  ('98885e6b-b8e8-4292-855b-24ec705e8f9e'::uuid, 'mousserende-sod', 'Moscato d''Asti, Brachetto d''Acqui'),
  ('3113413e-1a7c-47b7-ad9e-b8d74d255a2a'::uuid, 'mousserende-sod', 'Brachetto d''Acqui, Moscato d''Asti, Recioto di Soave'),
  ('06e006ba-5b78-487b-bc99-6442471ab057'::uuid, 'dessert-sod-fyldig', 'Ruby Port, Kirsebærvin (Cherry Heering), Recioto della Valpolicella'),
  ('a311e0ef-12b0-43f4-a991-50d9ebd2430e'::uuid, 'mousserende-sod', 'Brachetto d''Acqui, Moscato Rosa; eller ingen vin'),
  ('d2d750db-99b3-45db-89d2-be926f8a94a3'::uuid, 'dessert-sod-fyldig', 'Oloroso dulce eller Cream sherry, Moscatel de Setúbal, Vin Santo'),
  ('0ea3c553-df68-42cf-9c8a-8a525f46c21b'::uuid, 'dessert-sod-frisk', 'Riesling Auslese (Mosel), Sauternes, Moscato d''Asti'),
  ('32477caa-a33d-4d83-8cc8-68152f3bd3db'::uuid, 'dessert-sod-fyldig', 'Coteaux du Layon, Vouvray moelleux, Calvados til de modige'),
  ('39d42a81-2212-4097-9a2f-9a555f949880'::uuid, 'dessert-sod-fyldig', 'Vin Santo, Marsala Superiore, Pedro Ximénez')
  ) as v(id, style_id, suggestion)
 where r.id = v.id;

-- Kategorier på vinene i vinkøleskabet
update public.wines set style_id = 'mousserende-tor' where name in ('Grognet Special Club', 'Carpe Diem', 'Cuvée de Buretel', 'Euphonie des terroirs', 'Grand Eloge', 'Les Mesneux Premier Cru', 'Pet Nat', 'Roger Brun Grande Réserve', 'Roland Champion Special Club', 'Sur les Gros Monts', 'Ullens M', 'Bruno Paillard Première Cuvée', 'La Quille 2016');
update public.wines set style_id = 'mousserende-sod' where name in ('Bosca Anniversary', 'Manfredi Asti', 'Mausberg Crement d''Alsace Demi Sec', 'Louis Déhu demi-sec', 'Val de France FERSKEN');
