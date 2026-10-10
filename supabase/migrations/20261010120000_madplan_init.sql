-- ════════════════════════════════════════════════════════════════════════════
-- Astons Køkken — schema "madplan"
--
-- Appen deler Supabase-projekt med Astons Bar (schema public) og Fællesrejser
-- (schema faellesrejser). Alt til måltidsappen ligger derfor i sit eget schema,
-- så tabelnavne som recipes/ingredients/tags ikke kolliderer.
--
-- Husk: schemaet skal tilføjes under "Exposed schemas" i Supabase-dashboardet
-- (Project Settings → Data API), før appen kan tale med det.
-- ════════════════════════════════════════════════════════════════════════════

create schema if not exists madplan;

-- ─── Medlemmer og adgang ────────────────────────────────────────────────────

create table madplan.members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function madplan.is_member()
returns boolean
language sql stable security definer set search_path = madplan, public
as $$
  select exists (select 1 from madplan.members where user_id = auth.uid())
$$;

create or replace function madplan.is_admin()
returns boolean
language sql stable security definer set search_path = madplan, public
as $$
  select exists (select 1 from madplan.members where user_id = auth.uid() and is_admin)
$$;

-- Dagens dato i dansk tid (bruges til at afgøre, om en dag i ugeplanen er passeret)
create or replace function madplan.today_dk()
returns date
language sql stable
as $$ select (now() at time zone 'Europe/Copenhagen')::date $$;

-- ─── Indstillinger (app-navn, temaer, planlægger-parametre, standarduge) ───

create table madplan.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Butikskategorier ──────────────────────────────────────────────────────

create table madplan.shop_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index shop_categories_name_key on madplan.shop_categories (lower(name));

-- ─── Ingredienskatalog + varelager ─────────────────────────────────────────
-- is_staple = varen registreres i varelageret (basisvare i køkkenet)
-- in_stock  = "har vi" (true) / "løbet tør" (false). Kun relevant for basisvarer.

create table madplan.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references madplan.shop_categories (id) on delete set null,
  default_unit text,
  is_staple boolean not null default false,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index ingredients_name_key on madplan.ingredients (lower(name));

-- ─── Tags ──────────────────────────────────────────────────────────────────
-- is_main_ingredient på gruppen: tags i gruppen bruges til variation i ugeplanen
-- is_weekend på tagget: "weekendmad" foretrækkes fredag og lørdag

create table madplan.tag_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_main_ingredient boolean not null default false,
  created_at timestamptz not null default now()
);

create table madplan.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_id uuid references madplan.tag_groups (id) on delete set null,
  sort_order integer not null default 0,
  is_weekend boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index tags_name_key on madplan.tags (lower(name));

-- ─── Opskrifter ────────────────────────────────────────────────────────────

create table madplan.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  servings integer not null default 4 check (servings between 1 and 50),
  prep_minutes integer check (prep_minutes is null or prep_minutes between 0 and 2000),
  image_url text,
  source_url text,
  archived boolean not null default false,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table madplan.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references madplan.recipes (id) on delete cascade,
  ingredient_id uuid not null references madplan.ingredients (id) on delete restrict,
  amount numeric,
  unit text,
  note text,
  sort_order integer not null default 0
);
create index recipe_ingredients_recipe_idx on madplan.recipe_ingredients (recipe_id);
create index recipe_ingredients_ingredient_idx on madplan.recipe_ingredients (ingredient_id);

create table madplan.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references madplan.recipes (id) on delete cascade,
  sort_order integer not null default 0,
  text text not null,
  timer_minutes integer check (timer_minutes is null or timer_minutes between 1 and 1440)
);
create index recipe_steps_recipe_idx on madplan.recipe_steps (recipe_id);

create table madplan.recipe_tags (
  recipe_id uuid not null references madplan.recipes (id) on delete cascade,
  tag_id uuid not null references madplan.tags (id) on delete cascade,
  primary key (recipe_id, tag_id)
);
create index recipe_tags_tag_idx on madplan.recipe_tags (tag_id);

-- ─── Ugeplan ───────────────────────────────────────────────────────────────
-- Én række pr. dato. kind: recipe | rugbrod | ude | rester | fri

create table madplan.plan_days (
  id uuid primary key default gen_random_uuid(),
  day date not null unique,
  kind text not null default 'recipe' check (kind in ('recipe', 'rugbrod', 'ude', 'rester', 'fri')),
  recipe_id uuid references madplan.recipes (id) on delete set null,
  servings integer check (servings is null or servings between 1 and 50),
  free_text text,
  locked boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ─── Spist-log og vurderinger ─────────────────────────────────────────────

create table madplan.meal_log (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references madplan.recipes (id) on delete cascade,
  eaten_on date not null,
  plan_day_id uuid unique references madplan.plan_days (id) on delete set null,
  created_at timestamptz not null default now()
);
create index meal_log_recipe_idx on madplan.meal_log (recipe_id, eaten_on desc);

create table madplan.ratings (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references madplan.recipes (id) on delete cascade,
  meal_log_id uuid references madplan.meal_log (id) on delete set null,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  score smallint not null check (score between 1 and 5),
  note text,
  created_at timestamptz not null default now()
);
create index ratings_recipe_idx on madplan.ratings (recipe_id, created_at desc);
create unique index ratings_meal_user_key on madplan.ratings (meal_log_id, user_id)
  where meal_log_id is not null;

-- "Hvordan var retten?"-forespørgsler, som brugeren har valgt at springe over
create table madplan.rating_prompt_dismissals (
  meal_log_id uuid not null references madplan.meal_log (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  primary key (meal_log_id, user_id)
);

-- ─── Indkøbsliste ──────────────────────────────────────────────────────────

create table madplan.shopping_items (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid references madplan.ingredients (id) on delete set null,
  name text not null,
  amount numeric,
  unit text,
  category_id uuid references madplan.shop_categories (id) on delete set null,
  sources text[] not null default '{}',
  checked boolean not null default false,
  checked_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index shopping_items_checked_idx on madplan.shopping_items (checked);

-- ════════════════════════════════════════════════════════════════════════════
-- Triggers
-- ════════════════════════════════════════════════════════════════════════════

create or replace function madplan.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger recipes_touch before update on madplan.recipes
  for each row execute function madplan.touch_updated_at();
create trigger plan_days_touch before update on madplan.plan_days
  for each row execute function madplan.touch_updated_at();
create trigger settings_touch before update on madplan.settings
  for each row execute function madplan.touch_updated_at();

-- Når en vare krydses af: sæt tidsstempel, og hvis det er en basisvare fra
-- varelageret, så står den som "har vi" igen.
create or replace function madplan.shopping_item_checked()
returns trigger language plpgsql security definer set search_path = madplan, public as $$
begin
  if new.checked and not coalesce(old.checked, false) then
    new.checked_at := now();
    if new.ingredient_id is not null then
      update madplan.ingredients set in_stock = true
        where id = new.ingredient_id and is_staple and not in_stock;
    end if;
  elsif not new.checked then
    new.checked_at := null;
  end if;
  return new;
end $$;

create trigger shopping_items_checked before update of checked on madplan.shopping_items
  for each row execute function madplan.shopping_item_checked();

-- ════════════════════════════════════════════════════════════════════════════
-- RPC-funktioner
-- ════════════════════════════════════════════════════════════════════════════

-- Tilføj varer til indkøbslisten. items er et JSON-array af
--   { ingredient_id?, name?, amount?, unit?, category_id?, source? }
-- Ens varer (samme ingrediens/navn + samme enhed) lægges sammen med en
-- eksisterende ikke-afkrydset linje. Fritekst matches mod kataloget, så fx
-- "løg" automatisk får kategorien fra ingrediensen "Løg".
create or replace function madplan.add_shopping_items(items jsonb)
returns integer
language plpgsql security invoker set search_path = madplan, public
as $$
declare
  it jsonb;
  v_ing uuid;
  v_name text;
  v_amount numeric;
  v_unit text;
  v_cat uuid;
  v_src text;
  r_ing record;
  v_existing record;
  n integer := 0;
begin
  if not madplan.is_member() then
    raise exception 'Ingen adgang';
  end if;

  for it in select * from jsonb_array_elements(coalesce(items, '[]'::jsonb)) loop
    v_ing := nullif(it ->> 'ingredient_id', '')::uuid;
    v_name := btrim(coalesce(it ->> 'name', ''));
    v_amount := nullif(it ->> 'amount', '')::numeric;
    v_unit := nullif(btrim(coalesce(it ->> 'unit', '')), '');
    v_cat := nullif(it ->> 'category_id', '')::uuid;
    v_src := nullif(btrim(coalesce(it ->> 'source', '')), '');

    if v_ing is null and v_name <> '' then
      select id into v_ing from madplan.ingredients where lower(name) = lower(v_name) limit 1;
    end if;

    if v_ing is not null then
      select name, category_id into r_ing from madplan.ingredients where id = v_ing;
      if found then
        v_name := r_ing.name;
        v_cat := coalesce(v_cat, r_ing.category_id);
      else
        v_ing := null;
      end if;
    end if;

    if v_name = '' then
      continue;
    end if;

    -- Find en linje der kan lægges sammen med: samme vare, samme enhed, og
    -- enten begge med mængde eller begge uden.
    select * into v_existing
    from madplan.shopping_items s
    where not s.checked
      and (
        (v_ing is not null and s.ingredient_id = v_ing)
        or (v_ing is null and s.ingredient_id is null and lower(s.name) = lower(v_name))
      )
      and s.unit is not distinct from v_unit
      and ((s.amount is null) = (v_amount is null))
    order by s.created_at
    limit 1;

    if found then
      update madplan.shopping_items
      set amount = case when v_amount is null then null else coalesce(amount, 0) + v_amount end,
          sources = case
            when v_src is null or v_src = any (sources) then sources
            else array_append(sources, v_src)
          end,
          category_id = coalesce(category_id, v_cat)
      where id = v_existing.id;
    else
      insert into madplan.shopping_items (ingredient_id, name, amount, unit, category_id, sources)
      values (
        v_ing, v_name, v_amount, v_unit, v_cat,
        case when v_src is null then '{}'::text[] else array[v_src] end
      );
    end if;
    n := n + 1;
  end loop;

  return n;
end $$;

-- "Løbet tør": marker basisvaren som løbet tør og læg den på indkøbslisten,
-- medmindre den allerede står der (ikke afkrydset).
create or replace function madplan.mark_out_of_stock(p_ingredient_id uuid)
returns void
language plpgsql security invoker set search_path = madplan, public
as $$
begin
  if not madplan.is_member() then
    raise exception 'Ingen adgang';
  end if;

  update madplan.ingredients set in_stock = false where id = p_ingredient_id;

  if not exists (
    select 1 from madplan.shopping_items
    where ingredient_id = p_ingredient_id and not checked
  ) then
    perform madplan.add_shopping_items(
      jsonb_build_array(jsonb_build_object('ingredient_id', p_ingredient_id, 'source', 'Varelager'))
    );
  end if;
end $$;

-- Synkronisér spist-loggen med ugeplanen: dage der er passeret og har en
-- opskrift, registreres som spist. Rettes en passeret dag, følger loggen med.
-- Kaldes når appen åbnes.
create or replace function madplan.sync_meal_log()
returns void
language plpgsql security invoker set search_path = madplan, public
as $$
begin
  if not madplan.is_member() then
    return;
  end if;

  insert into madplan.meal_log (recipe_id, eaten_on, plan_day_id)
  select pd.recipe_id, pd.day, pd.id
  from madplan.plan_days pd
  where pd.day < madplan.today_dk()
    and pd.kind = 'recipe'
    and pd.recipe_id is not null
  on conflict (plan_day_id) do update
    set recipe_id = excluded.recipe_id, eaten_on = excluded.eaten_on
    where madplan.meal_log.recipe_id is distinct from excluded.recipe_id
       or madplan.meal_log.eaten_on is distinct from excluded.eaten_on;

  -- Passerede dage der ikke længere har en opskrift
  delete from madplan.meal_log ml
  using madplan.plan_days pd
  where ml.plan_day_id = pd.id
    and (pd.kind <> 'recipe' or pd.recipe_id is null);
end $$;

-- Navne på medlemmer (til visning af hvem der har givet en score/note)
create or replace function madplan.member_names()
returns table (user_id uuid, name text, email text, is_admin boolean)
language sql stable security definer set search_path = madplan, public
as $$
  select m.user_id,
         coalesce(nullif(btrim(p.name), ''), split_part(u.email, '@', 1)) as name,
         u.email::text,
         m.is_admin
  from madplan.members m
  join auth.users u on u.id = m.user_id
  left join faellesrejser.profiles p on p.id = m.user_id
  where madplan.is_member()
  order by 2
$$;

-- Alle brugere i projektet (fra login-systemet) til admin-siden, hvor man
-- vælger hvem der har adgang. Kun for administratorer.
create or replace function madplan.list_users()
returns table (user_id uuid, email text, name text, is_member boolean, is_admin boolean)
language sql stable security definer set search_path = madplan, public
as $$
  select u.id,
         u.email::text,
         nullif(btrim(p.name), '') as name,
         m.user_id is not null as is_member,
         coalesce(m.is_admin, false) as is_admin
  from auth.users u
  left join faellesrejser.profiles p on p.id = u.id
  left join madplan.members m on m.user_id = u.id
  where madplan.is_admin()
  order by coalesce(nullif(btrim(p.name), ''), u.email)
$$;

-- Giv/fjern adgang. Forhindrer at den sidste administrator fjernes.
create or replace function madplan.set_member(p_user_id uuid, p_member boolean, p_admin boolean)
returns void
language plpgsql security definer set search_path = madplan, public
as $$
begin
  if not madplan.is_admin() then
    raise exception 'Kun administratorer kan ændre adgang';
  end if;

  if (not p_member or not p_admin)
     and exists (select 1 from madplan.members where user_id = p_user_id and is_admin)
     and (select count(*) from madplan.members where is_admin) <= 1 then
    raise exception 'Der skal være mindst én administrator';
  end if;

  if p_member then
    insert into madplan.members (user_id, is_admin) values (p_user_id, p_admin)
    on conflict (user_id) do update set is_admin = excluded.is_admin;
  else
    delete from madplan.members where user_id = p_user_id;
  end if;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- Rettigheder og RLS
-- ════════════════════════════════════════════════════════════════════════════

grant usage on schema madplan to anon, authenticated, service_role;
grant all on all tables in schema madplan to service_role;
grant select, insert, update, delete on all tables in schema madplan to authenticated;
grant select on madplan.settings to anon;
grant execute on all functions in schema madplan to authenticated, service_role;
revoke execute on all functions in schema madplan from anon, public;
alter default privileges in schema madplan
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema madplan
  grant all on tables to service_role;

alter table madplan.members enable row level security;
alter table madplan.settings enable row level security;
alter table madplan.shop_categories enable row level security;
alter table madplan.ingredients enable row level security;
alter table madplan.tag_groups enable row level security;
alter table madplan.tags enable row level security;
alter table madplan.recipes enable row level security;
alter table madplan.recipe_ingredients enable row level security;
alter table madplan.recipe_steps enable row level security;
alter table madplan.recipe_tags enable row level security;
alter table madplan.plan_days enable row level security;
alter table madplan.meal_log enable row level security;
alter table madplan.ratings enable row level security;
alter table madplan.rating_prompt_dismissals enable row level security;
alter table madplan.shopping_items enable row level security;

-- members: man kan se sin egen række; admins kan se alle. Ændringer sker via set_member().
create policy "members read own" on madplan.members
  for select to authenticated using (user_id = auth.uid() or madplan.is_admin());

-- settings: alle kan læse (navn og tema vises også på login-siden); admins skriver
create policy "settings read" on madplan.settings
  for select to anon, authenticated using (true);
create policy "settings admin write" on madplan.settings
  for all to authenticated using (madplan.is_admin()) with check (madplan.is_admin());

-- Fælles husstandsdata: alle medlemmer kan læse og skrive
do $$
declare t text;
begin
  foreach t in array array[
    'shop_categories', 'ingredients', 'tag_groups', 'tags', 'recipes',
    'recipe_ingredients', 'recipe_steps', 'recipe_tags', 'plan_days',
    'meal_log', 'shopping_items'
  ] loop
    execute format(
      'create policy "members all" on madplan.%I for all to authenticated
         using (madplan.is_member()) with check (madplan.is_member())', t);
  end loop;
end $$;

-- Vurderinger: alle medlemmer kan læse; man skriver kun sine egne
create policy "ratings read" on madplan.ratings
  for select to authenticated using (madplan.is_member());
create policy "ratings insert own" on madplan.ratings
  for insert to authenticated with check (madplan.is_member() and user_id = auth.uid());
create policy "ratings update own" on madplan.ratings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ratings delete own" on madplan.ratings
  for delete to authenticated using (user_id = auth.uid());

create policy "dismissals own" on madplan.rating_prompt_dismissals
  for all to authenticated
  using (user_id = auth.uid() and madplan.is_member())
  with check (user_id = auth.uid() and madplan.is_member());

-- ════════════════════════════════════════════════════════════════════════════
-- Live-opdatering (Supabase Realtime)
-- ════════════════════════════════════════════════════════════════════════════

alter publication supabase_realtime add table
  madplan.shopping_items, madplan.plan_days, madplan.ingredients;

-- ════════════════════════════════════════════════════════════════════════════
-- Billeder (Supabase Storage)
-- ════════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('madplan-images', 'madplan-images', true)
on conflict (id) do nothing;

create policy "madplan images insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'madplan-images' and madplan.is_member());
create policy "madplan images update" on storage.objects
  for update to authenticated
  using (bucket_id = 'madplan-images' and madplan.is_member());
create policy "madplan images delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'madplan-images' and madplan.is_member());
