update public.products
set categoria_id = (select id from public.categories where nombre = 'Víveres')
where categoria_id = (select id from public.categories where nombre = 'Otras bebidas')
  and nombre in ('Frutiño', 'Suntea');

update public.products
set categoria_id = (select id from public.categories where nombre = 'Refrescos y jugos')
where categoria_id = (select id from public.categories where nombre = 'Otras bebidas');

delete from public.categories c
where c.nombre = 'Otras bebidas'
  and not exists (select 1 from public.products p where p.categoria_id = c.id);
