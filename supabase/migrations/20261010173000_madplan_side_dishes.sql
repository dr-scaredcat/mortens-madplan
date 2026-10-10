-- ════════════════════════════════════════════════════════════════════════════
-- Astons Køkken — tilbehør
--
-- Opskrifter med et tag markeret is_side_dish (fx "Tilbehør") er dele-elementer
-- som kartoffelsalat. De foreslås ikke som aftensmad i sig selv, men kan
-- tilføjes til en dag i ugeplanen ved siden af hovedretten.
-- ════════════════════════════════════════════════════════════════════════════

alter table madplan.tags
  add column if not exists is_side_dish boolean not null default false;

update madplan.tags set is_side_dish = true where lower(name) = 'tilbehør';

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

alter publication supabase_realtime add table madplan.plan_day_sides;

notify pgrst, 'reload schema';
