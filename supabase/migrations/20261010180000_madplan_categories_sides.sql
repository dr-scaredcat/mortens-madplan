-- ════════════════════════════════════════════════════════════════════════════
-- Astons Køkken — kategorier, tilbehør og score på tilbehør
--
-- Erstatter 20261010173000_madplan_side_dishes.sql. Kan køres uanset om den
-- forrige fil er kørt eller ej (alt er idempotent).
--
--  • Ny tag-gruppe "Kategori" med Hovedret, Tilbehør, Brød, Kage og Snacks.
--    Opskriftssiden deles op efter disse.
--  • Tilbehør kan tilføjes til en dag i ugeplanen ved siden af retten.
--  • Kun hovedretter (og opskrifter uden kategori) foreslås automatisk.
--  • Tilbehør registreres som spist og kan scores ligesom hovedretten.
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Nye kolonner ──────────────────────────────────────────────────────────
alter table madplan.tags
  add column if not exists is_side_dish boolean not null default false;
alter table madplan.tag_groups
  add column if not exists is_category boolean not null default false;

-- ─── Tilbehør pr. dag i ugeplanen ──────────────────────────────────────────
create table if not exists madplan.plan_day_sides (
  day date not null references madplan.plan_days (day) on delete cascade on update cascade,
  recipe_id uuid not null references madplan.recipes (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (day, recipe_id)
);
create index if not exists plan_day_sides_recipe_idx on madplan.plan_day_sides (recipe_id);

grant select, insert, update, delete on madplan.plan_day_sides to authenticated;
grant all on madplan.plan_day_sides to service_role;
alter table madplan.plan_day_sides enable row level security;
drop policy if exists "members all" on madplan.plan_day_sides;
create policy "members all" on madplan.plan_day_sides for all to authenticated
  using (madplan.is_member()) with check (madplan.is_member());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'madplan' and tablename = 'plan_day_sides'
  ) then
    alter publication supabase_realtime add table madplan.plan_day_sides;
  end if;
end $$;

-- ─── Tag-gruppen "Kategori" ────────────────────────────────────────────────
insert into madplan.tag_groups (name, sort_order, is_category)
select 'Kategori', 5, true
where not exists (select 1 from madplan.tag_groups where lower(name) = 'kategori');
update madplan.tag_groups set is_category = true, sort_order = 5 where lower(name) = 'kategori';

-- Opret de tags der mangler, og flyt de eksisterende ind i gruppen
insert into madplan.tags (name, group_id, sort_order)
select v.name, (select id from madplan.tag_groups where lower(name) = 'kategori'), v.so
from (values ('Hovedret', 10), ('Tilbehør', 20), ('Brød', 30), ('Kage', 40), ('Snacks', 50)) v(name, so)
where not exists (select 1 from madplan.tags t where lower(t.name) = lower(v.name));

update madplan.tags t
set group_id = (select id from madplan.tag_groups where lower(name) = 'kategori'),
    sort_order = v.so,
    is_side_dish = (v.name = 'Tilbehør'),
    -- Brød, kage og snacks er ikke aftensmad og foreslås ikke i ugeplanen
    exclude_from_planner = v.name in ('Brød', 'Kage', 'Snacks')
from (values ('Hovedret', 10), ('Tilbehør', 20), ('Brød', 30), ('Kage', 40), ('Snacks', 50)) v(name, so)
where lower(t.name) = lower(v.name);

-- ─── Giv eksisterende opskrifter en kategori ───────────────────────────────
-- Kartoffelsalaten er tilbehør
insert into madplan.recipe_tags (recipe_id, tag_id)
select r.id, t.id
from madplan.recipes r, madplan.tags t
where r.title ilike 'kartoffelsalat%' and lower(t.name) = 'tilbehør'
on conflict do nothing;

-- Øvrige opskrifter uden kategori og uden "Aldrig i ugeplan" er hovedretter
insert into madplan.recipe_tags (recipe_id, tag_id)
select r.id, (select id from madplan.tags where lower(name) = 'hovedret')
from madplan.recipes r
where not exists (
  select 1 from madplan.recipe_tags rt
  join madplan.tags t on t.id = rt.tag_id
  join madplan.tag_groups g on g.id = t.group_id
  where rt.recipe_id = r.id and (g.is_category or t.exclude_from_planner)
)
on conflict do nothing;

-- ─── Spist-log: én registrering pr. ret pr. dag (hovedret + tilbehør) ──────
alter table madplan.meal_log drop constraint if exists meal_log_plan_day_id_key;
create unique index if not exists meal_log_plan_day_recipe_key
  on madplan.meal_log (plan_day_id, recipe_id);

create or replace function madplan.sync_meal_log()
returns void
language plpgsql security invoker set search_path = madplan, public
as $$
begin
  if not madplan.is_member() then
    return;
  end if;

  -- Passerede dage: hovedret og tilbehør registreres som spist
  insert into madplan.meal_log (recipe_id, eaten_on, plan_day_id)
  select p.recipe_id, p.day, p.plan_day_id
  from (
    select pd.id as plan_day_id, pd.day, pd.recipe_id
    from madplan.plan_days pd
    where pd.day < madplan.today_dk() and pd.kind = 'recipe' and pd.recipe_id is not null
    union
    select pd.id, pd.day, s.recipe_id
    from madplan.plan_days pd
    join madplan.plan_day_sides s on s.day = pd.day
    where pd.day < madplan.today_dk() and pd.kind = 'recipe'
  ) p
  on conflict (plan_day_id, recipe_id) do update
    set eaten_on = excluded.eaten_on
    where madplan.meal_log.eaten_on is distinct from excluded.eaten_on;

  -- Fjern registreringer, hvor dagen er ændret, så retten ikke længere står der
  delete from madplan.meal_log ml
  using madplan.plan_days pd
  where ml.plan_day_id = pd.id
    and not (
      (pd.kind = 'recipe' and pd.recipe_id = ml.recipe_id)
      or (pd.kind = 'recipe' and exists (
        select 1 from madplan.plan_day_sides s where s.day = pd.day and s.recipe_id = ml.recipe_id
      ))
    );
end $$;

grant execute on function madplan.sync_meal_log() to authenticated;

notify pgrst, 'reload schema';
