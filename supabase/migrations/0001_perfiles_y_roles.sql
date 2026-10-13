create type public.rol_usuario as enum ('admin', 'operador', 'observador');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol public.rol_usuario not null default 'observador',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table public.profiles enable row level security;

create function public.rol_actual()
returns public.rol_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select rol from public.profiles where id = auth.uid() and activo
$$;

create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.rol_actual() = 'admin', false)
$$;

create function public.puede_registrar()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.rol_actual() in ('admin', 'operador'), false)
$$;

create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

create policy "los usuarios activos ven los perfiles"
  on public.profiles for select
  to authenticated
  using (public.rol_actual() is not null);

create policy "solo el admin edita perfiles"
  on public.profiles for update
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

grant select, update on public.profiles to authenticated;

revoke execute on function public.rol_actual() from public, anon;
revoke execute on function public.es_admin() from public, anon;
revoke execute on function public.puede_registrar() from public, anon;
revoke execute on function public.crear_perfil() from public, anon, authenticated;

grant execute on function public.rol_actual() to authenticated;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.puede_registrar() to authenticated;
