create table public.cash_counts (
  id uuid primary key default gen_random_uuid(),
  monto numeric(14, 2) not null check (monto >= 0),
  nota text,
  creado_en timestamptz not null default now(),
  creado_por uuid not null references auth.users (id) default auth.uid()
);

alter table public.cash_counts enable row level security;

create policy "usuarios activos ven el efectivo"
  on public.cash_counts for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "quien registra anota efectivo"
  on public.cash_counts for insert
  to authenticated
  with check (public.puede_registrar() and creado_por = auth.uid());

create policy "el admin borra efectivo"
  on public.cash_counts for delete
  to authenticated
  using (public.es_admin());

grant select, insert, delete on public.cash_counts to authenticated;

alter publication supabase_realtime add table public.cash_counts;
