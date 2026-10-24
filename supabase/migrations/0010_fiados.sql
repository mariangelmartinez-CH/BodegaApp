create table public.customers (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create unique index customers_nombre_unico on public.customers (lower(nombre));

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.customers (id),
  monto numeric(14, 2) not null check (monto > 0),
  fecha date not null default current_date,
  nota text,
  creado_en timestamptz not null default now(),
  creado_por uuid not null references auth.users (id) default auth.uid()
);

create table public.debt_payments (
  id uuid primary key default gen_random_uuid(),
  deuda_id uuid not null references public.debts (id) on delete cascade,
  monto numeric(14, 2) not null check (monto > 0),
  fecha date not null default current_date,
  creado_en timestamptz not null default now(),
  creado_por uuid not null references auth.users (id) default auth.uid()
);

create index debt_payments_deuda on public.debt_payments (deuda_id);

create view public.fiados_saldo
with (security_invoker = true)
as
select
  d.id,
  d.cliente_id,
  c.nombre as cliente,
  d.monto,
  d.fecha,
  d.nota,
  coalesce(sum(p.monto), 0) as pagado,
  d.monto - coalesce(sum(p.monto), 0) as saldo
from public.debts d
join public.customers c on c.id = d.cliente_id
left join public.debt_payments p on p.deuda_id = d.id
group by d.id, c.nombre;

alter table public.customers enable row level security;
alter table public.debts enable row level security;
alter table public.debt_payments enable row level security;

create policy "usuarios activos ven clientes"
  on public.customers for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra crea clientes"
  on public.customers for insert
  to authenticated
  with check (public.puede_registrar());

create policy "quien registra edita clientes"
  on public.customers for update
  to authenticated
  using (public.puede_registrar())
  with check (public.puede_registrar());

create policy "usuarios activos ven fiados"
  on public.debts for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra crea fiados"
  on public.debts for insert
  to authenticated
  with check (public.puede_registrar() and creado_por = auth.uid());

create policy "el admin borra fiados"
  on public.debts for delete
  to authenticated
  using (public.es_admin());

create policy "usuarios activos ven pagos"
  on public.debt_payments for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra crea pagos"
  on public.debt_payments for insert
  to authenticated
  with check (public.puede_registrar() and creado_por = auth.uid());

create policy "el admin borra pagos"
  on public.debt_payments for delete
  to authenticated
  using (public.es_admin());

grant select, insert, update on public.customers to authenticated;
grant select, insert, delete on public.debts to authenticated;
grant select, insert, delete on public.debt_payments to authenticated;
grant select on public.fiados_saldo to authenticated;

alter publication supabase_realtime add table public.customers;
alter publication supabase_realtime add table public.debts;
alter publication supabase_realtime add table public.debt_payments;
