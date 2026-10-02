-- ==============================================================================
-- FITMATE AI MIGRATION 003: AI, ADMIN & EXTRA FEATURES TABLES
-- ==============================================================================

-- 1. AI ANALYSES
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    consistency_score INT DEFAULT 0,
    observations JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    encouragement TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHAT MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'model', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI USAGE LOGS (For Admin Monitoring)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    status TEXT NOT NULL,
    latency_ms INT,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ANNOUNCEMENTS & NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.announcements (
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

CREATE TABLE IF NOT EXISTS public.notification_reads (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, announcement_id)
);

-- 5. WORKOUT TEMPLATES (Admin-curated plans)
CREATE TABLE IF NOT EXISTS public.workout_templates (
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

-- 6. FAVORITE EXERCISES
CREATE TABLE IF NOT EXISTS public.favorite_exercises (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_id TEXT REFERENCES public.exercises(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, exercise_id)
);

-- 7. GAMIFICATION: BADGES & CHALLENGES
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_key TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_metric TEXT NOT NULL, -- e.g. "workout_count", "duration_minutes"
    target_value NUMERIC NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.challenge_participants (
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_progress NUMERIC DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (challenge_id, user_id)
);

-- 8. HEALTH TRACKING: BODY METRICS, WATER, SLEEP, MEALS
CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    weight_kg NUMERIC,
    height_cm NUMERIC,
    waist_cm NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    amount_ml INT DEFAULT 250,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    hours NUMERIC NOT NULL,
    quality TEXT DEFAULT 'Good',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.meal_logs (
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

-- 9. PAR-Q HEALTH SCREENING ASSESSMENT
CREATE TABLE IF NOT EXISTS public.parq_assessments (
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

-- 10. APP SETTINGS (Global config)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Insert Default App Settings
INSERT INTO public.app_settings (key, value) VALUES
('maintenance_mode', 'false'::jsonb),
('ai_enabled', 'true'::jsonb),
('signup_enabled', 'true'::jsonb),
('disclaimer_text', '"FitMate provides informational fitness guidance, not medical diagnosis. Consult a healthcare professional before starting new vigorous exercise routines."'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS POLICIES FOR NEW TABLES
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

-- AI ANALYSES POLICIES
CREATE POLICY "Users can view own ai analyses" ON public.ai_analyses FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own ai analyses" ON public.ai_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CHAT MESSAGES POLICIES
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- AI USAGE LOGS POLICIES
CREATE POLICY "Admins can view ai usage logs" ON public.ai_usage_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert ai usage logs" ON public.ai_usage_logs FOR INSERT WITH CHECK (true);

-- ANNOUNCEMENTS POLICIES
CREATE POLICY "Anyone can view active announcements" ON public.announcements FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage announcements" ON public.announcements FOR ALL USING (public.is_admin());

-- NOTIFICATION READS POLICIES
CREATE POLICY "Users can manage own notification reads" ON public.notification_reads FOR ALL USING (auth.uid() = user_id);

-- WORKOUT TEMPLATES POLICIES
CREATE POLICY "Anyone can view published templates" ON public.workout_templates FOR SELECT USING (is_published = TRUE OR public.is_admin());
CREATE POLICY "Admins can manage templates" ON public.workout_templates FOR ALL USING (public.is_admin());

-- FAVORITE EXERCISES POLICIES
CREATE POLICY "Users can manage own favorite exercises" ON public.favorite_exercises FOR ALL USING (auth.uid() = user_id);

-- BADGES & CHALLENGES POLICIES
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins can manage user badges" ON public.user_badges FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view challenges" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON public.challenges FOR ALL USING (public.is_admin());

CREATE POLICY "Users can manage own challenge participation" ON public.challenge_participants FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- HEALTH TRACKING POLICIES
CREATE POLICY "Users can manage own body metrics" ON public.body_metrics FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own water logs" ON public.water_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own sleep logs" ON public.sleep_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own meal logs" ON public.meal_logs FOR ALL USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can manage own parq assessment" ON public.parq_assessments FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- APP SETTINGS POLICIES
CREATE POLICY "Anyone can view app settings" ON public.app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage app settings" ON public.app_settings FOR ALL USING (public.is_admin());

-- ==============================================================================
-- ADMIN ANALYTICS PUBLIC/SECURE RPCS
-- ==============================================================================

-- Real aggregate stats for Landing Page (Safe for unauthenticated visitors)
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

-- Admin Dashboard Overview KPIs (Admin-only)
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
