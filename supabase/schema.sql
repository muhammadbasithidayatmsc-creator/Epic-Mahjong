-- ==========================================================
-- EPIC MAHJONG - Database Schema for Supabase / PostgreSQL
-- Location: Alam Sutera
-- Super Admin WhatsApp: 085181959275
-- Owner WhatsApp: 08159804100
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Roles: SUPER_ADMIN, OWNER)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'OWNER')),
  full_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLES (5 Mahjong Tables)
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 4,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code VARCHAR(30) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time VARCHAR(10) NOT NULL,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  guest_count INTEGER NOT NULL DEFAULT 4,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ANTI-DOUBLE BOOKING INDEX:
-- Ensure that no two active (PENDING or CONFIRMED) reservations can exist for the same table, date, and time slot.
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_table_slot_idx 
ON reservations (table_id, reservation_date, reservation_time) 
WHERE (status IN ('PENDING', 'CONFIRMED'));

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  business_name VARCHAR(100) NOT NULL DEFAULT 'EPIC MAHJONG',
  location VARCHAR(100) NOT NULL DEFAULT 'Alam Sutera',
  admin_whatsapp VARCHAR(30) NOT NULL DEFAULT '085181959275',
  owner_whatsapp VARCHAR(30) NOT NULL DEFAULT '08159804100',
  logo TEXT,
  hero_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- SEED INITIAL DATA
-- Initial Settings
INSERT INTO settings (id, business_name, location, admin_whatsapp, owner_whatsapp)
VALUES (1, 'EPIC MAHJONG', 'Alam Sutera', '085181959275', '08159804100')
ON CONFLICT (id) DO UPDATE SET 
  business_name = EXCLUDED.business_name,
  location = EXCLUDED.location,
  admin_whatsapp = EXCLUDED.admin_whatsapp,
  owner_whatsapp = EXCLUDED.owner_whatsapp;

-- Initial 5 Tables
INSERT INTO tables (id, name, capacity, description, is_active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'TABLE 01', 4, 'Meja Otomatis Elektrik, Kursi Ergonomis Premium, Soundproofing Luas', true),
  ('11111111-1111-1111-1111-111111111102', 'TABLE 02', 4, 'Meja Otomatis Elektrik, Deluxe Lounge Seating, Pencahayaan Ambient Emas', true),
  ('11111111-1111-1111-1111-111111111103', 'TABLE 03', 4, 'VIP Private Corner, Meja Otomatis Elektrik, Mini Bar Access', true),
  ('11111111-1111-1111-1111-111111111104', 'TABLE 04', 6, 'Grand Suite Table, Meja Otomatis Luxury Sofa, Kapasitas hingga 6 orang', true),
  ('11111111-1111-1111-1111-111111111105', 'TABLE 05', 4, 'Meja Otomatis Elektrik, High Rollers Ambient, Privasi Eksklusif', true)
ON CONFLICT (id) DO NOTHING;
