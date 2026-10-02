import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseService } from '../services/supabaseClient';
import { 
  WorkoutPlan, 
  Goal, 
  WorkoutSessionLog, 
  ActivityLog, 
  Exercise, 
  AIProgressAnalysis, 
  UserFeedback,
  Announcement,
  BodyMetric,
  ParqAssessment
} from '../types';

export function useActivePlan(userId?: string) {
  return useQuery({
    queryKey: ['activePlan', userId],
    queryFn: () => userId ? SupabaseService.fetchActivePlan(userId) : null,
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useGoals(userId?: string) {
  return useQuery({
    queryKey: ['goals', userId],
    queryFn: () => userId ? SupabaseService.fetchGoals(userId) : [],
    enabled: Boolean(userId),
  });
}

export function useWorkoutLogs(userId?: string) {
  return useQuery({
    queryKey: ['workoutLogs', userId],
    queryFn: () => userId ? SupabaseService.fetchWorkoutLogs(userId) : [],
    enabled: Boolean(userId),
  });
}

export function useActivityLogs(userId?: string) {
  return useQuery({
    queryKey: ['activityLogs', userId],
    queryFn: () => userId ? SupabaseService.fetchActivityLogs(userId) : [],
    enabled: Boolean(userId),
  });
}

export function useStreak(userId?: string) {
  return useQuery({
    queryKey: ['streak', userId],
    queryFn: () => userId ? SupabaseService.calculateStreak(userId) : 0,
    enabled: Boolean(userId),
  });
}

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => SupabaseService.fetchExercises(false),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAIAnalysis(userId?: string) {
  return useQuery({
    queryKey: ['aiAnalysis', userId],
    queryFn: () => userId ? SupabaseService.fetchLatestAIAnalysis(userId) : null,
    enabled: Boolean(userId),
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['publicStats'],
    queryFn: () => SupabaseService.getPublicStats(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminStats(enabled: boolean) {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: () => SupabaseService.getAdminDashboardStats(),
    enabled,
  });
}

export function useAnnouncements(userId?: string) {
  return useQuery({
    queryKey: ['announcements', userId],
    queryFn: () => SupabaseService.fetchActiveAnnouncements(userId),
  });
}

export function useApprovedLandingFeedback() {
  return useQuery({
    queryKey: ['landingFeedback'],
    queryFn: () => SupabaseService.fetchApprovedLandingFeedback(),
  });
}

export function useAllFeedback(enabled: boolean) {
  return useQuery({
    queryKey: ['allFeedback'],
    queryFn: () => SupabaseService.fetchAllFeedback(),
    enabled,
  });
}

export function useBodyMetrics(userId?: string) {
  return useQuery({
    queryKey: ['bodyMetrics', userId],
    queryFn: () => userId ? SupabaseService.fetchBodyMetrics(userId) : [],
    enabled: Boolean(userId),
  });
}

// MUTATION HOOKS
export function useDataMutations(userId?: string) {
  const queryClient = useQueryClient();

  const addWorkoutLogMutation = useMutation({
    mutationFn: (log: Omit<WorkoutSessionLog, 'id'>) => SupabaseService.saveWorkoutLog(log),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workoutLogs', userId] });
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
      queryClient.invalidateQueries({ queryKey: ['publicStats'] });
    }
  });

  const addActivityLogMutation = useMutation({
    mutationFn: (act: Omit<ActivityLog, 'id'>) => SupabaseService.saveActivityLog(act),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activityLogs', userId] });
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    }
  });

  const addGoalMutation = useMutation({
    mutationFn: (goal: Omit<Goal, 'id'>) => SupabaseService.saveGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    }
  });

  const updateGoalProgressMutation = useMutation({
    mutationFn: ({ goalId, progress }: { goalId: string; progress: number }) => 
      SupabaseService.updateGoalProgress(goalId, progress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals', userId] });
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: (fb: Omit<UserFeedback, 'id' | 'createdAt'>) => SupabaseService.saveFeedback(fb),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allFeedback'] });
    }
  });

  return {
    addWorkoutLog: addWorkoutLogMutation.mutateAsync,
    addActivityLog: addActivityLogMutation.mutateAsync,
    addGoal: addGoalMutation.mutateAsync,
    updateGoalProgress: updateGoalProgressMutation.mutateAsync,
    submitFeedback: submitFeedbackMutation.mutateAsync,
  };
}
