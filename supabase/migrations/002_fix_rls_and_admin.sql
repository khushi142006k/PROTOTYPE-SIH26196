-- ==============================================================================
-- FITMATE AI MIGRATION 002: RLS FIXES, SECURITY & PRIVILEGE HARDENING
-- ==============================================================================

-- 1. SECURITY DEFINER IS_ADMIN FUNCTION (Fixes infinite recursion 42P17)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (is_admin = TRUE OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. SAFE PROFILE CREATION TRIGGER (Prevents privilege escalation via email/metadata)
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
        FALSE, -- New users are NEVER admin by default
        'user',
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(public.profiles.name, EXCLUDED.name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PROFILE FIELD PROTECTION TRIGGER (Prevents non-admins from changing is_admin or status)
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

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- 4. WORKOUT PLAN AUTOMATIC ARCHIVING TRIGGER
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

DROP TRIGGER IF EXISTS trg_archive_previous_plans ON public.workout_plans;
CREATE TRIGGER trg_archive_previous_plans
    BEFORE INSERT OR UPDATE OF status ON public.workout_plans
    FOR EACH ROW EXECUTE FUNCTION public.archive_previous_workout_plans();

-- ==============================================================================
-- CLEAN & SECURE RLS POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies safely
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own assessments" ON public.fitness_assessments;
DROP POLICY IF EXISTS "Users can insert own assessment" ON public.fitness_assessments;
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.fitness_assessments;

DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;
DROP POLICY IF EXISTS "Admins can view all goals" ON public.goals;

DROP POLICY IF EXISTS "Anyone can view exercises" ON public.exercises;
DROP POLICY IF EXISTS "Admins can insert/update/delete exercises" ON public.exercises;

DROP POLICY IF EXISTS "Users can view own plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can manage own plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Admins can view all plans" ON public.workout_plans;

DROP POLICY IF EXISTS "Users can view own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can insert own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can update own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can delete own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Admins can view all workout logs" ON public.workout_logs;

DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can update own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can delete own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Anyone can view public feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can manage feedback" ON public.feedback;

DROP POLICY IF EXISTS "Admins can manage admin logs" ON public.admin_logs;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE USING (public.is_admin());

-- FITNESS ASSESSMENTS POLICIES
CREATE POLICY "Users can view own assessments" ON public.fitness_assessments
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own assessment" ON public.fitness_assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- GOALS POLICIES
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- EXERCISES POLICIES
CREATE POLICY "Anyone can view active exercises" ON public.exercises
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "Admins can insert exercises" ON public.exercises
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update exercises" ON public.exercises
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete exercises" ON public.exercises
    FOR DELETE USING (public.is_admin());

-- WORKOUT PLANS POLICIES
CREATE POLICY "Users can view own plans" ON public.workout_plans
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own plans" ON public.workout_plans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans" ON public.workout_plans
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own plans" ON public.workout_plans
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- WORKOUT LOGS POLICIES
CREATE POLICY "Users can view own workout logs" ON public.workout_logs
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own workout logs" ON public.workout_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" ON public.workout_logs
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own workout logs" ON public.workout_logs
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- ACTIVITY LOGS POLICIES
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity logs" ON public.activity_logs
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own activity logs" ON public.activity_logs
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- FEEDBACK POLICIES
CREATE POLICY "Users can view own or public feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE OR public.is_admin());

CREATE POLICY "Users can insert feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can update feedback" ON public.feedback
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete feedback" ON public.feedback
    FOR DELETE USING (public.is_admin());

-- ADMIN LOGS POLICIES
CREATE POLICY "Admins can view admin logs" ON public.admin_logs
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert admin logs" ON public.admin_logs
    FOR INSERT WITH CHECK (public.is_admin());
