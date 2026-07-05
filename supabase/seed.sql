-- ============================================================
-- FindIt Campus — Seed Data
-- Run AFTER schema.sql
-- NOTE: Replace user_id values with real UUIDs from auth.users
-- or use Supabase anonymous/demo data
-- ============================================================

-- Insert demo items (using a placeholder user_id - replace with real user)
-- For demo purposes, we'll insert items that don't require auth
-- You can temporarily disable RLS, insert, then re-enable

-- Demo items for the heatmap and browse page
insert into public.items (id, user_id, type, title, description, category, location_lat, location_lng, location_name, status, created_at)
values
  -- These will be inserted via the app after first user signs up
  -- Seed script is a template - run after creating first account
  -- Replace 'YOUR_USER_ID' with your actual user UUID from Supabase Auth dashboard

  ('11111111-0000-0000-0000-000000000001', 
   '00000000-0000-0000-0000-000000000000', -- Replace with real user_id
   'lost', 'Blue Water Bottle', 
   'Insulated blue Hydro Flask water bottle, 32oz, with a few stickers on it including a mountain sticker and a smiley face. Lost near the gym area.', 
   'bottle', 12.9716, 77.5946, 'Gym / Sports Complex', 'active',
   now() - interval '2 days'),

  ('11111111-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000000',
   'found', 'Student ID Card',
   'Found a student ID card near the library entrance. Name on card starts with ''R''. Please describe it to claim.',
   'id_card', 12.9720, 77.5950, 'Main Library', 'active',
   now() - interval '1 day'),

  ('11111111-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000000',
   'lost', 'Black Laptop Bag',
   'Dell laptop bag, black with grey trim, has a red keychain attached. Contains charger and notebook. Lost at the canteen.',
   'bag', 12.9710, 77.5940, 'Student Canteen', 'active',
   now() - interval '3 days'),

  ('11111111-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000000',
   'found', 'Wireless Earbuds Case',
   'Found a white earbuds case (looks like AirPods) near the auditorium seats. Left it at the front desk.',
   'electronics', 12.9725, 77.5955, 'Auditorium', 'active',
   now() - interval '5 hours'),

  ('11111111-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000000',
   'lost', 'Scientific Calculator',
   'Casio fx-991ES Plus calculator, has my name ''Priya'' written on the back in marker. Lost in Block C classroom.',
   'electronics', 12.9715, 77.5948, 'Block C Classrooms', 'active',
   now() - interval '1 day'),

  ('11111111-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000000',
   'found', 'Umbrella',
   'Black umbrella with wooden handle found at the main gate security desk. Compact fold type.',
   'other', 12.9705, 77.5935, 'Main Gate', 'active',
   now() - interval '2 days'),

  ('11111111-0000-0000-0000-000000000007',
   '00000000-0000-0000-0000-000000000000',
   'lost', 'Keys with Keychain',
   'Set of 3 keys on a blue car keychain with a small Eiffel Tower charm. Lost somewhere between hostel and main building.',
   'keys', 12.9718, 77.5942, 'Hostel Block A', 'active',
   now() - interval '6 hours'),

  ('11111111-0000-0000-0000-000000000008',
   '00000000-0000-0000-0000-000000000000',
   'found', 'Prescription Glasses',
   'Found a pair of rectangular black frame glasses in a brown case near the lab. Please collect with description.',
   'accessories', 12.9722, 77.5952, 'Science Lab Block', 'active',
   now() - interval '4 hours'),

  ('11111111-0000-0000-0000-000000000009',
   '00000000-0000-0000-0000-000000000000',
   'lost', 'Purple Notebook',
   'Purple spiral notebook with ''Algorithms'' written on the cover. Has important notes for finals. Lost in library reading room.',
   'stationery', 12.9720, 77.5950, 'Main Library', 'matched',
   now() - interval '4 days'),

  ('11111111-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000000',
   'found', 'Purple Spiral Notebook',
   'Found a purple notebook with class notes, looks like CS subject. Found at library study area, table 12.',
   'stationery', 12.9720, 77.5951, 'Main Library', 'matched',
   now() - interval '3 days'),

  ('11111111-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000000',
   'lost', 'Phone Charger',
   'Samsung 25W USB-C fast charger with 1.5m cable. White brick, black cable. Lost near the library charging station.',
   'electronics', 12.9720, 77.5950, 'Main Library', 'active',
   now() - interval '1 day'),

  ('11111111-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000000',
   'found', 'Wallet',
   'Brown leather wallet found in canteen. Contains some cash and what looks like a bus pass. Handed to canteen manager.',
   'wallet', 12.9710, 77.5940, 'Student Canteen', 'claimed',
   now() - interval '7 days'),

  ('11111111-0000-0000-0000-000000000013',
   '00000000-0000-0000-0000-000000000000',
   'lost', 'Cricket Bat',
   'MRF junior cricket bat, red grip tape. Left at the sports ground after practice on Tuesday.',
   'sports', 12.9708, 77.5938, 'Sports Ground', 'active',
   now() - interval '2 days'),

  ('11111111-0000-0000-0000-000000000014',
   '00000000-0000-0000-0000-000000000000',
   'found', 'USB Drive',
   '32GB blue SanDisk USB drive found in computer lab. Has files on it - will not access them.',
   'electronics', 12.9714, 77.5946, 'Computer Lab', 'active',
   now() - interval '8 hours'),

  ('11111111-0000-0000-0000-000000000015',
   '00000000-0000-0000-0000-000000000000',
   'lost', 'Lunch Box',
   'Red and blue tiffin box, 2 compartments, with a blue clip lock. Has my name sticker inside. Lost at canteen.',
   'other', 12.9710, 77.5940, 'Student Canteen', 'archived',
   now() - interval '25 days');
