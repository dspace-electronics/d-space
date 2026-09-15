-- ==========================================================
-- DSPACE ELECTRONICS (BENGALURU) - SUPABASE RBAC SCHEMA
-- ==========================================================
-- Execute this SQL in your Supabase project SQL Editor to enable
-- full role-based tables and Row Level Security (RLS) policies.

-- 1. Create User Profiles Table with RBAC Roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone TEXT,
  default_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile or admins can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('microcontrollers', 'sensors', 'power', 'actuators', 'passives', 'tools')),
  price NUMERIC NOT NULL CHECK (price >= 0),
  compare_price NUMERIC,
  stock INTEGER NOT NULL DEFAULT 0,
  blr_hub_stock INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  description TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT NOT NULL,
  pinout_url TEXT,
  datasheet_url TEXT,
  is_same_day_eligible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product Policy 1: Anyone (including anonymous shoppers) can browse products
CREATE POLICY "Products are publicly viewable"
  ON public.products FOR SELECT
  USING (true);

-- Product Policy 2: STRICT RBAC - Only Admins can INSERT new components
CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Product Policy 3: STRICT RBAC - Only Admins can UPDATE product price/stock/details
CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Product Policy 4: STRICT RBAC - Only Admins can DELETE products
CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Create Orders & Porter Logistics Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  blr_zone_id TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  courier_service TEXT NOT NULL DEFAULT 'porter_2wheeler',
  porter_tracking_id TEXT NOT NULL,
  porter_rider JSONB,
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'packed', 'driver_assigned', 'in_transit', 'delivered')),
  payment_method TEXT NOT NULL DEFAULT 'razorpay_upi',
  payment_status TEXT NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'pending')),
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policy 1: Users view their own orders, Admins view all orders across Bengaluru
CREATE POLICY "Users can view their own orders or admins can view all"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Orders Policy 2: Authenticated or Guest users can place orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Orders Policy 3: STRICT RBAC - Only Admins can update order status / dispatch Porter courier
CREATE POLICY "Only admins can update order status"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
