export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type WorkoutLocation = 'Home' | 'Gym' | 'Outdoor';
export type GoalType = 
  | 'General Fitness' 
  | 'Improve Stamina' 
  | 'Build Strength' 
  | 'Improve Flexibility' 
  | 'Increase Physical Activity' 
  | 'Maintain Fitness' 
  | 'Improve Consistency';

export type Language = 'en' | 'hi' | 'gu';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  ageGroup: string;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  experience: ExperienceLevel;
  location: WorkoutLocation;
  availableDays: number;
  durationMinutes: number;
  preferredTime: string;
  equipment: string[];
  preferredActivities: string[];
  preferences: string;
  language: Language;
  isAdmin?: boolean;
}

export interface FitnessAssessment {
  id: string;
  userId: string;
  ageGroup: string;
  activityLevel: string;
  experience: ExperienceLevel;
  location: WorkoutLocation;
  availableDays: number;
  durationMinutes: number;
  preferredTime: string;
  equipment: string[];
  preferredActivities: string[];
  completedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  goalType: GoalType;
  title: string;
  target: number;
  currentProgress: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: 'In Progress' | 'Completed' | 'Paused';
}

export interface Exercise {
  id: string;
  name: string;
  category: 'Cardio' | 'Strength' | 'Flexibility' | 'Mobility' | 'Full Body' | 'Core';
  difficulty: ExperienceLevel;
  targetArea: string;
  instructions: string[];
  defaultReps: string;
  defaultSets: number;
  defaultRestSeconds: number;
  safetyGuidance: string;
  equipmentNeeded: string;
  iconType: 'pushup' | 'squat' | 'plank' | 'run' | 'stretch' | 'dumbbell' | 'jumping' | 'lunge' | 'generic';
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  targetMuscles: string;
  instructions: string;
  safetyTip: string;
  category: string;
  completed?: boolean;
}

export interface WorkoutDay {
  dayNumber: number;
  dayName: string;
  focus: string;
  targetArea: string;
  durationMinutes: number;
  estimatedCalories: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  planTitle: string;
  summary: string;
  recommendedDays: number;
  estimatedWeeklyBurn: string;
  weeklySchedule: WorkoutDay[];
  createdByAI: boolean;
  status: 'Active' | 'Completed' | 'Archived';
  createdAt: string;
  disclaimer?: string;
}

export interface WorkoutSessionLog {
  id: string;
  userId: string;
  planId: string;
  dayName: string;
  durationMinutes: number;
  caloriesBurned: number;
  completedAt: string; // ISO string or YYYY-MM-DD
  exercisesCompleted: number;
  totalExercises: number;
  difficultyFeedback?: 'Too Easy' | 'Just Right' | 'Too Hard';
  notes?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activityType: 'Walking' | 'Running' | 'Cycling' | 'Yoga' | 'Swimming' | 'Sports' | 'Strength' | 'Home Workout' | 'Other';
  durationMinutes: number;
  distanceKm?: number;
  caloriesEstimated?: number;
  date: string;
  notes?: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  userName?: string;
  category: 'General Feedback' | 'AI Assistant' | 'Workout' | 'Exercise' | 'Progress Tracking' | 'Recommendations' | 'UI/UX' | 'Bug Report' | 'Other' | 'Workout Difficulty' | 'Exercise Quality' | 'AI Recommendations' | 'User Experience' | 'Platform Issue' | 'General';
  message: string;
  rating: number; // 1 to 5
  createdAt: string;
  status?: 'New' | 'Reviewed' | 'Resolved';
}

export interface AIProgressAnalysis {
  headline: string;
  consistencyScore: number;
  keyObservations: string[];
  adaptiveRecommendations: {
    type: string;
    title: string;
    description: string;
  }[];
  encouragement: string;
}
