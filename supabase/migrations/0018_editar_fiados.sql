create policy "quien registra edita fiados"
  on public.debts for update
  to authenticated
  using (public.puede_registrar())
  with check (public.puede_registrar());

grant update (monto, nota) on public.debts to authenticated;

create function public.validar_monto_fiado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  pagado numeric;
begin
  select coalesce(sum(monto), 0) into pagado
  from public.debt_payments
  where deuda_id = new.id;

  if new.monto < pagado then
    raise exception 'El monto no puede ser menor a lo que ya se pago';
  end if;

  return new;
end;
$$;

revoke execute on function public.validar_monto_fiado() from public, anon, authenticated;

create trigger al_editar_fiado
  before update of monto on public.debts
  for each row execute function public.validar_monto_fiado();
