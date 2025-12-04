/*
  # JourneyTogether Database Schema (Supabase Optimized)

  ## Highlights
  - All tables use `uuid` as primary key (best practice Supabase)
  - Original business IDs (CHAR(6)/CHAR(10)) are kept as unique fields
  - Automatic updated_at trigger added
  - RLS enabled for all tables
  - IF NOT EXISTS used for safe re-run
  - Ready for policies
*/

-----------------------------
-- Auto update updated_at
-----------------------------
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

----------------------------------------------------
-- USERS
----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  phone varchar(10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- ACCOUNT
----------------------------------------------------
CREATE TABLE IF NOT EXISTS account (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  username varchar(50) NOT NULL,
  password text NOT NULL,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(id_user, username)
);

----------------------------------------------------
-- ADMIN
----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) UNIQUE NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  admin_key text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- SUPPORT_SOS_TEAM
----------------------------------------------------
CREATE TABLE IF NOT EXISTS support_sos_team (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) UNIQUE NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  is_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- TRAVELLER
----------------------------------------------------
CREATE TABLE IF NOT EXISTS traveller (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) UNIQUE NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
  bio text,
  is_shared_location boolean DEFAULT false,
  latitude numeric,
  longitude numeric,
  travel_preference text,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  is_safe boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- REGION
----------------------------------------------------
CREATE TABLE IF NOT EXISTS region (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_region varchar(10) UNIQUE NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- DESTINATION
----------------------------------------------------
CREATE TABLE IF NOT EXISTS destination (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_destination varchar(6) UNIQUE NOT NULL,
  id_region varchar(10) REFERENCES region(id_region),
  name text NOT NULL,
  country text,
  region_name text,
  latitude numeric,
  longitude numeric,
  category text,
  best_season text,
  average_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  images jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- MANAGE_DESTINATION
----------------------------------------------------
CREATE TABLE IF NOT EXISTS manage_destination (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) REFERENCES admin(id_user),
  id_destination varchar(6) REFERENCES destination(id_destination),
  created_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- SUPPORT_REGION
----------------------------------------------------
CREATE TABLE IF NOT EXISTS support_region (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) REFERENCES support_sos_team(id_user),
  id_region varchar(10) REFERENCES region(id_region),
  created_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- TRAVELLER_DESTINATION
----------------------------------------------------
CREATE TABLE IF NOT EXISTS traveller_destination (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) REFERENCES traveller(id_user),
  id_destination varchar(6) REFERENCES destination(id_destination),
  created_at timestamptz DEFAULT now(),
  UNIQUE(id_user, id_destination)
);

----------------------------------------------------
-- TRIP
----------------------------------------------------
CREATE TABLE IF NOT EXISTS trip (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_trip varchar(6) UNIQUE NOT NULL,
  title text,
  description text,
  departure text NOT NULL,
  destination text NOT NULL,
  distance numeric CHECK (distance > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  difficult text,
  spent_amount numeric CHECK (spent_amount >= 0),
  total_budget numeric CHECK (total_budget >= 100000),
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- TRIP_DESTINATION
----------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_destination (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_trip varchar(6) REFERENCES trip(id_trip),
  id_destination varchar(6) REFERENCES destination(id_destination),
  created_at timestamptz DEFAULT now(),
  UNIQUE(id_trip, id_destination)
);

----------------------------------------------------
-- ROUTES
----------------------------------------------------
CREATE TABLE IF NOT EXISTS routes (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_route varchar(6) UNIQUE NOT NULL,
  route_order integer,
  id_trip varchar(6) REFERENCES trip(id_trip),
  title text NOT NULL,
  description text,
  start_location text,
  end_location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- COST
----------------------------------------------------
CREATE TABLE IF NOT EXISTS cost (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cost varchar(6) UNIQUE NOT NULL,
  id_route varchar(6) REFERENCES routes(id_route),
  title text NOT NULL,
  description text,
  category text,
  cost_amount numeric CHECK (cost_amount > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- RECOMMENT_ROUTE
----------------------------------------------------
CREATE TABLE IF NOT EXISTS recomment_route (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_trip varchar(6) REFERENCES trip(id_trip),
  id_route varchar(6) REFERENCES routes(id_route),
  route_order integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(id_trip, id_route, route_order)
);

----------------------------------------------------
-- JOIN_TRIP
----------------------------------------------------
CREATE TABLE IF NOT EXISTS join_trip (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) REFERENCES traveller(id_user),
  id_trip varchar(6) REFERENCES trip(id_trip),
  created_at timestamptz DEFAULT now(),
  UNIQUE(id_trip, id_user)
);

----------------------------------------------------
-- POST
----------------------------------------------------
CREATE TABLE IF NOT EXISTS post (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_post varchar(6) UNIQUE NOT NULL,
  id_user varchar(6) REFERENCES traveller(id_user),
  title text NOT NULL,
  content text NOT NULL,
  tags text,
  total_likes integer DEFAULT 0,
  total_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- POST_REPLY
----------------------------------------------------
CREATE TABLE IF NOT EXISTS post_reply (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6) REFERENCES traveller(id_user),
  id_post varchar(6) REFERENCES post(id_post),
  content text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(id_user, id_post)
);

----------------------------------------------------
-- DIARY
----------------------------------------------------
CREATE TABLE IF NOT EXISTS diary (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_diary varchar(6) UNIQUE NOT NULL,
  id_trip varchar(6) REFERENCES trip(id_trip),
  id_user varchar(6) REFERENCES traveller(id_user),
  title text NOT NULL,
  content text NOT NULL,
  is_publish boolean DEFAULT false,
  video_url text,
  img_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

----------------------------------------------------
-- SHARE_LOCATION
----------------------------------------------------
CREATE TABLE IF NOT EXISTS share_location (
  uuid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_user varchar(6),
  id_person_is_shared varchar(6),
  created_at timestamptz DEFAULT now(),
  UNIQUE(id_user, id_person_is_shared)
);

----------------------------------------------------
-- Attach updated_at triggers
----------------------------------------------------
DO $$
DECLARE
  r RECORD;
  trigger_name TEXT;
BEGIN
  FOR r IN
    SELECT table_name
    FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
  LOOP
    trigger_name := 'trg_' || r.table_name || '_updated';

    -- Check if trigger exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = trigger_name
    ) THEN
      EXECUTE format('
        CREATE TRIGGER %I
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();
      ', trigger_name, r.table_name);
    END IF;

  END LOOP;
END $$;


----------------------------------------------------
-- Enable RLS
----------------------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', r.table_name);
  END LOOP;
END;
$$;


-- Add id_destination column to post table
ALTER TABLE post 
ADD COLUMN IF NOT EXISTS id_destination varchar(6) REFERENCES destination(id_destination);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_post_destination ON post(id_destination);