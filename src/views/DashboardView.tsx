import React from 'react';
import { 
  Flame, 
  Play, 
  Activity, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  Target, 
  Calendar, 
  Bot,
  MessageSquare,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import { 
  UserProfile, 
  WorkoutPlan, 
  Goal, 
  WorkoutSessionLog, 
  ActivityLog, 
  AIProgressAnalysis, 
  Language 
} from '../types';
import { getTranslation } from '../translations';

interface DashboardViewProps {
  user: UserProfile;
  plan: WorkoutPlan | null;
  goals: Goal[];
  logs: WorkoutSessionLog[];
  activityLogs: ActivityLog[];
  aiAnalysis: AIProgressAnalysis | null;
  streak: number;
  language: Language;
  onStartWorkout: (dayIndex: number) => void;
  onOpenActivityLogger: () => void;
  onOpenGoalModal: () => void;
  onOpenFeedbackModal: () => void;
  onNavigateToTab: (tab: string) => void;
  onUpdateGoalProgress: (goalId: string, newProgress: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  plan,
  goals,
  logs,
  activityLogs,
  aiAnalysis,
  streak,
  language,
  onStartWorkout,
  onOpenActivityLogger,
  onOpenGoalModal,
  onOpenFeedbackModal,
  onNavigateToTab,
  onUpdateGoalProgress
}) => {
  // Determine today's workout day
  const todayDayIndex = 0;
  const todayWorkout = plan?.weeklySchedule?.[todayDayIndex];

  // Calculate weekly consistency %
  const targetDays = plan?.recommendedDays || user.availableDays || 4;
  const completedThisWeek = logs.filter(l => {
    const logDate = new Date(l.completedAt);
    const now = new Date();
    const diffDays = (now.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
    return diffDays <= 7;
  }).length;

  const consistencyPct = Math.min(100, Math.round((completedThisWeek / Math.max(1, targetDays)) * 100));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* HERO GREETING CARD - Clean Blue & Light Highlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-950 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600/30 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-blue-400/30 flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" /> AI Adaptive Fitness Active
              </span>
              <span className="text-xs text-blue-200 hidden sm:inline">• {user.experience} Level</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed font-normal">
              {plan?.summary || 'Your AI Fitness Companion is active and optimizing your daily workout routine.'}
            </p>
          </div>

          {/* Quick Streak & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 border border-white/20 p-3 px-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-400/30 font-bold">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-lg font-black text-white">{streak} {getTranslation(language, 'days')}</div>
                <div className="text-[10px] text-blue-100 font-medium">Current Streak</div>
              </div>
            </div>

            <button
              onClick={onOpenActivityLogger}
              className="px-4 py-3 bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
            >
              <Activity className="w-4 h-4 text-blue-600" />
              <span>{getTranslation(language, 'logActivity')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* DASHBOARD MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TODAY'S WORKOUT CARD */}
          {todayWorkout ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Scheduled for Today</span>
                    <h3 className="text-base font-bold text-slate-900">{todayWorkout.dayName}</h3>
                  </div>
                </div>

                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200">
                  {todayWorkout.durationMinutes} {getTranslation(language, 'minutes')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Focus Area</span>
                  <span className="text-xs font-bold text-slate-800">{todayWorkout.focus}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Target Muscles</span>
                  <span className="text-xs font-bold text-slate-800">{todayWorkout.targetArea}</span>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-medium block">Estimated Burn</span>
                  <span className="text-xs font-bold text-blue-900">{todayWorkout.estimatedCalories} kcal</span>
                </div>
              </div>

              {/* Exercises Summary Preview */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-600 block">Exercises Included ({todayWorkout.exercises.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {todayWorkout.exercises.map((ex, idx) => (
                    <span 
                      key={idx}
                      className="bg-slate-50 text-slate-700 text-xs px-3 py-1 rounded-lg border border-slate-200 font-medium"
                    >
                      {ex.name} • <span className="text-blue-600 font-semibold">{ex.reps}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Workout Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => onNavigateToTab('workoutPlan')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  View Full Schedule →
                </button>

                <button
                  onClick={() => onStartWorkout(todayDayIndex)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{getTranslation(language, 'startWorkout')}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3 shadow-sm">
              <Zap className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Active Plan Found</h3>
              <p className="text-xs text-slate-600">Complete a 1-minute fitness assessment to generate a personalized AI plan.</p>
              <button
                onClick={() => onNavigateToTab('workoutPlan')}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
              >
                Generate Plan
              </button>
            </div>
          )}

          {/* AI PROGRESS INSIGHT CARD - Light Blue Highlight */}
          {aiAnalysis && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    {getTranslation(language, 'aiInsights')}
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200 font-semibold">
                  AI Evaluation Active
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-blue-950 leading-snug">
                  "{aiAnalysis.headline}"
                </h4>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {aiAnalysis.encouragement}
                </p>
              </div>

              {/* Key Observations */}
              <div className="space-y-1.5 pt-1">
                {aiAnalysis.keyObservations.slice(0, 2).map((obs, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>

              {/* Adaptive Recommendation Card */}
              {aiAnalysis.adaptiveRecommendations?.[0] && (
                <div className="bg-white p-3.5 rounded-xl border border-blue-200 text-xs space-y-1 shadow-xs">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                    Adaptive Recommendation:
                  </span>
                  <p className="font-bold text-slate-900">
                    {aiAnalysis.adaptiveRecommendations[0].title}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {aiAnalysis.adaptiveRecommendations[0].description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE GOALS TRACKER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{getTranslation(language, 'goalsProgress')}</h3>
              </div>
              <button
                onClick={onOpenGoalModal}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </button>
            </div>

            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No active goals. Click 'Add Goal' to set target workouts or reps.</p>
              ) : (
                goals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentProgress / g.target) * 100));
                  return (
                    <div key={g.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{g.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-mono font-bold">
                            {g.currentProgress} / {g.target} {g.unit}
                          </span>
                          <button
                            onClick={() => onUpdateGoalProgress(g.id, g.currentProgress + 1)}
                            className="p-1 bg-white hover:bg-slate-100 text-blue-600 rounded-md border border-slate-200 shadow-xs"
                            title="Increment progress"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3 width) - STATS & QUICK LOGS */}
        <div className="space-y-6">
          
          {/* WEEKLY CONSISTENCY METER */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {getTranslation(language, 'weeklyConsistency')}
            </h3>

            {/* Consistency Gauge */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 transition-all duration-500"
                  strokeDasharray={`${consistencyPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 font-mono">{consistencyPct}%</span>
                <span className="text-[10px] text-slate-500 font-medium">{completedThisWeek} / {targetDays} Workouts</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-normal">
              {consistencyPct >= 75
                ? '🔥 Great consistency! Your habit building is on track.'
                : '💪 Keep going! Complete 1 more workout this week.'}
            </p>
          </div>

          {/* RECENT WORKOUT LOGS LIST */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
              <button
                onClick={() => onNavigateToTab('progress')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {logs.length === 0 && activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No completed workouts yet.</p>
              ) : (
                <>
                  {logs.slice(0, 3).map((log) => (
                    <div key={log.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{log.dayName}</div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(log.completedAt).toLocaleDateString()} • {log.durationMinutes} mins
                        </div>
                      </div>
                      <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 text-[10px]">
                        +{log.caloriesBurned} kcal
                      </span>
                    </div>
                  ))}

                  {activityLogs.slice(0, 2).map((act) => (
                    <div key={act.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{act.activityType}</div>
                        <div className="text-[10px] text-slate-500">
                          {act.date} • {act.durationMinutes} mins {act.distanceKm ? `• ${act.distanceKm} km` : ''}
                        </div>
                      </div>
                      <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200 text-[10px]">
                        +{act.caloriesEstimated} kcal
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* FEEDBACK & ASSISTANT PROMPT */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-700">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-blue-950">Have Feedback or Questions?</h4>
            </div>
            <p className="text-xs text-slate-600">
              Need exercise substitutions or workout schedule changes? Chat with the AI Fitness Coach or submit feedback.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateToTab('aiAssistant')}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl text-center shadow-xs"
              >
                Chat AI Coach
              </button>
              <button
                onClick={onOpenFeedbackModal}
                className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs"
              >
                Feedback
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
