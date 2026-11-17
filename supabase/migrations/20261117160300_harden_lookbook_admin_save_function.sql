create or replace function public.save_lookbook_look(p_look jsonb, p_products jsonb)
returns uuid language plpgsql security invoker set search_path = public, pg_temp as $$
declare v_id uuid;
begin
  if coalesce((select private.is_admin()), false) is not true then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if coalesce(p_look->>'id', '') <> '' then
    update public.lookbook_looks set slug=p_look->>'slug', title=p_look->>'title', description=nullif(p_look->>'description',''), image_url=p_look->>'image_url', alt_text=nullif(p_look->>'alt_text',''), sort_order=coalesce((p_look->>'sort_order')::integer,0), is_active=coalesce((p_look->>'is_active')::boolean,true), starts_at=nullif(p_look->>'starts_at','')::timestamptz, ends_at=nullif(p_look->>'ends_at','')::timestamptz, updated_at=now() where id=(p_look->>'id')::uuid returning id into v_id;
    if v_id is null then raise exception 'Look not found'; end if;
  else
    insert into public.lookbook_looks(slug,title,description,image_url,alt_text,sort_order,is_active,starts_at,ends_at)
    values(p_look->>'slug',p_look->>'title',nullif(p_look->>'description',''),p_look->>'image_url',nullif(p_look->>'alt_text',''),coalesce((p_look->>'sort_order')::integer,0),coalesce((p_look->>'is_active')::boolean,true),nullif(p_look->>'starts_at','')::timestamptz,nullif(p_look->>'ends_at','')::timestamptz) returning id into v_id;
  end if;
  delete from public.lookbook_look_products where look_id=v_id;
  insert into public.lookbook_look_products(look_id,product_id,sort_order,default_size,default_color,default_quantity)
  select v_id,(item->>'product_id')::uuid,(ordinality-1)::integer,nullif(item->>'default_size',''),nullif(item->>'default_color',''),greatest(1,least(10,coalesce((item->>'default_quantity')::integer,1)))
  from jsonb_array_elements(coalesce(p_products,'[]'::jsonb)) with ordinality as items(item,ordinality);
  return v_id;
end; $$;
revoke all on function public.save_lookbook_look(jsonb,jsonb) from public, anon;
grant execute on function public.save_lookbook_look(jsonb,jsonb) to authenticated;