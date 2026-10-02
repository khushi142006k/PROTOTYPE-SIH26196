-- ==============================================================================
-- FITMATE AI MIGRATION 001: BASE SCHEMA & EXTENSIONS
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'experience_level') THEN
        CREATE TYPE experience_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
    END IF;
END $$;

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    age_group TEXT DEFAULT '25-34',
    activity_level TEXT DEFAULT 'Lightly Active',
    experience TEXT DEFAULT 'Beginner',
    location TEXT DEFAULT 'Home',
    available_days INT DEFAULT 4,
    duration_minutes INT DEFAULT 30,
    preferred_time TEXT DEFAULT 'Morning (7:00 AM)',
    equipment TEXT[] DEFAULT ARRAY['None (Bodyweight)'],
    preferred_activities TEXT[] DEFAULT ARRAY['Bodyweight Training'],
    preferences TEXT,
    language TEXT DEFAULT 'en',
    is_admin BOOLEAN DEFAULT FALSE,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    height_cm NUMERIC,
    weight_kg NUMERIC,
    gender TEXT,
    date_of_birth DATE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    xp INT DEFAULT 0,
    level INT DEFAULT 1,
    leaderboard_opt_in BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FITNESS ASSESSMENTS
CREATE TABLE IF NOT EXISTS public.fitness_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    age_group TEXT NOT NULL,
    activity_level TEXT NOT NULL,
    experience TEXT NOT NULL,
    location TEXT NOT NULL,
    available_days INT NOT NULL,
    duration_minutes INT NOT NULL,
    preferred_time TEXT,
    equipment TEXT[],
    preferred_activities TEXT[],
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GOALS
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL,
    title TEXT NOT NULL,
    target NUMERIC NOT NULL,
    current_progress NUMERIC DEFAULT 0,
    unit TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    status TEXT DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Completed', 'Paused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXERCISES
CREATE TABLE IF NOT EXISTS public.exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    target_area TEXT NOT NULL,
    instructions TEXT[] NOT NULL,
    default_reps TEXT DEFAULT '10-12 reps',
    default_sets INT DEFAULT 3,
    default_rest_seconds INT DEFAULT 45,
    safety_guidance TEXT,
    equipment_needed TEXT DEFAULT 'None',
    icon_type TEXT DEFAULT 'generic',
    video_url TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    muscle_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
    calories_per_minute NUMERIC DEFAULT 5.0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKOUT PLANS
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_title TEXT NOT NULL,
    summary TEXT,
    recommended_days INT DEFAULT 4,
    estimated_weekly_burn TEXT,
    weekly_schedule JSONB NOT NULL,
    created_by_ai BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Archived')),
    disclaimer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index to enforce max 1 Active plan per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_plan_per_user 
ON public.workout_plans(user_id) 
WHERE status = 'Active';

-- 6. WORKOUT LOGS
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    day_name TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    calories_burned INT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    exercises_completed INT NOT NULL,
    total_exercises INT NOT NULL,
    difficulty_feedback TEXT CHECK (difficulty_feedback IN ('Too Easy', 'Just Right', 'Too Hard')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    duration_minutes INT NOT NULL,
    distance_km NUMERIC,
    calories_estimated INT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FEEDBACK
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Reviewed', 'Resolved')),
    admin_reply TEXT,
    replied_at TIMESTAMPTZ,
    replied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ADMIN LOGS
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal query execution
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_completed ON public.workout_logs(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON public.activity_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_feedback_status_public ON public.feedback(status, is_public);
