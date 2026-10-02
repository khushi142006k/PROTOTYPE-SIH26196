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
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  ChevronRight
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
    <div className="space-y-6 pb-12 animate-fadeIn">
      
      {/* HERO GREETING CARD - Deep Navy & Royal Blue Executive Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl border border-blue-800/60">
        
        {/* Background Decorative Glow Elements */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-60 h-60 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-500/20 text-blue-200 text-xs font-extrabold px-3 py-1 rounded-full border border-blue-400/40 flex items-center gap-1.5 backdrop-blur-md shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" /> Adaptive AI Engine Active
              </span>
              <span className="bg-white/10 text-slate-100 text-xs font-semibold px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
                {user.experience} • {user.location} Workouts
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-heading drop-shadow-md">
              Welcome back, <span className="bg-gradient-to-r from-sky-200 via-white to-blue-200 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>! 👋
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed font-normal">
              {plan?.summary || 'Your AI Fitness Companion is active and optimizing your daily workout routine based on your goals.'}
            </p>
          </div>

          {/* Quick Streak & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/60 border border-blue-500/30 p-3.5 px-5 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-lg">
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-400/40 font-bold shadow-xs">
                <Flame className="w-6 h-6 text-orange-400 fill-orange-400/30 animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-black text-white font-mono">{streak} {getTranslation(language, 'days')}</div>
                <div className="text-[11px] text-blue-200 font-semibold">Workout Streak</div>
              </div>
            </div>

            <button
              onClick={onOpenActivityLogger}
              className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 border border-blue-400/40 cursor-pointer"
            >
              <Activity className="w-4 h-4 text-cyan-200" />
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
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block">Scheduled Today</span>
                    <h3 className="text-lg font-bold text-slate-900 font-heading">{todayWorkout.dayName}</h3>
                  </div>
                </div>

                <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3.5 py-1.5 rounded-full border border-slate-200">
                  {todayWorkout.durationMinutes} {getTranslation(language, 'minutes')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Focus Area</span>
                  <span className="text-xs font-bold text-slate-800">{todayWorkout.focus}</span>
                </div>
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium block">Target Muscles</span>
                  <span className="text-xs font-bold text-slate-800">{todayWorkout.targetArea}</span>
                </div>
                <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-100">
                  <span className="text-[10px] text-blue-600 font-bold block">Estimated Burn</span>
                  <span className="text-xs font-extrabold text-blue-900">{todayWorkout.estimatedCalories} kcal</span>
                </div>
              </div>

              {/* Exercises Summary Preview */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-600 block">Exercises Included ({todayWorkout.exercises.length}):</span>
                <div className="flex flex-wrap gap-2">
                  {todayWorkout.exercises.map((ex, idx) => (
                    <span 
                      key={idx}
                      className="bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded-xl border border-slate-200 font-medium hover:border-slate-300 transition-colors"
                    >
                      {ex.name} • <span className="text-blue-600 font-bold">{ex.reps}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Start Workout Action */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => onNavigateToTab('workoutPlan')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
                >
                  <span>View Full Schedule</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onStartWorkout(todayDayIndex)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl flex items-center gap-2.5 shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{getTranslation(language, 'startWorkout')}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <Zap className="w-10 h-10 text-blue-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900 font-heading">No Active Workout Plan</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">Complete a quick 1-minute fitness assessment to generate a personalized AI workout plan tailored to your available equipment and goals.</p>
              <button
                onClick={() => onNavigateToTab('workoutPlan')}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 shadow-md"
              >
                Generate Plan Now
              </button>
            </div>
          )}

          {/* AI PROGRESS INSIGHT CARD */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-200/80 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold text-blue-950 uppercase tracking-widest">
                    {getTranslation(language, 'aiInsights')}
                  </span>
                </div>
                <span className="text-[10px] text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200 font-bold shadow-2xs">
                  Active Analysis
                </span>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-extrabold text-blue-950 leading-snug font-heading">
                  "{aiAnalysis.headline}"
                </h4>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                  {aiAnalysis.encouragement}
                </p>
              </div>

              {/* Key Observations */}
              <div className="space-y-2 pt-1">
                {aiAnalysis.keyObservations.slice(0, 2).map((obs, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-800 bg-white/70 p-2.5 rounded-xl border border-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{obs}</span>
                  </div>
                ))}
              </div>

              {/* Adaptive Recommendation Card */}
              {aiAnalysis.adaptiveRecommendations?.[0] && (
                <div className="bg-white p-4 rounded-2xl border border-blue-200 text-xs space-y-1.5 shadow-xs">
                  <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-wider block">
                    AI Adaptive Recommendation:
                  </span>
                  <p className="font-extrabold text-slate-900 text-sm">
                    {aiAnalysis.adaptiveRecommendations[0].title}
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {aiAnalysis.adaptiveRecommendations[0].description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE GOALS TRACKER */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 font-heading">{getTranslation(language, 'goalsProgress')}</h3>
              </div>
              <button
                onClick={onOpenGoalModal}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Goal
              </button>
            </div>

            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No active goals set. Click 'Add Goal' to set your target workouts or reps.</p>
              ) : (
                goals.map((g) => {
                  const pct = Math.min(100, Math.round((g.currentProgress / g.target) * 100));
                  return (
                    <div key={g.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 hover:border-blue-200 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-slate-900">{g.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-mono font-bold">
                            {g.currentProgress} / {g.target} {g.unit}
                          </span>
                          <button
                            onClick={() => onUpdateGoalProgress(g.id, g.currentProgress + 1)}
                            className="p-1 bg-white hover:bg-slate-100 text-blue-600 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                            title="Increment progress"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
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
          
          {/* WEEKLY CONSISTENCY GAUGE */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 text-center">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
              {getTranslation(language, 'weeklyConsistency')}
            </h3>

            {/* Consistency Ring */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600 transition-all duration-700 ease-out"
                  strokeDasharray={`${consistencyPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{consistencyPct}%</span>
                <span className="text-[11px] text-slate-500 font-bold mt-0.5">{completedThisWeek} / {targetDays} Workouts</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {consistencyPct >= 75
                ? '🔥 Outstanding consistency! You are locked in this week.'
                : '💪 Complete 1 more workout session to maintain your target streak.'}
            </p>
          </div>

          {/* RECENT WORKOUT LOGS */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Recent Sessions</h3>
              <button
                onClick={() => onNavigateToTab('progress')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {logs.length === 0 && activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No completed workouts logged yet.</p>
              ) : (
                <>
                  {logs.slice(0, 3).map((log) => (
                    <div key={log.id} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-blue-200 transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">{log.dayName}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(log.completedAt).toLocaleDateString()} • {log.durationMinutes} mins
                        </div>
                      </div>
                      <span className="text-blue-700 font-extrabold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 text-[10px]">
                        +{log.caloriesBurned} kcal
                      </span>
                    </div>
                  ))}

                  {activityLogs.slice(0, 2).map((act) => (
                    <div key={act.id} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs hover:border-emerald-200 transition-colors">
                      <div>
                        <div className="font-bold text-slate-900">{act.activityType}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {act.date} • {act.durationMinutes} mins {act.distanceKm ? `• ${act.distanceKm} km` : ''}
                        </div>
                      </div>
                      <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px]">
                        +{act.caloriesEstimated} kcal
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* AI COACH ASSISTANT BANNER */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-200 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Have Fitness Questions?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Need exercise substitutions or workout schedule adjustments? Ask your AI Fitness Assistant.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateToTab('aiAssistant')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl text-center shadow-md shadow-blue-600/20 transition-all"
              >
                Chat AI Coach
              </button>
              <button
                onClick={onOpenFeedbackModal}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-colors"
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
