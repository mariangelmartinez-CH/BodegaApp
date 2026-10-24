drop index if exists public.products_nombre_unico;

create unique index products_nombre_unico on public.products (lower(nombre)) where activo;
