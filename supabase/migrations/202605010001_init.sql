create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'USER' check (role in ('USER', 'ADMIN')),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null unique references public.users(id) on delete cascade,
  "firstName" text not null,
  "lastName" text not null,
  avatar text,
  bio text,
  phone text,
  "chessRating" integer
);

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  "startDate" timestamptz not null,
  "endDate" timestamptz not null,
  location text not null,
  "entryFee" numeric not null,
  "prizePool" numeric not null,
  "maxPlayers" integer not null,
  "currentPlayers" integer not null default 0,
  status text not null default 'UPCOMING' check (status in ('UPCOMING', 'RUNNING', 'PAST', 'CANCELLED')),
  "createdBy" uuid not null references public.users(id),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  "tournamentId" uuid not null references public.tournaments(id) on delete cascade,
  amount numeric not null,
  currency text not null default 'INR',
  "razorpayOrderId" text unique,
  "razorpayPaymentId" text unique,
  "razorpaySignature" text,
  status text not null default 'CREATED' check (status in ('CREATED', 'PAID', 'FAILED')),
  "createdAt" timestamptz not null default now()
);

create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  "tournamentId" uuid not null references public.tournaments(id) on delete cascade,
  "paymentId" uuid references public.payments(id) on delete set null,
  status text not null default 'PENDING' check (status in ('PENDING', 'CONFIRMED', 'CANCELLED')),
  "createdAt" timestamptz not null default now(),
  unique ("userId", "tournamentId")
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  content text not null,
  "imageUrl" text,
  "likesCount" integer not null default 0,
  "commentsCount" integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "isDeleted" boolean not null default false
);

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  "postId" uuid not null references public.posts(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  unique ("userId", "postId")
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  "userId" uuid not null references public.users(id) on delete cascade,
  "postId" uuid not null references public.posts(id) on delete cascade,
  content text not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  "isRead" boolean not null default false,
  "createdAt" timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'USER'))
  on conflict (id) do update set email = excluded.email;

  insert into public.profiles ("userId", "firstName", "lastName")
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'firstName', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'lastName', '')
  )
  on conflict ("userId") do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.bump_post_likes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set "likesCount" = "likesCount" + 1 where id = new."postId";
    return new;
  end if;
  update public.posts set "likesCount" = greatest("likesCount" - 1, 0) where id = old."postId";
  return old;
end;
$$;

drop trigger if exists post_likes_count_insert on public.post_likes;
drop trigger if exists post_likes_count_delete on public.post_likes;
create trigger post_likes_count_insert after insert on public.post_likes for each row execute function public.bump_post_likes();
create trigger post_likes_count_delete after delete on public.post_likes for each row execute function public.bump_post_likes();

create or replace function public.bump_post_comments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set "commentsCount" = "commentsCount" + 1 where id = new."postId";
    return new;
  end if;
  update public.posts set "commentsCount" = greatest("commentsCount" - 1, 0) where id = old."postId";
  return old;
end;
$$;

drop trigger if exists post_comments_count_insert on public.post_comments;
drop trigger if exists post_comments_count_delete on public.post_comments;
create trigger post_comments_count_insert after insert on public.post_comments for each row execute function public.bump_post_comments();
create trigger post_comments_count_delete after delete on public.post_comments for each row execute function public.bump_post_comments();

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.payments enable row level security;
alter table public.tournament_registrations enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.contact_messages enable row level security;

create policy "Users are readable" on public.users for select using (true);
create policy "Users update own row" on public.users for update using (auth.uid() = id);

create policy "Profiles are readable" on public.profiles for select using (true);
create policy "Profiles update own row" on public.profiles for update using (auth.uid() = "userId");

create policy "Tournaments are readable" on public.tournaments for select using (true);
create policy "Admins manage tournaments" on public.tournaments for all using (public.is_admin()) with check (public.is_admin());

create policy "Payments own or admin readable" on public.payments for select using (auth.uid() = "userId" or public.is_admin());

create policy "Registrations own or admin readable" on public.tournament_registrations for select using (auth.uid() = "userId" or public.is_admin());

create policy "Posts are readable" on public.posts for select using (true);
create policy "Users create posts" on public.posts for insert with check (auth.uid() = "userId");
create policy "Owners and admins update posts" on public.posts for update using (auth.uid() = "userId" or public.is_admin());

create policy "Likes are readable" on public.post_likes for select using (true);
create policy "Users like as self" on public.post_likes for insert with check (auth.uid() = "userId");
create policy "Users remove own likes" on public.post_likes for delete using (auth.uid() = "userId");

create policy "Comments are readable" on public.post_comments for select using (true);
create policy "Users comment as self" on public.post_comments for insert with check (auth.uid() = "userId");
create policy "Owners and admins remove comments" on public.post_comments for delete using (auth.uid() = "userId" or public.is_admin());

create policy "Anyone can submit contact" on public.contact_messages for insert with check (true);
create policy "Admins read contact" on public.contact_messages for select using (public.is_admin());
create policy "Admins update contact" on public.contact_messages for update using (public.is_admin());

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('post-images', 'post-images', true)
on conflict (id) do update set public = excluded.public;

create policy "Public avatar reads" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "Public post image reads" on storage.objects for select using (bucket_id = 'post-images');
create policy "Users upload post images" on storage.objects for insert with check (bucket_id = 'post-images' and auth.role() = 'authenticated');
