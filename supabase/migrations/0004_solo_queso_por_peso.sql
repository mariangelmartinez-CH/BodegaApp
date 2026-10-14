update public.products
set fraccionable = false,
    unidad_venta = 'unidad'
where fraccionable
  and nombre <> 'Queso';

update public.products
set unidad_venta = 'unidad'
where unidad_venta = 'cigarrillo';
