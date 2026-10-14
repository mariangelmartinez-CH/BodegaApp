create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  emoji text not null default '📦',
  color text not null default 'green',
  orden integer not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categories (id),
  nombre text not null,
  foto_url text,
  unidad_venta text not null default 'unidad',
  fraccionable boolean not null default false,
  unidades_por_paquete numeric(12, 3) not null default 1 check (unidades_por_paquete > 0),
  costo_paquete numeric(14, 2) check (costo_paquete >= 0),
  precio_venta numeric(14, 2) check (precio_venta >= 0),
  precio_paquete numeric(14, 2) check (precio_paquete >= 0),
  stock_minimo numeric(12, 3) not null default 0 check (stock_minimo >= 0),
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users (id) default auth.uid()
);

create unique index products_nombre_unico on public.products (lower(nombre));

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references public.products (id),
  cantidad numeric(12, 3) not null check (cantidad <> 0),
  tipo text not null check (tipo in ('inicial', 'compra', 'venta', 'ajuste', 'anulacion')),
  nota text,
  creado_en timestamptz not null default now(),
  creado_por uuid not null references auth.users (id) default auth.uid()
);

create index stock_movements_producto on public.stock_movements (producto_id);

create view public.inventario
with (security_invoker = true)
as
select
  p.id,
  p.categoria_id,
  p.nombre,
  p.foto_url,
  p.unidad_venta,
  p.fraccionable,
  p.unidades_por_paquete,
  p.costo_paquete,
  p.precio_venta,
  p.precio_paquete,
  p.stock_minimo,
  p.activo,
  coalesce(sum(m.cantidad), 0) as stock
from public.products p
left join public.stock_movements m on m.producto_id = p.id
group by p.id;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;

create policy "usuarios activos ven categorias"
  on public.categories for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra crea categorias"
  on public.categories for insert
  to authenticated
  with check (public.puede_registrar());

create policy "quien registra edita categorias"
  on public.categories for update
  to authenticated
  using (public.puede_registrar())
  with check (public.puede_registrar());

create policy "usuarios activos ven productos"
  on public.products for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra crea productos"
  on public.products for insert
  to authenticated
  with check (public.puede_registrar());

create policy "quien registra edita productos"
  on public.products for update
  to authenticated
  using (public.puede_registrar())
  with check (public.puede_registrar());

create policy "usuarios activos ven movimientos de stock"
  on public.stock_movements for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra crea movimientos de stock"
  on public.stock_movements for insert
  to authenticated
  with check (public.puede_registrar() and creado_por = auth.uid());

grant select, insert, update on public.categories to authenticated;
grant select, insert, update on public.products to authenticated;
grant select, insert on public.stock_movements to authenticated;
grant select on public.inventario to authenticated;

alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.stock_movements;

insert into public.categories (nombre, emoji, color, orden) values
  ('Snacks salados', '🍿', 'orange', 1),
  ('Cereales', '🥣', 'yellow', 2),
  ('Galletas y panadería', '🍪', 'amber', 3),
  ('Dulces', '🍬', 'pink', 4),
  ('Helados y yogurt', '🍦', 'sky', 5),
  ('Refrescos y jugos', '🥤', 'red', 6),
  ('Otras bebidas', '💧', 'blue', 7),
  ('Cervezas', '🍺', 'lime', 8),
  ('Lácteos y huevos', '🥛', 'cyan', 9),
  ('Víveres', '🍝', 'green', 10),
  ('Enlatados y salsas', '🥫', 'purple', 11),
  ('Aseo del hogar', '🧼', 'teal', 12),
  ('Cuidado personal', '🧴', 'indigo', 13),
  ('Cigarros y chimó', '🚬', 'slate', 14);
