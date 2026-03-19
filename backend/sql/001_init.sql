-- Initial schema for tripureswari marketplace

create table if not exists users (
  id serial primary key,
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'buyer',
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists otp_codes (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists refresh_tokens (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists password_resets (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id serial primary key,
  name text unique not null
);

create table if not exists sellers (
  id serial primary key,
  user_id int unique not null references users(id) on delete cascade,
  shop_name text not null,
  phone text,
  address text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id serial primary key,
  seller_id int references sellers(id) on delete set null,
  category_id int references categories(id) on delete set null,
  title text not null,
  description text,
  price numeric(12,2) not null,
  stock int not null default 0,
  image text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists cart_items (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  product_id int not null references products(id) on delete cascade,
  qty int not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists wishlist_items (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  product_id int not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists orders (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  total_amount numeric(12,2) not null,
  status text not null default 'placed',
  shipping_address jsonb,
  payment_method text,
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id serial primary key,
  order_id int not null references orders(id) on delete cascade,
  product_id int not null references products(id) on delete set null,
  title text not null,
  price numeric(12,2) not null,
  qty int not null,
  line_total numeric(12,2) not null
);

insert into categories (name)
values
  ('Home & Living'),
  ('Kitchen & Dining'),
  ('Gifts'),
  ('Spiritual & Cultural'),
  ('Fashion & Accessories')
on conflict do nothing;
