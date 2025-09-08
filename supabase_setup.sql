-- >>> supabase_migration.sql <<<
-- Production-ready unified Supabase schema migration
-- Run this as a single script in Supabase SQL editor (SQL)

-- 0) Safety: run as a superuser / project owner

-- 1) Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2) Create public.users (profile / app user data)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  -- App-specific task fields expected by the frontend:
  dailyTasks JSONB DEFAULT '[]'::jsonb,
  completedTasks TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3) Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_name TEXT,
  author_avatar TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4) Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0 CHECK (score >= 0),
  game_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, game_name)
);

-- 5) Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 6) Remove conflicting policies if present (idempotent)
DROP POLICY IF EXISTS "Users can view all leaderboard entries" ON public.leaderboard;
DROP POLICY IF EXISTS "Users can insert their own leaderboard entries" ON public.leaderboard;
DROP POLICY IF EXISTS "Users can update their own leaderboard entries" ON public.leaderboard;
DROP POLICY IF EXISTS "Users can delete their own leaderboard entries" ON public.leaderboard;

DROP POLICY IF EXISTS "Users can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

DROP POLICY IF EXISTS "Users can view all user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- 7) Policies for leaderboard
CREATE POLICY "Users can view all leaderboard entries" ON public.leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" ON public.leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entries" ON public.leaderboard
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leaderboard entries" ON public.leaderboard
  FOR DELETE USING (auth.uid() = user_id);

-- 8) Policies for posts
CREATE POLICY "Users can view all posts" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- 9) Policies for users (profile table)
CREATE POLICY "Users can view all user profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 10) Indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at DESC);

CREATE INDEX IF NOT EXISTS posts_author_id_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_title_idx ON public.posts(title);

CREATE INDEX IF NOT EXISTS leaderboard_user_id_idx ON public.leaderboard(user_id);
CREATE INDEX IF NOT EXISTS leaderboard_score_idx ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS leaderboard_game_name_idx ON public.leaderboard(game_name);
CREATE INDEX IF NOT EXISTS leaderboard_created_at_idx ON public.leaderboard(created_at DESC);

-- 11) updated_at trigger function (single function reused)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attach trigger to tables
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_posts_updated_at ON public.posts;
CREATE TRIGGER trigger_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_leaderboard_updated_at ON public.leaderboard;
CREATE TRIGGER trigger_leaderboard_updated_at
BEFORE UPDATE ON public.leaderboard
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 12) Function + trigger to auto-create public.users row when auth.users is created
-- Note: adjust raw_user_meta_data key names if you use a different provider payload
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  name_text TEXT;
  avatar_text TEXT;
BEGIN
  -- try to get full name from different possible fields
  name_text := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NEW.user_metadata ->> 'full_name',
    NEW.user_metadata ->> 'name',
    NEW.email
  );

  avatar_text := COALESCE(
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_user_meta_data ->> 'avatar',
    NEW.user_metadata ->> 'avatar_url',
    NEW.user_metadata ->> 'avatar'
  );

  -- Only insert if a public.users row doesn't already exist for this id
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    INSERT INTO public.users (id, full_name, avatar_url, email, metadata)
    VALUES (NEW.id, name_text, avatar_text, NEW.email, NEW.raw_user_meta_data::jsonb);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- create/replace trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- 13) (Optional) Development-only sample insert - commented for safety
-- DO NOT INSERT random UUIDs into public.users that don't exist in auth.users.
-- If you need sample data for development, insert into public.users using actual auth.users.id values
-- or create test users via Supabase Auth first and then let the trigger populate public.users.

-- 14) Final: sanity check selects (no-op if run interactively)
-- SELECT 1 FROM public.users LIMIT 1;
-- SELECT 1 FROM public.posts LIMIT 1;
-- SELECT 1 FROM public.leaderboard LIMIT 1;

-- End of migration



