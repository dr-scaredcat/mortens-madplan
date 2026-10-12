-- "Varelager" er omdøbt til "Basisvarer": varer der lægges på indkøbslisten,
-- når de er løbet tør, får kilden "Basisvarer" (og ingen mængde).
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
      jsonb_build_array(jsonb_build_object('ingredient_id', p_ingredient_id, 'source', 'Basisvarer'))
    );
  end if;
end $$;

update madplan.shopping_items
set sources = array_replace(sources, 'Varelager', 'Basisvarer')
where 'Varelager' = any(sources);
