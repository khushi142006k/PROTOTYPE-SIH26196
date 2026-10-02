-- ==============================================================================
-- FITMATE AI PERSONAL FITNESS PLATFORM - COMPLETE CONSOLIDATED DATABASE SCHEMA
-- SIH26196 Production-Grade Idempotent Setup
-- ==============================================================================

-- STEP 1: CLEANUP / DROP ALL EXISTING OBJECTS (CASCADE)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
DROP TRIGGER IF EXISTS trg_archive_previous_plans ON public.workout_plans;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.protect_profile_fields() CASCADE;
DROP FUNCTION IF EXISTS public.archive_previous_workout_plans() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_public_stats() CASCADE;
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats() CASCADE;

DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.app_settings CASCADE;
DROP TABLE IF EXISTS public.parq_assessments CASCADE;
DROP TABLE IF EXISTS public.meal_logs CASCADE;
DROP TABLE IF EXISTS public.sleep_logs CASCADE;
DROP TABLE IF EXISTS public.water_logs CASCADE;
DROP TABLE IF EXISTS public.body_metrics CASCADE;
DROP TABLE IF EXISTS public.challenge_participants CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.user_badges CASCADE;
DROP TABLE IF EXISTS public.favorite_exercises CASCADE;
DROP TABLE IF EXISTS public.workout_templates CASCADE;
DROP TABLE IF EXISTS public.notification_reads CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.ai_usage_logs CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.ai_analyses CASCADE;
DROP TABLE IF EXISTS public.feedback CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.workout_logs CASCADE;
DROP TABLE IF EXISTS public.workout_plans CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.fitness_assessments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS experience_level CASCADE;

-- STEP 2: EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 3: CORE TABLES CREATION

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE public.profiles (
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
CREATE TABLE public.fitness_assessments (
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
CREATE TABLE public.goals (
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

-- 4. EXERCISES CATALOG
CREATE TABLE public.exercises (
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
CREATE TABLE public.workout_plans (
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

CREATE UNIQUE INDEX idx_one_active_plan_per_user 
ON public.workout_plans(user_id) 
WHERE status = 'Active';

-- 6. WORKOUT LOGS
CREATE TABLE public.workout_logs (
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
CREATE TABLE public.activity_logs (
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

-- 8. FEEDBACK & TESTIMONIALS
CREATE TABLE public.feedback (
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
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI ANALYSES
CREATE TABLE public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    consistency_score INT DEFAULT 0,
    observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    encouragement TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CHAT MESSAGES
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'model', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI USAGE LOGS
CREATE TABLE public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT DEFAULT 'generate_content',
    endpoint TEXT,
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    model_name TEXT DEFAULT 'gemini-2.5-flash',
    status TEXT DEFAULT 'success',
    latency_ms INT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ANNOUNCEMENTS
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    audience TEXT DEFAULT 'all',
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.notification_reads (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, announcement_id)
);

-- 14. WORKOUT TEMPLATES
CREATE TABLE public.workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL,
    category TEXT NOT NULL,
    estimated_weekly_burn TEXT,
    weekly_schedule JSONB NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. HEALTH & GAMIFICATION TABLES
CREATE TABLE public.favorite_exercises (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id TEXT REFERENCES public.exercises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, exercise_id)
);

CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_metric TEXT NOT NULL,
    target_value NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.challenge_participants (
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_progress NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id)
);

CREATE TABLE public.body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    weight_kg NUMERIC,
    height_cm NUMERIC,
    waist_cm NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    amount_ml INT DEFAULT 250,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    hours NUMERIC NOT NULL,
    quality TEXT DEFAULT 'Good',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    meal_name TEXT NOT NULL,
    calories INT NOT NULL,
    protein_g NUMERIC DEFAULT 0,
    carbs_g NUMERIC DEFAULT 0,
    fat_g NUMERIC DEFAULT 0,
    is_indian_food BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.parq_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    has_heart_condition BOOLEAN DEFAULT FALSE,
    has_chest_pain BOOLEAN DEFAULT FALSE,
    has_dizziness BOOLEAN DEFAULT FALSE,
    has_joint_issue BOOLEAN DEFAULT FALSE,
    on_bp_medication BOOLEAN DEFAULT FALSE,
    other_medical_reason BOOLEAN DEFAULT FALSE,
    risk_level TEXT DEFAULT 'Low' CHECK (risk_level IN ('Low', 'Moderate', 'High')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- STEP 4: INDEXES FOR PERFORMANCE
CREATE INDEX idx_workout_logs_user_completed ON public.workout_logs(user_id, completed_at DESC);
CREATE INDEX idx_activity_logs_user_date ON public.activity_logs(user_id, date DESC);
CREATE INDEX idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX idx_feedback_status_public ON public.feedback(status, is_public);

-- STEP 5: SECURITY DEFINER FUNCTIONS & TRIGGERS

-- 1. IS_ADMIN helper function (Fixes 42P17 infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (is_admin = TRUE OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. SAFE USER REGISTRATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        name, 
        avatar_url, 
        is_admin, 
        role,
        status
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        FALSE,
        'user',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(public.profiles.name, EXCLUDED.name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PROFILE FIELD PROTECTION TRIGGER
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_admin() THEN
        NEW.is_admin := OLD.is_admin;
        NEW.role := OLD.role;
        NEW.status := OLD.status;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 4. WORKOUT PLAN ARCHIVING TRIGGER
CREATE OR REPLACE FUNCTION public.archive_previous_workout_plans()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Active' THEN
        UPDATE public.workout_plans
        SET status = 'Archived', updated_at = NOW()
        WHERE user_id = NEW.user_id AND id <> NEW.id AND status = 'Active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_archive_previous_plans
    BEFORE INSERT OR UPDATE OF status ON public.workout_plans
    FOR EACH ROW EXECUTE FUNCTION public.archive_previous_workout_plans();

-- 5. PUBLIC & ADMIN RPC AGGREGATE FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSONB AS $$
DECLARE
    v_total_users INT;
    v_total_workouts INT;
    v_total_minutes INT;
BEGIN
    SELECT COUNT(*) INTO v_total_users FROM public.profiles;
    SELECT COUNT(*) INTO v_total_workouts FROM public.workout_logs;
    SELECT COALESCE(SUM(duration_minutes), 0) INTO v_total_minutes FROM public.workout_logs;
    
    RETURN jsonb_build_object(
        'totalUsers', v_total_users,
        'totalWorkouts', v_total_workouts,
        'totalMinutes', v_total_minutes
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    v_total_users INT;
    v_new_users_7d INT;
    v_total_workouts INT;
    v_total_minutes INT;
    v_avg_completion NUMERIC;
    v_avg_rating NUMERIC;
    v_open_feedback INT;
    v_ai_calls_today INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT COUNT(*) INTO v_total_users FROM public.profiles;
    SELECT COUNT(*) INTO v_new_users_7d FROM public.profiles WHERE created_at >= NOW() - INTERVAL '7 days';
    SELECT COUNT(*) INTO v_total_workouts FROM public.workout_logs;
    SELECT COALESCE(SUM(duration_minutes), 0) INTO v_total_minutes FROM public.workout_logs;
    SELECT COALESCE(ROUND(AVG(exercises_completed::numeric / NULLIF(total_exercises, 0) * 100), 1), 0) INTO v_avg_completion FROM public.workout_logs;
    SELECT COALESCE(ROUND(AVG(rating), 1), 0) INTO v_avg_rating FROM public.feedback WHERE rating IS NOT NULL;
    SELECT COUNT(*) INTO v_open_feedback FROM public.feedback WHERE status = 'New';
    SELECT COUNT(*) INTO v_ai_calls_today FROM public.ai_usage_logs WHERE created_at >= CURRENT_DATE;

    RETURN jsonb_build_object(
        'totalUsers', v_total_users,
        'newUsers7d', v_new_users_7d,
        'totalWorkouts', v_total_workouts,
        'totalMinutes', v_total_minutes,
        'avgCompletionRate', v_avg_completion,
        'avgRating', v_avg_rating,
        'openFeedback', v_open_feedback,
        'aiCallsToday', v_ai_calls_today
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- STEP 6: ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parq_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- ASSESSMENTS
CREATE POLICY "Users can view own assessments" ON public.fitness_assessments FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own assessment" ON public.fitness_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GOALS
CREATE POLICY "Users can view own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- EXERCISES
CREATE POLICY "Anyone can view active exercises" ON public.exercises FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins can insert exercises" ON public.exercises FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update exercises" ON public.exercises FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete exercises" ON public.exercises FOR DELETE USING (public.is_admin());

-- WORKOUT PLANS
CREATE POLICY "Users can view own plans" ON public.workout_plans FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own plans" ON public.workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.workout_plans FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can delete own plans" ON public.workout_plans FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- WORKOUT LOGS
CREATE POLICY "Users can view own workout logs" ON public.workout_logs FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own workout logs" ON public.workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout logs" ON public.workout_logs FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can delete own workout logs" ON public.workout_logs FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ACTIVITY LOGS
CREATE POLICY "Users can view own activity logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activity logs" ON public.activity_logs FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can delete own activity logs" ON public.activity_logs FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- FEEDBACK
CREATE POLICY "Users can view own or public feedback" ON public.feedback FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE OR public.is_admin());
CREATE POLICY "Users can insert feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Admins can update feedback" ON public.feedback FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete feedback" ON public.feedback FOR DELETE USING (public.is_admin());

-- ADMIN LOGS
CREATE POLICY "Admins can view admin logs" ON public.admin_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert admin logs" ON public.admin_logs FOR INSERT WITH CHECK (public.is_admin());

-- AI ANALYSES & CHAT
CREATE POLICY "Users can view own ai analyses" ON public.ai_analyses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own ai analyses" ON public.ai_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view ai usage logs" ON public.ai_usage_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert ai usage logs" ON public.ai_usage_logs FOR INSERT WITH CHECK (true);

-- ANNOUNCEMENTS & OTHER
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.is_admin());
CREATE POLICY "Users can manage own notification reads" ON public.notification_reads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view published templates" ON public.workout_templates FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage templates" ON public.workout_templates FOR ALL USING (public.is_admin());
CREATE POLICY "Users can manage own favorite exercises" ON public.favorite_exercises FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins can manage user badges" ON public.user_badges FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL USING (public.is_admin());
CREATE POLICY "Users can manage own challenge participation" ON public.challenge_participants FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own body metrics" ON public.body_metrics FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own meal logs" ON public.meal_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own parq assessment" ON public.parq_assessments FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage app settings" ON public.app_settings FOR ALL USING (public.is_admin());

-- STEP 7: SEED DATA (EXERCISES & DEFAULT SETTINGS)
INSERT INTO public.app_settings (key, value) VALUES
('maintenance_mode', 'false'::jsonb),
('ai_enabled', 'true'::jsonb),
('signup_enabled', 'true'::jsonb),
('disclaimer_text', '"FitMate provides informational fitness guidance, not medical diagnosis. Consult a healthcare professional before starting new vigorous exercise routines."'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.exercises (id, name, category, difficulty, target_area, instructions, default_reps, default_sets, default_rest_seconds, safety_guidance, equipment_needed, icon_type, is_active, muscle_groups, calories_per_minute) VALUES
('ex_pushup', 'Bodyweight Push-Ups', 'Strength', 'Beginner', 'Chest & Triceps', ARRAY['Plank position with hands shoulder-width apart.', 'Lower chest to floor keeping elbows at 45° angle.', 'Push up explosively maintaining straight core line.'], '10-12 reps', 3, 45, 'Keep core engaged; avoid sagging lower back.', 'None (Bodyweight)', 'pushup', TRUE, ARRAY['Chest', 'Triceps', 'Core'], 6.5),
('ex_squats', 'Air Squats', 'Strength', 'Beginner', 'Quads & Glutes', ARRAY['Stand feet hip-width apart.', 'Lower hips back as if sitting in chair until thighs parallel.', 'Drive through heels to stand.'], '12-15 reps', 3, 45, 'Keep knees tracking over toes; chest lifted.', 'None (Bodyweight)', 'squat', TRUE, ARRAY['Quadriceps', 'Glutes', 'Hamstrings'], 7.0),
('ex_plank', 'Forearm Plank', 'Core', 'Beginner', 'Abdominals & Core', ARRAY['Rest on forearms and toes.', 'Maintain straight line shoulders to ankles.', 'Hold steady drawing navel to spine.'], '30-45 secs', 3, 30, 'Do not hold breath or arch lower spine.', 'None (Bodyweight)', 'plank', TRUE, ARRAY['Abs', 'Lower Back'], 4.5),
('ex_lunges', 'Walking Lunges', 'Strength', 'Intermediate', 'Lower Body', ARRAY['Step forward with one leg.', 'Lower back knee towards ground.', 'Push through front heel to step forward.'], '10 reps/leg', 3, 45, 'Front knee should not extend past toes.', 'None (Bodyweight)', 'lunge', TRUE, ARRAY['Quads', 'Glutes', 'Calves'], 6.0),
('ex_burpees', 'Full Body Burpees', 'Cardio', 'Advanced', 'Full Body Conditioning', ARRAY['Drop into squat position.', 'Kick feet back to push-up plank.', 'Perform push-up, jump feet in, explode upward.'], '8-10 reps', 3, 60, 'Pace yourself to maintain proper form during jump.', 'None (Bodyweight)', 'cardio', TRUE, ARRAY['Full Body', 'Cardio'], 10.0),
('ex_jumping_jacks', 'Jumping Jacks', 'Cardio', 'Beginner', 'Cardiovascular Warmup', ARRAY['Stand feet together arms at side.', 'Jump feet wide while clapping hands overhead.', 'Jump back to starting position.'], '45 secs', 3, 30, 'Land softly on balls of feet.', 'None (Bodyweight)', 'cardio', TRUE, ARRAY['Cardio', 'Calves'], 8.0)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Public Feedback
INSERT INTO public.feedback (user_name, category, message, rating, status, is_public) VALUES
('Aarav Mehta', 'AI Assistant', 'The AI workout plan adapted perfectly to my busy engineering schedule. Highly recommended!', 5, 'Reviewed', TRUE),
('Priya Patel', 'Workout', 'Clear exercise instructions and great safety tips for home workouts without equipment.', 5, 'Reviewed', TRUE),
('Vikram Singh', 'Progress Tracking', 'The consistency score motivated me to complete 4 workouts every single week!', 5, 'Reviewed', TRUE)
ON CONFLICT DO NOTHING;
