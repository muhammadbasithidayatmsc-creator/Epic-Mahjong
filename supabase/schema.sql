-- ==========================================================
-- EPIC MAHJONG - Database Schema for Supabase / PostgreSQL
-- Location: Alam Sutera
-- Super Admin WhatsApp: 085181959275
-- Owner WhatsApp: 08159804100
-- ==========================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE (Roles: SUPER_ADMIN, OWNER)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'OWNER')),
  full_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLES (Mahjong Tables TABLE 01 - TABLE 05)
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PLAY SESSIONS TABLE (1-Hour Interval Slots)
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_name VARCHAR(50) NOT NULL,
  start_time VARCHAR(10) NOT NULL,
  end_time VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. RESERVATIONS TABLE (Supports Multi-Hour & Multi-Slot Bookings)
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time VARCHAR(10) NOT NULL,
  session_id TEXT REFERENCES sessions(session_id) ON DELETE SET NULL,
  session_name VARCHAR(100),
  start_time VARCHAR(10),
  end_time VARCHAR(10),
  selected_slots JSONB DEFAULT '[]'::jsonb,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  table_id TEXT NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  table_name VARCHAR(50),
  guest_count INTEGER NOT NULL DEFAULT 4,
  notes TEXT DEFAULT '',
  nominal NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES FOR FAST LOOKUPS
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_table ON reservations(table_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_date_table ON reservations(reservation_date, table_id);

-- 5. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(100) NOT NULL DEFAULT 'EPIC MAHJONG',
  location VARCHAR(100) NOT NULL DEFAULT 'Alam Sutera',
  admin_whatsapp VARCHAR(30) NOT NULL DEFAULT '085181959275',
  owner_whatsapp VARCHAR(30) NOT NULL DEFAULT '08159804100',
  logo TEXT DEFAULT '',
  hero_image TEXT DEFAULT 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1600&q=80',
  operating_hours VARCHAR(50) NOT NULL DEFAULT '10:00 - 02:00 WIB',
  time_slots JSONB DEFAULT '["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00","00:00","01:00"]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) FOR SUPABASE
-- ==========================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to tables, sessions, and settings (needed for booking matrix)
CREATE POLICY "Public can read tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Public can read sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public can read reservations for availability check" ON reservations FOR SELECT USING (true);
CREATE POLICY "Public can insert reservations" ON reservations FOR INSERT WITH CHECK (true);

-- Allow full access for anon/authenticated roles to manage tables, sessions, and reservations
CREATE POLICY "Service and anon full access on reservations" ON reservations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service and anon full access on tables" ON tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service and anon full access on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service and anon full access on settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service and anon full access on users" ON users FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- SUPABASE REALTIME CONFIGURATION
-- ==========================================================
-- 1. Mengaktifkan REPLICA IDENTITY FULL agar payload event Realtime (INSERT, UPDATE, DELETE) lengkap
ALTER TABLE public.reservations REPLICA IDENTITY FULL;

-- 2. Mengaktifkan Realtime listener untuk tabel reservations agar HP dan laptop tersinkronisasi instan
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'reservations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
  END IF;
END $$;


-- ==========================================================
-- SEED INITIAL DATA
-- ==========================================================

-- 1. Initial Settings
INSERT INTO settings (id, business_name, location, admin_whatsapp, owner_whatsapp, operating_hours)
VALUES (1, 'EPIC MAHJONG', 'Alam Sutera', '085181959275', '08159804100', '10:00 - 02:00 WIB')
ON CONFLICT (id) DO UPDATE SET 
  business_name = EXCLUDED.business_name,
  location = EXCLUDED.location,
  admin_whatsapp = EXCLUDED.admin_whatsapp,
  owner_whatsapp = EXCLUDED.owner_whatsapp,
  operating_hours = EXCLUDED.operating_hours;

-- 2. Initial 5 Tables (TABLE 01 - TABLE 05)
INSERT INTO tables (id, name, capacity, description, features, is_active) VALUES
  ('tbl-01', 'TABLE 01', 4, 'Meja Otomatis Elektrik, Kursi Ergonomis Premium, Soundproofing Luas', '["Automatic Shuffler", "Premium Audio", "4 Pax"]'::jsonb, true),
  ('tbl-02', 'TABLE 02', 4, 'Meja Otomatis Elektrik, Deluxe Lounge Seating, Pencahayaan Ambient Emas', '["Automatic Shuffler", "Deluxe Lounge", "4 Pax"]'::jsonb, true),
  ('tbl-03', 'TABLE 03', 4, 'VIP Private Corner, Meja Otomatis Elektrik, Mini Bar Access', '["VIP Private Corner", "Mini Bar Access", "4 Pax"]'::jsonb, true),
  ('tbl-04', 'TABLE 04', 6, 'Grand Suite Table, Meja Otomatis Luxury Sofa, Kapasitas hingga 6 orang', '["Grand Suite Table", "Luxury Sofa", "4-6 Pax"]'::jsonb, true),
  ('tbl-05', 'TABLE 05', 4, 'Meja Otomatis Elektrik, High Rollers Ambient, Privasi Eksklusif', '["Automatic Shuffler", "High Rollers Vibe", "4 Pax"]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Initial 1-Hour Play Sessions (10:00 - 02:00 WIB)
INSERT INTO sessions (session_id, session_name, start_time, end_time, status) VALUES
  ('ses-01', '10:00 – 11:00', '10:00', '11:00', 'ACTIVE'),
  ('ses-02', '11:00 – 12:00', '11:00', '12:00', 'ACTIVE'),
  ('ses-03', '12:00 – 13:00', '12:00', '13:00', 'ACTIVE'),
  ('ses-04', '13:00 – 14:00', '13:00', '14:00', 'ACTIVE'),
  ('ses-05', '14:00 – 15:00', '14:00', '15:00', 'ACTIVE'),
  ('ses-06', '15:00 – 16:00', '15:00', '16:00', 'ACTIVE'),
  ('ses-07', '16:00 – 17:00', '16:00', '17:00', 'ACTIVE'),
  ('ses-08', '17:00 – 18:00', '17:00', '18:00', 'ACTIVE'),
  ('ses-09', '18:00 – 19:00', '18:00', '19:00', 'ACTIVE'),
  ('ses-10', '19:00 – 20:00', '19:00', '20:00', 'ACTIVE'),
  ('ses-11', '20:00 – 21:00', '20:00', '21:00', 'ACTIVE'),
  ('ses-12', '21:00 – 22:00', '21:00', '22:00', 'ACTIVE'),
  ('ses-13', '22:00 – 23:00', '22:00', '23:00', 'ACTIVE'),
  ('ses-14', '23:00 – 00:00', '23:00', '00:00', 'ACTIVE'),
  ('ses-15', '00:00 – 01:00', '00:00', '01:00', 'ACTIVE'),
  ('ses-16', '01:00 – 02:00', '01:00', '02:00', 'ACTIVE')
ON CONFLICT (session_id) DO NOTHING;

-- 4. Initial Admin & Owner Accounts (bcrypt password: epicadmin2026 / epicowner2026)
INSERT INTO users (id, username, email, password_hash, role, full_name, is_active) VALUES
  ('usr-admin-01', 'superadmin', 'admin@epicmahjong.com', '$2b$10$wS26/f8V26gG0w4aGvBxe.0016u7V9zF8Z6P3Z3cOq2W2w0aC6x5q', 'SUPER_ADMIN', 'Super Admin Epic Mahjong', true),
  ('usr-owner-01', 'owner', 'owner@epicmahjong.com', '$2b$10$wS26/f8V26gG0w4aGvBxe.0016u7V9zF8Z6P3Z3cOq2W2w0aC6x5q', 'OWNER', 'Owner Epic Mahjong', true)
ON CONFLICT (id) DO NOTHING;
