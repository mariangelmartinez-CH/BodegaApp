alter table public.cash_counts
  add column billetes numeric(14, 2) check (billetes >= 0),
  add column monedas numeric(14, 2) check (monedas >= 0);

alter table public.weekly_closings
  add column billetes numeric(14, 2) check (billetes >= 0),
  add column monedas numeric(14, 2) check (monedas >= 0);
