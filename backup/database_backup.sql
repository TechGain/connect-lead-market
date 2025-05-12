
-- DATABASE BACKUP - Created on 2025-05-12
-- This script recreates the current database structure to serve as a restore point

-- =============================================
-- TABLE DEFINITIONS
-- =============================================

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  company TEXT,
  role TEXT NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rating INTEGER,
  sms_notifications_enabled BOOLEAN DEFAULT false
);

-- Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_time TEXT,
  price NUMERIC NOT NULL,
  seller_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  buyer_id UUID,
  purchased_at TIMESTAMPTZ,
  quality_rating INTEGER,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  zip_code TEXT,
  confirmation_status TEXT NOT NULL DEFAULT 'confirmed',
  seller_name TEXT,
  buyer_name TEXT
);

-- Lead Ratings Table
CREATE TABLE IF NOT EXISTS public.lead_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chats Table
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open',
  user_id UUID
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  sender_name TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  chat_id UUID,
  sender_type TEXT NOT NULL
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Is Admin User Function
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
  DECLARE
    user_role TEXT;
  BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role = 'admin';
  END;
$function$;

-- Handle New User Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  role_value TEXT;
BEGIN
  -- Get role from user metadata
  role_value := NEW.raw_user_meta_data->>'role';
  
  -- Validate role is either 'seller' or 'buyer', default to 'buyer' if invalid
  IF role_value IS NULL OR (role_value != 'seller' AND role_value != 'buyer') THEN
    role_value := 'buyer';
  END IF;
  
  -- Insert new profile with phone number
  INSERT INTO public.profiles (
    id, 
    full_name, 
    company, 
    role,
    phone
  ) VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), 
    NEW.raw_user_meta_data->>'company',
    role_value,
    NEW.raw_user_meta_data->>'phone'
  );
  
  RETURN NEW;
END;
$function$;

-- Update Lead Names Function
CREATE OR REPLACE FUNCTION public.update_lead_names()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update seller name
  IF NEW.seller_id IS NOT NULL THEN
    SELECT full_name INTO NEW.seller_name
    FROM public.profiles
    WHERE id = NEW.seller_id;
  END IF;
  
  -- Update buyer name
  IF NEW.buyer_id IS NOT NULL THEN
    SELECT full_name INTO NEW.buyer_name
    FROM public.profiles
    WHERE id = NEW.buyer_id;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update Profile Timestamp Function
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Prevent Role Change Function
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.role <> NEW.role THEN
    RAISE EXCEPTION 'Role cannot be changed once set';
  END IF;
  RETURN NEW;
END;
$function$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Handle New User Trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update Lead Names Trigger
CREATE TRIGGER update_lead_names_trigger
BEFORE INSERT OR UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_lead_names();

-- Update Profile Timestamp Trigger
CREATE TRIGGER update_profile_timestamp_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_profile_timestamp();

-- Prevent Role Change Trigger
CREATE TRIGGER prevent_role_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- =============================================
-- CURRENT STATE COMMENTS
-- =============================================
-- Note: RLS policies are not enabled on most tables
-- Note: No existing RLS policies found in the backup

-- END OF BACKUP
