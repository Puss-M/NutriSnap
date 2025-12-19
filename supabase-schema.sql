-- NutriSnap AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (user data)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,
  is_vip BOOLEAN DEFAULT FALSE,
  vip_expiry TIMESTAMP WITH TIME ZONE,
  daily_calories_target INTEGER DEFAULT 2000,
  
  -- User body metrics for personalized calculations
  weight REAL DEFAULT 55.0,                      -- kg
  height INTEGER DEFAULT 164,                    -- cm
  age INTEGER DEFAULT 20,
  gender TEXT DEFAULT '女',                      -- '男' or '女'
  activity_level TEXT DEFAULT '中度活动 (每周3-5次)',
  goal TEXT DEFAULT '维持',                      -- '增肌', '减脂', '维持'
  body_fat NUMERIC,                              -- Optional body fat percentage (0-100)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration: Add body_fat column if it doesn't exist (for existing databases)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS body_fat NUMERIC;

-- Food logs table
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  image_url TEXT,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein REAL DEFAULT 0,
  carbs REAL DEFAULT 0,
  fat REAL DEFAULT 0,
  weight_g INTEGER,
  context_tag TEXT, -- 'convenience_store', 'canteen', 'takeout'
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_logs_device_id ON logs(device_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_device_id ON profiles(device_id);

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (MVP - no auth)
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all for logs" ON logs FOR ALL USING (true);

-- Storage bucket for food images
-- Run this separately or create via Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create bucket named 'food-images'
-- 3. Make it PUBLIC
-- 4. Set max file size to 5MB
