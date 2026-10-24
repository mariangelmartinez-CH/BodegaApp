update public.products
set categoria_id = (select id from public.categories where nombre = 'Víveres')
where nombre = 'Leche en polvo San Simón';
