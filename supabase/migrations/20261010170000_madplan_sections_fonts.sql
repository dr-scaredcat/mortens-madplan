-- ════════════════════════════════════════════════════════════════════════════
-- Astons Køkken — afsnit i opskrifter og "Aldrig i ugeplan"
-- ════════════════════════════════════════════════════════════════════════════

-- Tags der udelukker en opskrift fra automatiske forslag i ugeplanen
alter table madplan.tags
  add column if not exists exclude_from_planner boolean not null default false;

-- Afsnit/overskrifter i ingredienslister og fremgangsmåde (fx "Sauce", "Dej")
alter table madplan.recipe_ingredients add column if not exists section text;
alter table madplan.recipe_steps add column if not exists section text;

insert into madplan.tags (name, group_id, sort_order, exclude_from_planner)
select 'Aldrig i ugeplan', g.id, 50, true
from madplan.tag_groups g
where g.name = 'Særlige'
on conflict do nothing;

-- Sørg for at et eksisterende tag med samme navn også får flaget
update madplan.tags set exclude_from_planner = true where lower(name) = 'aldrig i ugeplan';

notify pgrst, 'reload schema';
