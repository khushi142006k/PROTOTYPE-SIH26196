import { 
  UserProfile, 
  FitnessAssessment, 
  Goal, 
  Exercise, 
  WorkoutPlan, 
  WorkoutSessionLog, 
  ActivityLog, 
  UserFeedback,
  AIProgressAnalysis
} from '../types';
import { initialExercises } from '../data/exerciseLibrary';

const STORAGE_KEYS = {
  USER_PROFILE: 'fitmate_user_profile',
  ASSESSMENT: 'fitmate_assessment',
  GOALS: 'fitmate_goals',
  ACTIVE_PLAN: 'fitmate_active_plan',
  WORKOUT_LOGS: 'fitmate_workout_logs',
  ACTIVITY_LOGS: 'fitmate_activity_logs',
  EXERCISES: 'fitmate_exercises',
  FEEDBACK: 'fitmate_feedback',
  AI_ANALYSIS: 'fitmate_ai_analysis',
};

// Seed initial profile if none exists
const defaultProfile: UserProfile = {
  id: 'usr_default_101',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  ageGroup: '25-34',
  activityLevel: 'Lightly Active',
  experience: 'Beginner',
  location: 'Home',
  availableDays: 4,
  durationMinutes: 30,
  preferredTime: 'Morning (7:00 AM)',
  equipment: ['None (Bodyweight)', 'Resistance Bands'],
  preferredActivities: ['Bodyweight Training', 'Brisk Walking', 'Yoga'],
  preferences: 'Focus on core strength and cardiovascular endurance with low impact.',
  language: 'en',
  isAdmin: false
};

const defaultGoals: Goal[] = [
  {
    id: 'goal_1',
    userId: 'usr_default_101',
    goalType: 'Improve Consistency',
    title: 'Workout 4 Days per Week',
    target: 4,
    currentProgress: 3,
    unit: 'workouts/week',
    startDate: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'In Progress'
  },
  {
    id: 'goal_2',
    userId: 'usr_default_101',
    goalType: 'Build Strength',
    title: 'Complete 50 Push-Ups Total',
    target: 50,
    currentProgress: 35,
    unit: 'reps completed',
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    targetDate: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    status: 'In Progress'
  }
];

const defaultPlan: WorkoutPlan = {
  id: 'plan_seed_01',
  userId: 'usr_default_101',
  planTitle: '4-Week Adaptive Beginner Home Fitness',
  summary: 'A balanced bodyweight routine designed for home workouts with minimal space and zero equipment needed.',
  recommendedDays: 4,
  estimatedWeeklyBurn: '750-1000 kcal',
  createdByAI: true,
  status: 'Active',
  createdAt: new Date().toISOString(),
  weeklySchedule: [
    {
      dayNumber: 1,
      dayName: 'Day 1: Full Body Foundations',
      focus: 'Core & Upper Body Stability',
      targetArea: 'Full Body',
      durationMinutes: 30,
      estimatedCalories: 210,
      exercises: [
        {
          id: 'ex_squats',
          name: 'Bodyweight Air Squats',
          sets: 3,
          reps: '12-15 reps',
          restSeconds: 45,
          targetMuscles: 'Quadriceps, Glutes',
          instructions: 'Sit back into hips, keeping chest lifted and knees tracking over toes.',
          safetyTip: 'Maintain flat feet throughout rotation.',
          category: 'Strength'
        },
        {
          id: 'ex_pushups',
          name: 'Push-Ups (or Knee Modification)',
          sets: 3,
          reps: '8-10 reps',
          restSeconds: 45,
          targetMuscles: 'Chest, Shoulders, Triceps',
          instructions: 'Lower chest gently toward floor, elbows bent 45 degrees.',
          safetyTip: 'Avoid letting hips sag.',
          category: 'Strength'
        },
        {
          id: 'ex_plank',
          name: 'Forearm Plank Hold',
          sets: 3,
          reps: '30 seconds',
          restSeconds: 45,
          targetMuscles: 'Abdominals, Obliques',
          instructions: 'Hold straight line posture on forearms and toes.',
          safetyTip: 'Keep breathing continuously.',
          category: 'Core'
        }
      ]
    },
    {
      dayNumber: 2,
      dayName: 'Day 2: Cardio & Endurance Boost',
      focus: 'Heart Rate & Agility',
      targetArea: 'Cardio & Legs',
      durationMinutes: 25,
      estimatedCalories: 190,
      exercises: [
        {
          id: 'ex_jumping_jacks',
          name: 'Jumping Jacks',
          sets: 3,
          reps: '45 seconds',
          restSeconds: 30,
          targetMuscles: 'Full Body',
          instructions: 'Brisk cadence with soft landings.',
          safetyTip: 'Bend knees slightly on land.',
          category: 'Cardio'
        },
        {
          id: 'ex_mountain_climbers',
          name: 'Mountain Climbers',
          sets: 3,
          reps: '30 seconds',
          restSeconds: 45,
          targetMuscles: 'Core & Shoulders',
          instructions: 'Drive knees rapidly toward chest in high plank.',
          safetyTip: 'Keep shoulders over wrists.',
          category: 'Cardio'
        },
        {
          id: 'ex_glute_bridges',
          name: 'Glute Bridges',
          sets: 3,
          reps: '15 reps',
          restSeconds: 30,
          targetMuscles: 'Glutes & Lower Back',
          instructions: 'Drive hips up towards ceiling and squeeze glutes.',
          safetyTip: 'Squeeze glutes at peak without over-arching back.',
          category: 'Strength'
        }
      ]
    },
    {
      dayNumber: 3,
      dayName: 'Day 3: Active Mobility & Flexibility',
      focus: 'Joint Health & Decompression',
      targetArea: 'Spine & Hips',
      durationMinutes: 20,
      estimatedCalories: 110,
      exercises: [
        {
          id: 'ex_cobra_stretch',
          name: 'Cobra / Sphinx Stretch',
          sets: 3,
          reps: '30 seconds hold',
          restSeconds: 20,
          targetMuscles: 'Abs & Back',
          instructions: 'Gently extend chest up while keeping hips down.',
          safetyTip: 'Breathe gently into chest.',
          category: 'Flexibility'
        },
        {
          id: 'ex_childs_pose',
          name: "Child's Pose Restorative Stretch",
          sets: 3,
          reps: '45 seconds hold',
          restSeconds: 20,
          targetMuscles: 'Spine & Hips',
          instructions: 'Sink hips back onto heels with arms outstretched.',
          safetyTip: 'Relax jaw and neck.',
          category: 'Mobility'
        }
      ]
    },
    {
      dayNumber: 4,
      dayName: 'Day 4: Strength & Balance Challenge',
      focus: 'Unilateral Leg Strength',
      targetArea: 'Lower Body & Core',
      durationMinutes: 30,
      estimatedCalories: 220,
      exercises: [
        {
          id: 'ex_lunges',
          name: 'Alternating Forward Lunges',
          sets: 3,
          reps: '10 per leg',
          restSeconds: 45,
          targetMuscles: 'Quads & Glutes',
          instructions: 'Step forward keeping front knee aligned over ankle.',
          safetyTip: 'Maintain tall upright torso.',
          category: 'Strength'
        },
        {
          id: 'ex_squats',
          name: 'Bodyweight Air Squats',
          sets: 3,
          reps: '15 reps',
          restSeconds: 45,
          targetMuscles: 'Quads & Glutes',
          instructions: 'Inhale down, drive through heels to stand.',
          safetyTip: 'Keep heels grounded.',
          category: 'Strength'
        },
        {
          id: 'ex_plank',
          name: 'Forearm Plank Hold',
          sets: 3,
          reps: '40 seconds',
          restSeconds: 45,
          targetMuscles: 'Core',
          instructions: 'Squeeze glutes and core tight.',
          safetyTip: 'Do not hold your breath.',
          category: 'Core'
        }
      ]
    }
  ]
};

const defaultWorkoutLogs: WorkoutSessionLog[] = [
  {
    id: 'log_01',
    userId: 'usr_default_101',
    planId: 'plan_seed_01',
    dayName: 'Day 1: Full Body Foundations',
    durationMinutes: 28,
    caloriesBurned: 205,
    completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    exercisesCompleted: 3,
    totalExercises: 3,
    difficultyFeedback: 'Just Right',
    notes: 'Felt strong! Push-ups were challenging on the 3rd set.'
  },
  {
    id: 'log_02',
    userId: 'usr_default_101',
    planId: 'plan_seed_01',
    dayName: 'Day 2: Cardio & Endurance Boost',
    durationMinutes: 24,
    caloriesBurned: 185,
    completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    exercisesCompleted: 3,
    totalExercises: 3,
    difficultyFeedback: 'Just Right',
    notes: 'Good sweat session in the morning.'
  },
  {
    id: 'log_03',
    userId: 'usr_default_101',
    planId: 'plan_seed_01',
    dayName: 'Day 3: Active Mobility & Flexibility',
    durationMinutes: 20,
    caloriesBurned: 110,
    completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    exercisesCompleted: 2,
    totalExercises: 2,
    difficultyFeedback: 'Just Right',
    notes: 'Relaxing stretch after a long study day.'
  }
];

const defaultActivityLogs: ActivityLog[] = [
  {
    id: 'act_01',
    userId: 'usr_default_101',
    activityType: 'Walking',
    durationMinutes: 35,
    distanceKm: 2.8,
    caloriesEstimated: 140,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    notes: 'Evening neighborhood walk with music.'
  },
  {
    id: 'act_02',
    userId: 'usr_default_101',
    activityType: 'Cycling',
    durationMinutes: 25,
    distanceKm: 6.2,
    caloriesEstimated: 180,
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    notes: 'Brisk ride along park path.'
  }
];

export const StorageService = {
  getUserProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      this.saveUserProfile(defaultProfile);
      return defaultProfile;
    }
    return JSON.parse(data);
  },

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getGoals(): Goal[] {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!data) {
      this.saveGoals(defaultGoals);
      return defaultGoals;
    }
    return JSON.parse(data);
  },

  saveGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  addGoal(goal: Omit<Goal, 'id'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: 'goal_' + Date.now()
    };
    goals.push(newGoal);
    this.saveGoals(goals);
    return newGoal;
  },

  updateGoalProgress(goalId: string, currentProgress: number): void {
    const goals = this.getGoals();
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const isCompleted = currentProgress >= g.target;
        return {
          ...g,
          currentProgress,
          status: isCompleted ? 'Completed' : g.status
        };
      }
      return g;
    });
    this.saveGoals(updated as Goal[]);
  },

  getActivePlan(): WorkoutPlan | null {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN);
    if (!data) {
      this.saveActivePlan(defaultPlan);
      return defaultPlan;
    }
    return JSON.parse(data);
  },

  saveActivePlan(plan: WorkoutPlan): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN, JSON.stringify(plan));
  },

  getWorkoutLogs(): WorkoutSessionLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    if (!data) {
      this.saveWorkoutLogs(defaultWorkoutLogs);
      return defaultWorkoutLogs;
    }
    return JSON.parse(data);
  },

  saveWorkoutLogs(logs: WorkoutSessionLog[]): void {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(logs));
  },

  addWorkoutLog(log: Omit<WorkoutSessionLog, 'id'>): WorkoutSessionLog {
    const logs = this.getWorkoutLogs();
    const newLog: WorkoutSessionLog = {
      ...log,
      id: 'log_' + Date.now()
    };
    logs.unshift(newLog);
    this.saveWorkoutLogs(logs);
    return newLog;
  },

  getActivityLogs(): ActivityLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
    if (!data) {
      this.saveActivityLogs(defaultActivityLogs);
      return defaultActivityLogs;
    }
    return JSON.parse(data);
  },

  saveActivityLogs(logs: ActivityLog[]): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs));
  },

  addActivityLog(act: Omit<ActivityLog, 'id'>): ActivityLog {
    const logs = this.getActivityLogs();
    const newAct: ActivityLog = {
      ...act,
      id: 'act_' + Date.now()
    };
    logs.unshift(newAct);
    this.saveActivityLogs(logs);
    return newAct;
  },

  getExercises(): Exercise[] {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (!data) {
      this.saveExercises(initialExercises);
      return initialExercises;
    }
    return JSON.parse(data);
  },

  saveExercises(exercises: Exercise[]): void {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  },

  addExercise(ex: Omit<Exercise, 'id'>): Exercise {
    const exercises = this.getExercises();
    const newEx: Exercise = {
      ...ex,
      id: 'ex_' + Date.now()
    };
    exercises.unshift(newEx);
    this.saveExercises(exercises);
    return newEx;
  },

  deleteExercise(id: string): void {
    const exercises = this.getExercises().filter(e => e.id !== id);
    this.saveExercises(exercises);
  },

  getFeedback(): UserFeedback[] {
    const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    if (!data) return [
      {
        id: 'fb_01',
        userId: 'usr_default_101',
        userName: 'Alex Rivera',
        category: 'Workout Difficulty',
        message: 'The AI plan pacing is great! Perfect balance for home workout.',
        rating: 5,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      }
    ];
    return JSON.parse(data);
  },

  saveFeedback(fbList: UserFeedback[]): void {
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(fbList));
  },

  addFeedback(fb: Omit<UserFeedback, 'id' | 'createdAt'>): UserFeedback {
    const list = this.getFeedback();
    const item: UserFeedback = {
      ...fb,
      id: 'fb_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    list.unshift(item);
    this.saveFeedback(list);
    return item;
  },

  getAIAnalysis(): AIProgressAnalysis | null {
    const data = localStorage.getItem(STORAGE_KEYS.AI_ANALYSIS);
    if (!data) return {
      headline: 'Consistent Effort! 75% Weekly Target Reached',
      consistencyScore: 75,
      keyObservations: [
        'You completed 3 out of 4 planned sessions this week.',
        'Core stability exercises were logged with high completion rates.',
        'Evening energy levels appear optimal based on completion timestamps.'
      ],
      adaptiveRecommendations: [
        {
          type: 'intensity',
          title: 'Slightly Boost Push-Up Reps',
          description: 'Increase push-ups from 8 to 10 reps in your next session to gradually build upper body strength.'
        },
        {
          type: 'recovery',
          title: 'Maintain 1 Active Recovery Day',
          description: 'Keep Sunday for light walking or restorative child pose stretches.'
        }
      ],
      encouragement: 'Great job maintaining your routine, Alex! You are building habits that stick.'
    };
    return JSON.parse(data);
  },

  saveAIAnalysis(analysis: AIProgressAnalysis): void {
    localStorage.setItem(STORAGE_KEYS.AI_ANALYSIS, JSON.stringify(analysis));
  },

  calculateStreak(): number {
    const logs = this.getWorkoutLogs();
    if (logs.length === 0) return 0;

    // Simple consecutive activity day calculation
    const dates = Array.from(new Set(logs.map(l => l.completedAt.split('T')[0]))).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentCheck = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);

    if (!currentCheck) return 0;

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
  }
};
