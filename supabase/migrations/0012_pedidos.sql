create function public.puede_gestionar_pedidos()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.rol_actual() in ('admin', 'gestor_pedidos'), false)
$$;

revoke execute on function public.puede_gestionar_pedidos() from public, anon;
grant execute on function public.puede_gestionar_pedidos() to authenticated;

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create unique index suppliers_nombre_unico on public.suppliers (lower(nombre));

create table public.supplier_orders (
  id uuid primary key default gen_random_uuid(),
  proveedor_id uuid not null references public.suppliers (id),
  fecha_pedido date not null default current_date,
  fecha_limite date,
  monto_bs numeric(14, 2) not null check (monto_bs >= 0),
  detalle text,
  pagado boolean not null default false,
  pagado_en timestamptz,
  recibido boolean not null default false,
  recibido_en timestamptz,
  recibido_por uuid references auth.users (id),
  creado_en timestamptz not null default now(),
  creado_por uuid not null references auth.users (id) default auth.uid()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.supplier_orders (id) on delete cascade,
  producto_id uuid not null references public.products (id),
  paquetes numeric(12, 3) not null check (paquetes > 0)
);

create index order_items_pedido on public.order_items (pedido_id);

alter table public.suppliers enable row level security;
alter table public.supplier_orders enable row level security;
alter table public.order_items enable row level security;

create policy "usuarios activos ven distribuidoras"
  on public.suppliers for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien gestiona pedidos crea distribuidoras"
  on public.suppliers for insert
  to authenticated
  with check (public.puede_gestionar_pedidos());

create policy "quien gestiona pedidos edita distribuidoras"
  on public.suppliers for update
  to authenticated
  using (public.puede_gestionar_pedidos())
  with check (public.puede_gestionar_pedidos());

create policy "usuarios activos ven pedidos"
  on public.supplier_orders for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien gestiona pedidos los crea"
  on public.supplier_orders for insert
  to authenticated
  with check (public.puede_gestionar_pedidos() and creado_por = auth.uid());

create policy "quien gestiona pedidos los edita"
  on public.supplier_orders for update
  to authenticated
  using (public.puede_gestionar_pedidos())
  with check (public.puede_gestionar_pedidos());

create policy "usuarios activos ven el detalle de pedidos"
  on public.order_items for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien gestiona pedidos agrega detalle"
  on public.order_items for insert
  to authenticated
  with check (
    public.puede_gestionar_pedidos()
    and exists (
      select 1 from public.supplier_orders o
      where o.id = pedido_id and not o.recibido
    )
  );

create policy "quien gestiona pedidos edita detalle"
  on public.order_items for update
  to authenticated
  using (
    public.puede_gestionar_pedidos()
    and exists (
      select 1 from public.supplier_orders o
      where o.id = pedido_id and not o.recibido
    )
  )
  with check (public.puede_gestionar_pedidos());

create policy "quien gestiona pedidos quita detalle"
  on public.order_items for delete
  to authenticated
  using (
    public.puede_gestionar_pedidos()
    and exists (
      select 1 from public.supplier_orders o
      where o.id = pedido_id and not o.recibido
    )
  );

grant select, insert, update on public.suppliers to authenticated;
grant select on public.supplier_orders to authenticated;
grant insert (proveedor_id, fecha_limite, monto_bs, detalle) on public.supplier_orders to authenticated;
grant update (proveedor_id, fecha_limite, monto_bs, detalle, pagado, pagado_en) on public.supplier_orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;

create function public.recibir_pedido(p_pedido uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.puede_registrar() then
    raise exception 'No tienes permiso para recibir pedidos';
  end if;

  if not exists (
    select 1 from public.supplier_orders where id = p_pedido and not recibido
  ) then
    raise exception 'El pedido no existe o ya fue recibido';
  end if;

  insert into public.stock_movements (producto_id, cantidad, tipo, nota, creado_por)
  select
    i.producto_id,
    i.paquetes * p.unidades_por_paquete,
    'compra',
    'pedido recibido',
    auth.uid()
  from public.order_items i
  join public.products p on p.id = i.producto_id
  where i.pedido_id = p_pedido
    and i.paquetes * p.unidades_por_paquete <> 0;

  update public.supplier_orders
  set recibido = true,
      recibido_en = now(),
      recibido_por = auth.uid()
  where id = p_pedido;
end;
$$;

revoke execute on function public.recibir_pedido(uuid) from public, anon;
grant execute on function public.recibir_pedido(uuid) to authenticated;

alter publication supabase_realtime add table public.suppliers;
alter publication supabase_realtime add table public.supplier_orders;
alter publication supabase_realtime add table public.order_items;
