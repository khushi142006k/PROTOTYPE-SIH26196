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
  role?: 'user' | 'admin' | 'moderator';
  status?: 'active' | 'suspended';
  heightCm?: number;
  weightKg?: number;
  gender?: string;
  dateOfBirth?: string;
  onboardingCompleted?: boolean;
  xp?: number;
  level?: number;
  leaderboardOptIn?: boolean;
  lastActiveAt?: string;
  createdAt?: string;
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
  category: 'Cardio' | 'Strength' | 'Flexibility' | 'Mobility' | 'Full Body' | 'Core' | 'Yoga';
  difficulty: ExperienceLevel;
  targetArea: string;
  instructions: string[];
  defaultReps: string;
  defaultSets: number;
  defaultRestSeconds: number;
  safetyGuidance: string;
  equipmentNeeded: string;
  iconType: 'pushup' | 'squat' | 'plank' | 'run' | 'stretch' | 'dumbbell' | 'jumping' | 'lunge' | 'generic';
  videoUrl?: string;
  imageUrl?: string;
  isActive?: boolean;
  muscleGroups?: string[];
  caloriesPerMinute?: number;
  createdBy?: string;
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
  planId?: string;
  dayName: string;
  durationMinutes: number;
  caloriesBurned: number;
  completedAt: string;
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
  userId?: string;
  userName?: string;
  category: string;
  message: string;
  rating: number;
  createdAt: string;
  status?: 'New' | 'Reviewed' | 'Resolved';
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  isPublic?: boolean;
  isApproved?: boolean;
}

export interface AIProgressAnalysis {
  id?: string;
  headline: string;
  consistencyScore: number;
  keyObservations: string[];
  adaptiveRecommendations: {
    type: string;
    title: string;
    description: string;
  }[];
  encouragement: string;
  createdAt?: string;
}

export interface ChatMessage {
  id?: string;
  userId?: string;
  role: 'user' | 'model' | 'system';
  content: string;
  createdAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience?: string;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
  createdAt?: string;
  read?: boolean;
}

export interface AdminLog {
  id: string;
  adminId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: any;
  createdAt: string;
}

export interface AIUsageLog {
  id: string;
  userId?: string;
  endpoint: string;
  status: string;
  latencyMs?: number;
  error?: string;
  createdAt: string;
}

export interface WorkoutTemplate {
  id: string;
  title: string;
  description?: string;
  difficulty: ExperienceLevel;
  category: string;
  estimatedWeeklyBurn?: string;
  weeklySchedule: WorkoutDay[];
  isPublished: boolean;
  usageCount: number;
  createdAt?: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeKey: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  participantCount?: number;
  userJoined?: boolean;
  userProgress?: number;
}

export interface BodyMetric {
  id: string;
  userId: string;
  date: string;
  weightKg?: number;
  heightCm?: number;
  waistCm?: number;
  notes?: string;
}

export interface WaterLog {
  id: string;
  userId: string;
  date: string;
  amountMl: number;
}

export interface SleepLog {
  id: string;
  userId: string;
  date: string;
  hours: number;
  quality: string;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  mealName: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  isIndianFood?: boolean;
}

export interface ParqAssessment {
  id?: string;
  userId: string;
  hasHeartCondition: boolean;
  hasChestPain: boolean;
  hasDizziness: boolean;
  hasJointIssue: boolean;
  onBpMedication: boolean;
  otherMedicalReason: boolean;
  riskLevel: 'Low' | 'Moderate' | 'High';
  createdAt?: string;
}

export interface PublicStats {
  totalUsers: number;
  totalWorkouts: number;
  totalMinutes: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  newUsers7d: number;
  totalWorkouts: number;
  totalMinutes: number;
  avgCompletionRate: number;
  avgRating: number;
  openFeedback: number;
  aiCallsToday: number;
}
