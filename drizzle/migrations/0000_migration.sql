create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id,role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.claim_admin() returns boolean language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then return false; end if;
  if lower(coalesce(auth.jwt()->>'email','')) = 'amaralgasadmin@gmail.com' then
    insert into public.user_roles(user_id,role) values (auth.uid(),'admin') on conflict do nothing;
  end if;
  return public.has_role(auth.uid(),'admin');
end $$;

create table public.products (
  id text primary key, name text not null, description text not null default '', category text not null default 'gas',
  price numeric(10,2) not null default 0, old_price numeric(10,2), cost numeric(10,2) not null default 0,
  image_url text, emoji text not null default '🔥', featured boolean not null default false, active boolean not null default true,
  stock integer not null default 0, min_stock integer not null default 5, items text[] not null default '{}', sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select on public.products to anon, authenticated; grant insert,update,delete on public.products to authenticated; grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public read active" on public.products for select using (active or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(), number serial unique, customer_name text not null, customer_whatsapp text not null,
  address jsonb not null, payment_method text not null, change_for text, items jsonb not null, notes text,
  subtotal numeric(10,2) not null default 0, delivery numeric(10,2) not null default 0, discount numeric(10,2) not null default 0, total numeric(10,2) not null default 0,
  status text not null default 'recebido', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
grant select,update,delete on public.orders to authenticated; grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "admin all orders" on public.orders for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.stock_movements (id uuid primary key default gen_random_uuid(), product_id text not null references public.products(id) on delete cascade, qty integer not null, kind text not null default 'entrada', note text, unit_cost numeric(10,2), created_at timestamptz not null default now());
create table public.suppliers (id uuid primary key default gen_random_uuid(), name text not null, phone text, email text, document text, notes text, created_at timestamptz not null default now());
create table public.expenses (id uuid primary key default gen_random_uuid(), description text not null, category text not null default 'Outros', amount numeric(10,2) not null, due_date date not null default current_date, paid boolean not null default false, supplier_id uuid references public.suppliers(id) on delete set null, created_at timestamptz not null default now());
create table public.drivers (id uuid primary key default gen_random_uuid(), name text not null, phone text, vehicle text, active boolean not null default true, created_at timestamptz not null default now());
alter table public.orders add column driver_id uuid references public.drivers(id) on delete set null;
do $$ declare t text; begin foreach t in array array['stock_movements','suppliers','expenses','drivers'] loop
  execute format('grant select,insert,update,delete on public.%I to authenticated; grant all on public.%I to service_role; alter table public.%I enable row level security; create policy "admin all" on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''));', t,t,t,t);
end loop; end $$;

create or replace function public.apply_stock_movement() returns trigger language plpgsql security definer set search_path=public as $$
begin update public.products set stock = stock + (case when new.kind='saida' then -abs(new.qty) else new.qty end), updated_at=now() where id=new.product_id; return new; end $$;
create trigger trg_stock after insert on public.stock_movements for each row execute function public.apply_stock_movement();

create or replace function public.create_order(payload jsonb) returns integer language plpgsql security definer set search_path=public as $$
declare n integer; it jsonb;
begin
  insert into public.orders(customer_name,customer_whatsapp,address,payment_method,change_for,items,notes,subtotal,delivery,discount,total)
  values (left(payload->>'customer_name',120), left(payload->>'customer_whatsapp',30), payload->'address', payload->>'payment_method', payload->>'change_for',
    payload->'items', payload->>'notes', coalesce((payload->>'subtotal')::numeric,0), coalesce((payload->>'delivery')::numeric,0), coalesce((payload->>'discount')::numeric,0), coalesce((payload->>'total')::numeric,0))
  returning number into n;
  for it in select * from jsonb_array_elements(coalesce(payload->'items','[]'::jsonb)) loop
    if exists(select 1 from public.products where id = it->>'id') then
      insert into public.stock_movements(product_id,qty,kind,note) values (it->>'id', greatest(coalesce((it->>'qty')::int,0),0), 'saida', 'Pedido #'||n);
    end if;
  end loop;
  return n;
end $$;
grant execute on function public.create_order(jsonb) to anon, authenticated;

create or replace function public.order_statuses(_numbers integer[]) returns table(number integer, status text) language sql stable security definer set search_path=public as $$ select o.number, o.status from public.orders o where o.number = any(_numbers) $$;
grant execute on function public.order_statuses(integer[]) to anon, authenticated;

insert into public.products(id,name,description,category,price,cost,emoji,featured,stock,sort_order) values
('gas-p13','Gás P13','Botijão de 13kg','gas',120,90,'🔥',true,50,1),
('agua-20l','Água Mineral 20L','Galão de 20 litros','agua',15,8,'💧',true,80,2),
('agua-500','Água 500ml (fardo)','Fardo com 12 garrafas','agua',18,10,'💧',false,40,3);

create policy "admin manage imgs" on storage.objects for all to authenticated using (bucket_id='product-images' and public.has_role(auth.uid(),'admin')) with check (bucket_id='product-images' and public.has_role(auth.uid(),'admin'));
create policy "read imgs" on storage.objects for select using (bucket_id='product-images');