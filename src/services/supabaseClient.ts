import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  UserProfile, 
  Goal, 
  WorkoutPlan, 
  WorkoutSessionLog, 
  ActivityLog, 
  UserFeedback, 
  Exercise,
  FitnessAssessment,
  AIProgressAnalysis,
  ChatMessage,
  Announcement,
  AdminLog,
  AIUsageLog,
  WorkoutTemplate,
  UserBadge,
  Challenge,
  BodyMetric,
  WaterLog,
  SleepLog,
  MealLog,
  ParqAssessment,
  PublicStats,
  AdminDashboardStats
} from '../types';

export const isSupabaseConfigured = (): boolean => {
  const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  
  if (!rawUrl || !rawKey) return false;
  
  const lowerUrl = rawUrl.toLowerCase();
  const lowerKey = rawKey.toLowerCase();
  
  if (
    lowerUrl.includes('xyzcompany') || 
    lowerUrl.includes('your-project') || 
    lowerUrl.includes('dummy') ||
    lowerKey.includes('...') ||
    lowerKey.includes('dummy') ||
    lowerKey.includes('your_anon_key') ||
    lowerKey.includes('placeholder')
  ) {
    return false;
  }
  
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes('your-project') || parsed.hostname.includes('dummy')) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
};

const supabaseUrl = isSupabaseConfigured() ? (import.meta.env.VITE_SUPABASE_URL || '').trim() : 'https://placeholder.supabase.co';
const supabaseAnonKey = isSupabaseConfigured() ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim() : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SupabaseService = {
  // ============================================================================
  // AUTH SERVICES
  // ============================================================================
  async signUp(email: string, password: string, name: string) {
    if (!isSupabaseConfigured()) throw new Error('Supabase environment credentials not configured.');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) throw new Error('Supabase environment credentials not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error:', error);
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured()) throw new Error('Supabase environment credentials not configured.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    if (!isSupabaseConfigured()) throw new Error('Supabase environment credentials not configured.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  // ============================================================================
  // PROFILES API
  // ============================================================================
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      ageGroup: data.age_group || '25-34',
      activityLevel: data.activity_level || 'Lightly Active',
      experience: data.experience || 'Beginner',
      location: data.location || 'Home',
      availableDays: data.available_days || 4,
      durationMinutes: data.duration_minutes || 30,
      preferredTime: data.preferred_time || 'Morning (7:00 AM)',
      equipment: data.equipment || ['None (Bodyweight)'],
      preferredActivities: data.preferred_activities || ['Bodyweight Training'],
      preferences: data.preferences || '',
      language: data.language || 'en',
      isAdmin: Boolean(data.is_admin),
      role: data.role || 'user',
      status: data.status || 'active',
      heightCm: data.height_cm ? Number(data.height_cm) : undefined,
      weightKg: data.weight_kg ? Number(data.weight_kg) : undefined,
      gender: data.gender,
      dateOfBirth: data.date_of_birth,
      onboardingCompleted: Boolean(data.onboarding_completed),
      xp: data.xp || 0,
      level: data.level || 1,
      leaderboardOptIn: Boolean(data.leaderboard_opt_in),
      lastActiveAt: data.last_active_at,
      createdAt: data.created_at
    };
  },

  async fetchAllProfiles(): Promise<UserProfile[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      email: d.email,
      avatarUrl: d.avatar_url,
      ageGroup: d.age_group || '25-34',
      activityLevel: d.activity_level || 'Lightly Active',
      experience: d.experience || 'Beginner',
      location: d.location || 'Home',
      availableDays: d.available_days || 4,
      durationMinutes: d.duration_minutes || 30,
      preferredTime: d.preferred_time || 'Morning (7:00 AM)',
      equipment: d.equipment || ['None (Bodyweight)'],
      preferredActivities: d.preferred_activities || ['Bodyweight Training'],
      preferences: d.preferences || '',
      language: d.language || 'en',
      isAdmin: Boolean(d.is_admin),
      role: d.role || 'user',
      status: d.status || 'active',
      heightCm: d.height_cm ? Number(d.height_cm) : undefined,
      weightKg: d.weight_kg ? Number(d.weight_kg) : undefined,
      gender: d.gender,
      dateOfBirth: d.date_of_birth,
      onboardingCompleted: Boolean(d.onboarding_completed),
      xp: d.xp || 0,
      level: d.level || 1,
      leaderboardOptIn: Boolean(d.leaderboard_opt_in),
      lastActiveAt: d.last_active_at,
      createdAt: d.created_at
    }));
  },

  async upsertProfile(profile: any): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const updateData: any = {
      id: profile.id,
      updated_at: new Date().toISOString()
    };

    const val = (camel: any, snake: any) => camel !== undefined ? camel : snake;

    if (profile.email !== undefined) updateData.email = profile.email;
    if (profile.name !== undefined) updateData.name = profile.name;
    if (val(profile.avatarUrl, profile.avatar_url) !== undefined) updateData.avatar_url = val(profile.avatarUrl, profile.avatar_url);
    if (val(profile.ageGroup, profile.age_group) !== undefined) updateData.age_group = val(profile.ageGroup, profile.age_group);
    if (val(profile.activityLevel, profile.activity_level) !== undefined) updateData.activity_level = val(profile.activityLevel, profile.activity_level);
    if (profile.experience !== undefined) updateData.experience = profile.experience;
    if (profile.location !== undefined) updateData.location = profile.location;
    if (val(profile.availableDays, profile.available_days) !== undefined) updateData.available_days = val(profile.availableDays, profile.available_days);
    if (val(profile.durationMinutes, profile.duration_minutes) !== undefined) updateData.duration_minutes = val(profile.durationMinutes, profile.duration_minutes);
    if (val(profile.preferredTime, profile.preferred_time) !== undefined) updateData.preferred_time = val(profile.preferredTime, profile.preferred_time);
    if (profile.equipment !== undefined) updateData.equipment = profile.equipment;
    if (val(profile.preferredActivities, profile.preferred_activities) !== undefined) updateData.preferred_activities = val(profile.preferredActivities, profile.preferred_activities);
    if (profile.preferences !== undefined) updateData.preferences = profile.preferences;
    if (profile.language !== undefined) updateData.language = profile.language;
    if (val(profile.heightCm, profile.height_cm) !== undefined) updateData.height_cm = val(profile.heightCm, profile.height_cm);
    if (val(profile.weightKg, profile.weight_kg) !== undefined) updateData.weight_kg = val(profile.weightKg, profile.weight_kg);
    if (profile.gender !== undefined) updateData.gender = profile.gender;
    if (val(profile.dateOfBirth, profile.date_of_birth) !== undefined) updateData.date_of_birth = val(profile.dateOfBirth, profile.date_of_birth);
    if (val(profile.onboardingCompleted, profile.onboarding_completed) !== undefined) updateData.onboarding_completed = val(profile.onboardingCompleted, profile.onboarding_completed);
    if (val(profile.leaderboardOptIn, profile.leaderboard_opt_in) !== undefined) updateData.leaderboard_opt_in = val(profile.leaderboardOptIn, profile.leaderboard_opt_in);

    const { error } = await supabase.from('profiles').upsert(updateData);
    if (error) throw error;
  },

  // ============================================================================
  // FITNESS ASSESSMENTS API
  // ============================================================================
  async saveAssessment(assessment: Omit<FitnessAssessment, 'id' | 'completedAt'>): Promise<FitnessAssessment> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('fitness_assessments')
      .insert({
        user_id: assessment.userId,
        age_group: assessment.ageGroup,
        activity_level: assessment.activityLevel,
        experience: assessment.experience,
        location: assessment.location,
        available_days: assessment.availableDays,
        duration_minutes: assessment.durationMinutes,
        preferred_time: assessment.preferredTime,
        equipment: assessment.equipment,
        preferred_activities: assessment.preferredActivities
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      ageGroup: data.age_group,
      activityLevel: data.activity_level,
      experience: data.experience,
      location: data.location,
      availableDays: data.available_days,
      durationMinutes: data.duration_minutes,
      preferredTime: data.preferred_time,
      equipment: data.equipment,
      preferredActivities: data.preferred_activities,
      completedAt: data.completed_at
    };
  },

  // ============================================================================
  // GOALS API
  // ============================================================================
  async fetchGoals(userId: string): Promise<Goal[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(g => ({
      id: g.id,
      userId: g.user_id,
      goalType: g.goal_type,
      title: g.title,
      target: Number(g.target),
      currentProgress: Number(g.current_progress),
      unit: g.unit,
      startDate: g.start_date,
      targetDate: g.target_date,
      status: g.status
    }));
  },

  async saveGoal(goal: Omit<Goal, 'id'> & { id?: string }): Promise<Goal> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const payload: any = {
      user_id: goal.userId,
      goal_type: goal.goalType,
      title: goal.title,
      target: goal.target,
      current_progress: goal.currentProgress || 0,
      unit: goal.unit,
      start_date: goal.startDate,
      target_date: goal.targetDate,
      status: goal.status || 'In Progress'
    };
    if (goal.id && !goal.id.startsWith('goal_')) {
      payload.id = goal.id;
    }

    const { data, error } = await supabase
      .from('goals')
      .upsert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      goalType: data.goal_type,
      title: data.title,
      target: Number(data.target),
      currentProgress: Number(data.current_progress),
      unit: data.unit,
      startDate: data.start_date,
      targetDate: data.target_date,
      status: data.status
    };
  },

  async updateGoalProgress(goalId: string, currentProgress: number): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { data: goal } = await supabase.from('goals').select('target').eq('id', goalId).single();
    const isCompleted = goal ? currentProgress >= Number(goal.target) : false;

    const { error } = await supabase
      .from('goals')
      .update({
        current_progress: currentProgress,
        status: isCompleted ? 'Completed' : 'In Progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (error) throw error;
  },

  async deleteGoal(goalId: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('goals').delete().eq('id', goalId);
    if (error) throw error;
  },

  // ============================================================================
  // WORKOUT PLANS API
  // ============================================================================
  async fetchActivePlan(userId: string): Promise<WorkoutPlan | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'Active')
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) {
      console.error('Error fetching active plan:', error);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      planTitle: data.plan_title,
      summary: data.summary,
      recommendedDays: data.recommended_days,
      estimatedWeeklyBurn: data.estimated_weekly_burn,
      weeklySchedule: data.weekly_schedule,
      createdByAI: Boolean(data.created_by_ai),
      status: data.status,
      disclaimer: data.disclaimer,
      createdAt: data.created_at
    };
  },

  async fetchPlanHistory(userId: string): Promise<WorkoutPlan[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      userId: d.user_id,
      planTitle: d.plan_title,
      summary: d.summary,
      recommendedDays: d.recommended_days,
      estimatedWeeklyBurn: d.estimated_weekly_burn,
      weeklySchedule: d.weekly_schedule,
      createdByAI: Boolean(d.created_by_ai),
      status: d.status,
      disclaimer: d.disclaimer,
      createdAt: d.created_at
    }));
  },

  async savePlan(plan: Omit<WorkoutPlan, 'id' | 'createdAt'>): Promise<WorkoutPlan> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: plan.userId,
        plan_title: plan.planTitle,
        summary: plan.summary,
        recommended_days: plan.recommendedDays,
        estimated_weekly_burn: plan.estimatedWeeklyBurn,
        weekly_schedule: plan.weeklySchedule,
        created_by_ai: plan.createdByAI ?? true,
        status: plan.status || 'Active',
        disclaimer: plan.disclaimer
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      planTitle: data.plan_title,
      summary: data.summary,
      recommendedDays: data.recommended_days,
      estimatedWeeklyBurn: data.estimated_weekly_burn,
      weeklySchedule: data.weekly_schedule,
      createdByAI: Boolean(data.created_by_ai),
      status: data.status,
      disclaimer: data.disclaimer,
      createdAt: data.created_at
    };
  },

  // ============================================================================
  // WORKOUT LOGS & STREAK API
  // ============================================================================
  async fetchWorkoutLogs(userId: string): Promise<WorkoutSessionLog[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(l => ({
      id: l.id,
      userId: l.user_id,
      planId: l.plan_id,
      dayName: l.day_name,
      durationMinutes: l.duration_minutes,
      caloriesBurned: l.calories_burned,
      completedAt: l.completed_at,
      exercisesCompleted: l.exercises_completed,
      totalExercises: l.total_exercises,
      difficultyFeedback: l.difficulty_feedback,
      notes: l.notes
    }));
  },

  async saveWorkoutLog(log: Omit<WorkoutSessionLog, 'id'>): Promise<WorkoutSessionLog> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    // Ensure valid UUID for plan_id or null
    const isValidUuid = log.planId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(log.planId);

    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        user_id: log.userId,
        plan_id: isValidUuid ? log.planId : null,
        day_name: log.dayName,
        duration_minutes: log.durationMinutes,
        calories_burned: log.caloriesBurned,
        completed_at: log.completedAt || new Date().toISOString(),
        exercises_completed: log.exercisesCompleted,
        total_exercises: log.totalExercises,
        difficulty_feedback: log.difficultyFeedback,
        notes: log.notes
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-update user XP
    try { await supabase.rpc('increment', { x: 50 }); } catch {}

    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      dayName: data.day_name,
      durationMinutes: data.duration_minutes,
      caloriesBurned: data.calories_burned,
      completedAt: data.completed_at,
      exercisesCompleted: data.exercises_completed,
      totalExercises: data.total_exercises,
      difficultyFeedback: data.difficulty_feedback,
      notes: data.notes
    };
  },

  async calculateStreak(userId: string): Promise<number> {
    const logs = await this.fetchWorkoutLogs(userId);
    if (!logs || logs.length === 0) return 0;

    const dates = Array.from(new Set(logs.map(l => {
      const d = new Date(l.completedAt);
      return d.toISOString().split('T')[0];
    }))).sort().reverse();

    if (dates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentCheck = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);

    if (!currentCheck) return 0;

    let streak = 0;
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const diffDays = Math.round((new Date(currentCheck).getTime() - new Date(d).getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentCheck = d;
      } else {
        break;
      }
    }
    return streak;
  },

  // ============================================================================
  // ACTIVITY LOGS API
  // ============================================================================
  async fetchActivityLogs(userId: string): Promise<ActivityLog[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(a => ({
      id: a.id,
      userId: a.user_id,
      activityType: a.activity_type as any,
      durationMinutes: a.duration_minutes,
      distanceKm: a.distance_km ? Number(a.distance_km) : undefined,
      caloriesEstimated: a.calories_estimated,
      date: a.date,
      notes: a.notes
    }));
  },

  async saveActivityLog(act: Omit<ActivityLog, 'id'>): Promise<ActivityLog> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: act.userId,
        activity_type: act.activityType,
        duration_minutes: act.durationMinutes,
        distance_km: act.distanceKm,
        calories_estimated: act.caloriesEstimated || 100,
        date: act.date || new Date().toISOString().split('T')[0],
        notes: act.notes
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      activityType: data.activity_type as any,
      durationMinutes: data.duration_minutes,
      distanceKm: data.distance_km ? Number(data.distance_km) : undefined,
      caloriesEstimated: data.calories_estimated,
      date: data.date,
      notes: data.notes
    };
  },

  // ============================================================================
  // EXERCISES CATALOG API
  // ============================================================================
  async fetchExercises(includeInactive = false): Promise<Exercise[]> {
    if (!isSupabaseConfigured()) return [];
    let query = supabase.from('exercises').select('*').order('name');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(e => ({
      id: e.id,
      name: e.name,
      category: e.category as any,
      difficulty: e.difficulty as any,
      targetArea: e.target_area,
      instructions: e.instructions || [],
      defaultReps: e.default_reps,
      defaultSets: e.default_sets,
      defaultRestSeconds: e.default_rest_seconds,
      safetyGuidance: e.safety_guidance,
      equipmentNeeded: e.equipment_needed,
      iconType: e.icon_type as any,
      videoUrl: e.video_url,
      imageUrl: e.image_url,
      isActive: Boolean(e.is_active),
      muscleGroups: e.muscle_groups || [],
      caloriesPerMinute: e.calories_per_minute ? Number(e.calories_per_minute) : 5.0,
      createdBy: e.created_by
    }));
  },

  async saveExercise(ex: Exercise): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('exercises').upsert({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      target_area: ex.targetArea,
      instructions: ex.instructions,
      default_reps: ex.defaultReps,
      default_sets: ex.defaultSets,
      default_rest_seconds: ex.defaultRestSeconds,
      safety_guidance: ex.safetyGuidance,
      equipment_needed: ex.equipmentNeeded,
      icon_type: ex.iconType,
      video_url: ex.videoUrl,
      image_url: ex.imageUrl,
      is_active: ex.isActive ?? true,
      muscle_groups: ex.muscleGroups || [],
      calories_per_minute: ex.caloriesPerMinute || 5.0,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  async deleteExercise(id: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) throw error;
  },

  // ============================================================================
  // USER FEEDBACK API
  // ============================================================================
  async fetchAllFeedback(): Promise<UserFeedback[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(f => ({
      id: f.id,
      userId: f.user_id,
      userName: f.user_name || 'User',
      category: f.category,
      message: f.message,
      rating: f.rating,
      createdAt: f.created_at,
      status: f.status,
      adminReply: f.admin_reply,
      repliedAt: f.replied_at,
      repliedBy: f.replied_by,
      isPublic: Boolean(f.is_public)
    }));
  },

  async fetchUserFeedback(userId: string): Promise<UserFeedback[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(f => ({
      id: f.id,
      userId: f.user_id,
      userName: f.user_name || 'User',
      category: f.category,
      message: f.message,
      rating: f.rating,
      createdAt: f.created_at,
      status: f.status,
      adminReply: f.admin_reply,
      repliedAt: f.replied_at,
      repliedBy: f.replied_by,
      isPublic: Boolean(f.is_public)
    }));
  },

  async fetchApprovedLandingFeedback(): Promise<UserFeedback[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) return [];
    return (data || []).map(f => ({
      id: f.id,
      userId: f.user_id,
      userName: f.user_name || 'Verified User',
      category: f.category,
      message: f.message,
      rating: f.rating,
      createdAt: f.created_at,
      status: f.status,
      isPublic: true
    }));
  },

  async saveFeedback(fb: Omit<UserFeedback, 'id' | 'createdAt'>): Promise<UserFeedback> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: fb.userId || null,
        user_name: fb.userName || 'User',
        category: fb.category,
        message: fb.message,
        rating: fb.rating,
        status: 'New'
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      category: data.category,
      message: data.message,
      rating: data.rating,
      createdAt: data.created_at,
      status: data.status
    };
  },

  async updateFeedbackStatus(
    id: string, 
    status: 'New' | 'Reviewed' | 'Resolved', 
    reply?: string, 
    isPublic?: boolean
  ): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const updates: any = { status };
    if (reply !== undefined) {
      updates.admin_reply = reply;
      updates.replied_at = new Date().toISOString();
    }
    if (isPublic !== undefined) updates.is_public = isPublic;

    const { error } = await supabase.from('feedback').update(updates).eq('id', id);
    if (error) throw error;
  },

  // ============================================================================
  // AI ANALYSES & CHAT API
  // ============================================================================
  async fetchLatestAIAnalysis(userId: string): Promise<AIProgressAnalysis | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      headline: data.headline,
      consistencyScore: data.consistency_score,
      keyObservations: data.observations || [],
      adaptiveRecommendations: data.recommendations || [],
      encouragement: data.encouragement,
      createdAt: data.created_at
    };
  },

  async saveAIAnalysis(analysis: AIProgressAnalysis & { userId: string }): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('ai_analyses').insert({
      user_id: analysis.userId,
      headline: analysis.headline,
      consistency_score: analysis.consistencyScore,
      observations: analysis.keyObservations,
      recommendations: analysis.adaptiveRecommendations,
      encouragement: analysis.encouragement
    });
    if (error) throw error;
  },

  async fetchChatMessages(userId: string): Promise<ChatMessage[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;
    return (data || []).map(c => ({
      id: c.id,
      userId: c.user_id,
      role: c.role,
      content: c.content,
      createdAt: c.created_at
    }));
  },

  async saveChatMessage(msg: { userId: string; role: 'user' | 'model'; content: string }): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('chat_messages').insert({
      user_id: msg.userId,
      role: msg.role,
      content: msg.content
    });
    if (error) throw error;
  },

  async clearChatMessages(userId: string): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('chat_messages').delete().eq('user_id', userId);
    if (error) throw error;
  },

  // ============================================================================
  // ANNOUNCEMENTS & NOTIFICATIONS API
  // ============================================================================
  async fetchActiveAnnouncements(userId?: string): Promise<Announcement[]> {
    if (!isSupabaseConfigured()) return [];
    const { data: annData, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !annData) return [];

    let readIds = new Set<string>();
    if (userId) {
      const { data: reads } = await supabase
        .from('notification_reads')
        .select('announcement_id')
        .eq('user_id', userId);
      if (reads) {
        reads.forEach(r => readIds.add(r.announcement_id));
      }
    }

    return annData.map(a => ({
      id: a.id,
      title: a.title,
      body: a.body,
      audience: a.audience,
      startsAt: a.starts_at,
      endsAt: a.ends_at,
      isActive: a.is_active,
      createdAt: a.created_at,
      read: readIds.has(a.id)
    }));
  },

  async markAnnouncementRead(userId: string, announcementId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('notification_reads').upsert({
        user_id: userId,
        announcement_id: announcementId
      });
    } catch {}
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id' | 'createdAt'>): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('announcements').insert({
      title: announcement.title,
      body: announcement.body,
      audience: announcement.audience || 'all',
      is_active: announcement.isActive ?? true
    });
    if (error) throw error;
  },

  // ============================================================================
  // HEALTH TRACKING (BODY METRICS, WATER, SLEEP, MEALS)
  // ============================================================================
  async fetchBodyMetrics(userId: string): Promise<BodyMetric[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(b => ({
      id: b.id,
      userId: b.user_id,
      date: b.date,
      weightKg: b.weight_kg ? Number(b.weight_kg) : undefined,
      heightCm: b.height_cm ? Number(b.height_cm) : undefined,
      waistCm: b.waist_cm ? Number(b.waist_cm) : undefined,
      notes: b.notes
    }));
  },

  async saveBodyMetric(metric: Omit<BodyMetric, 'id'>): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('body_metrics').insert({
      user_id: metric.userId,
      date: metric.date || new Date().toISOString().split('T')[0],
      weight_kg: metric.weightKg,
      height_cm: metric.heightCm,
      waist_cm: metric.waistCm,
      notes: metric.notes
    });
    if (error) throw error;
  },

  async fetchWaterLogs(userId: string, date: string): Promise<WaterLog[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if (error) return [];
    return (data || []).map(w => ({
      id: w.id,
      userId: w.user_id,
      date: w.date,
      amountMl: w.amount_ml
    }));
  },

  async addWaterLog(userId: string, amountMl: number): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('water_logs').insert({
      user_id: userId,
      date: today,
      amount_ml: amountMl
    });
    if (error) throw error;
  },

  async saveParqAssessment(parq: ParqAssessment): Promise<void> {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    const { error } = await supabase.from('parq_assessments').insert({
      user_id: parq.userId,
      has_heart_condition: parq.hasHeartCondition,
      has_chest_pain: parq.hasChestPain,
      has_dizziness: parq.hasDizziness,
      has_joint_issue: parq.hasJointIssue,
      on_bp_medication: parq.onBpMedication,
      other_medical_reason: parq.otherMedicalReason,
      risk_level: parq.riskLevel
    });
    if (error) throw error;
  },

  // ============================================================================
  // PUBLIC & ADMIN ANALYTICS RPCs
  // ============================================================================
  async getPublicStats(): Promise<PublicStats> {
    if (!isSupabaseConfigured()) return { totalUsers: 0, totalWorkouts: 0, totalMinutes: 0 };
    try {
      const { data, error } = await supabase.rpc('get_public_stats');
      if (error || !data) return { totalUsers: 0, totalWorkouts: 0, totalMinutes: 0 };
      return {
        totalUsers: data.totalUsers || 0,
        totalWorkouts: data.totalWorkouts || 0,
        totalMinutes: data.totalMinutes || 0
      };
    } catch {
      return { totalUsers: 0, totalWorkouts: 0, totalMinutes: 0 };
    }
  },

  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    if (!isSupabaseConfigured()) {
      return { totalUsers: 0, newUsers7d: 0, totalWorkouts: 0, totalMinutes: 0, avgCompletionRate: 0, avgRating: 0, openFeedback: 0, aiCallsToday: 0 };
    }
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    if (error) throw error;
    return {
      totalUsers: data.totalUsers || 0,
      newUsers7d: data.newUsers7d || 0,
      totalWorkouts: data.totalWorkouts || 0,
      totalMinutes: data.totalMinutes || 0,
      avgCompletionRate: data.avgCompletionRate || 0,
      avgRating: data.avgRating || 0,
      openFeedback: data.openFeedback || 0,
      aiCallsToday: data.aiCallsToday || 0
    };
  },

  async fetchAdminLogs(): Promise<AdminLog[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []).map(a => ({
      id: a.id,
      adminId: a.admin_id,
      action: a.action,
      targetType: a.target_type,
      targetId: a.target_id,
      details: a.details,
      createdAt: a.created_at
    }));
  },

  async logAdminAction(action: string, targetType?: string, targetId?: string, details?: any): Promise<void> {
    if (!isSupabaseConfigured()) return;
    const session = await this.getCurrentSession();
    if (!session?.user) return;
    try {
      await supabase.from('admin_logs').insert({
        admin_id: session.user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details: details ? JSON.stringify(details) : null
      });
    } catch (e) {
      console.error(e);
    }
  },

  // Convenience Aliases
  async updateProfile(userId: string, data: any): Promise<void> {
    return this.upsertProfile({ id: userId, ...data });
  },

  async saveActivePlan(userId: string, plan: WorkoutPlan): Promise<WorkoutPlan> {
    return this.savePlan({ ...plan, userId, status: 'Active' });
  },

  async addExercise(ex: Omit<Exercise, 'id'>): Promise<Exercise> {
    const exerciseWithId: Exercise = {
      id: 'ex_' + Date.now(),
      ...ex
    };
    await this.saveExercise(exerciseWithId);
    return exerciseWithId;
  },

  async saveAIProgressAnalysis(userId: string, analysis: AIProgressAnalysis): Promise<void> {
    return this.saveAIAnalysis({ ...analysis, userId });
  }
};
