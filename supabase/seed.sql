insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@chessmaster.com',
  crypt('Admin@123456', gen_salt('bf')),
  now(),
  '{"firstName":"Chess","lastName":"Admin","role":"ADMIN"}'::jsonb,
  now(),
  now()
)
on conflict (id) do nothing;

update public.users
set role = 'ADMIN'
where id = '00000000-0000-0000-0000-000000000001';

update public.profiles
set bio = 'Platform administrator',
    "chessRating" = 2200
where "userId" = '00000000-0000-0000-0000-000000000001';

insert into public.tournaments (
  id,
  title,
  description,
  "startDate",
  "endDate",
  location,
  "entryFee",
  "prizePool",
  "maxPlayers",
  "currentPlayers",
  status,
  "createdBy"
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Mumbai Open 2026',
    'Annual open chess tournament for all skill levels. Players of all ratings are welcome to compete in this prestigious event held in the heart of Mumbai.',
    '2026-06-01T09:00:00Z',
    '2026-06-05T18:00:00Z',
    'Mumbai, Maharashtra',
    500,
    50000,
    64,
    0,
    'UPCOMING',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Delhi Rapid Championship 2026',
    'Rapid format tournament with G/15 time control. Fast-paced exciting chess for experienced players looking for a competitive challenge.',
    '2026-07-10T10:00:00Z',
    '2026-07-12T17:00:00Z',
    'New Delhi',
    300,
    25000,
    32,
    0,
    'UPCOMING',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Bangalore Blitz 2026',
    'Intense blitz chess tournament. 5+2 time control. Perfect for players who enjoy fast-paced tactical battles.',
    '2026-08-20T11:00:00Z',
    '2026-08-21T19:00:00Z',
    'Bangalore, Karnataka',
    200,
    15000,
    48,
    0,
    'UPCOMING',
    '00000000-0000-0000-0000-000000000001'
  )
on conflict (id) do nothing;
