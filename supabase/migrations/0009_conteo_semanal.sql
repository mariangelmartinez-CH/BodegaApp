create table public.weekly_closings (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'borrador' check (estado in ('borrador', 'cerrado')),
  es_inicial boolean not null default false,
  efectivo_contado numeric(14, 2) check (efectivo_contado >= 0),
  notas text,
  creado_en timestamptz not null default now(),
  creado_por uuid not null references auth.users (id) default auth.uid(),
  cerrado_en timestamptz
);

create unique index un_solo_borrador on public.weekly_closings (estado) where estado = 'borrador';

create table public.closing_counts (
  id uuid primary key default gen_random_uuid(),
  cierre_id uuid not null references public.weekly_closings (id) on delete cascade,
  producto_id uuid not null references public.products (id),
  stock_sistema numeric(12, 3) not null,
  stock_contado numeric(12, 3) not null check (stock_contado >= 0),
  vendido numeric(12, 3),
  precio_unitario numeric(14, 2),
  costo_unitario numeric(14, 2),
  contado_en timestamptz not null default now(),
  unique (cierre_id, producto_id)
);

alter table public.weekly_closings enable row level security;
alter table public.closing_counts enable row level security;

create policy "usuarios activos ven cierres"
  on public.weekly_closings for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra abre cierres"
  on public.weekly_closings for insert
  to authenticated
  with check (public.puede_registrar() and creado_por = auth.uid() and estado = 'borrador');

create policy "quien registra edita borradores"
  on public.weekly_closings for update
  to authenticated
  using (public.puede_registrar() and estado = 'borrador')
  with check (estado = 'borrador');

create policy "usuarios activos ven conteos"
  on public.closing_counts for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra crea conteos"
  on public.closing_counts for insert
  to authenticated
  with check (
    public.puede_registrar()
    and exists (
      select 1 from public.weekly_closings c
      where c.id = cierre_id and c.estado = 'borrador'
    )
  );

create policy "quien registra edita conteos"
  on public.closing_counts for update
  to authenticated
  using (
    public.puede_registrar()
    and exists (
      select 1 from public.weekly_closings c
      where c.id = cierre_id and c.estado = 'borrador'
    )
  )
  with check (public.puede_registrar());

grant select, insert, update on public.weekly_closings to authenticated;
grant select, insert, update on public.closing_counts to authenticated;

create function public.cerrar_semana(p_cierre uuid, p_efectivo numeric)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  es_primero boolean;
  r record;
  diferencia numeric;
begin
  if not public.puede_registrar() then
    raise exception 'No tienes permiso para cerrar la semana';
  end if;

  if not exists (
    select 1 from public.weekly_closings where id = p_cierre and estado = 'borrador'
  ) then
    raise exception 'El cierre no existe o ya esta cerrado';
  end if;

  es_primero := not exists (select 1 from public.weekly_closings where estado = 'cerrado');

  for r in
    select
      c.id,
      c.producto_id,
      c.stock_contado,
      p.precio_venta,
      p.costo_paquete,
      p.unidades_por_paquete,
      coalesce(
        (select sum(m.cantidad) from public.stock_movements m where m.producto_id = c.producto_id),
        0
      ) as stock_actual
    from public.closing_counts c
    join public.products p on p.id = c.producto_id
    where c.cierre_id = p_cierre
  loop
    diferencia := r.stock_contado - r.stock_actual;

    update public.closing_counts
    set stock_sistema = r.stock_actual,
        vendido = case when es_primero then 0 else greatest(-diferencia, 0) end,
        precio_unitario = r.precio_venta,
        costo_unitario = case
          when r.costo_paquete is null then null
          else r.costo_paquete / r.unidades_por_paquete
        end
    where id = r.id;

    if diferencia <> 0 then
      insert into public.stock_movements (producto_id, cantidad, tipo, nota, creado_por)
      values (
        r.producto_id,
        diferencia,
        case
          when es_primero then 'inicial'
          when diferencia < 0 then 'venta'
          else 'ajuste'
        end,
        'cierre semanal',
        auth.uid()
      );
    end if;
  end loop;

  update public.weekly_closings
  set estado = 'cerrado',
      es_inicial = es_primero,
      efectivo_contado = p_efectivo,
      cerrado_en = now()
  where id = p_cierre;
end;
$$;

revoke execute on function public.cerrar_semana(uuid, numeric) from public, anon;
grant execute on function public.cerrar_semana(uuid, numeric) to authenticated;

alter publication supabase_realtime add table public.weekly_closings;
alter publication supabase_realtime add table public.closing_counts;
