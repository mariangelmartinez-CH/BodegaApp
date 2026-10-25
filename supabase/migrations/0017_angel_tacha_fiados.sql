create function public.puede_cobrar_fiados()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.rol_actual() in ('admin', 'operador', 'gestor_pedidos'), false)
$$;

revoke execute on function public.puede_cobrar_fiados() from public, anon;
grant execute on function public.puede_cobrar_fiados() to authenticated;

drop policy "quien registra crea pagos" on public.debt_payments;

create policy "quien cobra crea pagos"
  on public.debt_payments for insert
  to authenticated
  with check (public.puede_cobrar_fiados() and creado_por = auth.uid());
