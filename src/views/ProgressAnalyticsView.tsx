import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Calendar, 
  Bot, 
  CheckCircle2, 
  BarChart2, 
  Clock 
} from 'lucide-react';
import { 
  WorkoutSessionLog, 
  ActivityLog, 
  Goal, 
  AIProgressAnalysis, 
  Language 
} from '../types';
import { StorageService } from '../services/storage';

interface ProgressAnalyticsViewProps {
  logs: WorkoutSessionLog[];
  activityLogs: ActivityLog[];
  goals: Goal[];
  aiAnalysis: AIProgressAnalysis | null;
  onAnalysisUpdated: (analysis: AIProgressAnalysis) => void;
  language: Language;
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  logs,
  activityLogs,
  goals,
  aiAnalysis,
  onAnalysisUpdated,
  language
}) => {
  const [loadingAI, setLoadingAI] = useState(false);

  // Calculate totals
  const totalWorkouts = logs.length;
  const totalMinutes = logs.reduce((acc, l) => acc + l.durationMinutes, 0) + 
                       activityLogs.reduce((acc, a) => acc + a.durationMinutes, 0);
  const totalCalories = logs.reduce((acc, l) => acc + l.caloriesBurned, 0) + 
                        activityLogs.reduce((acc, a) => acc + (a.caloriesEstimated || 0), 0);

  // Weekly data array for last 7 days
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const isoDate = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    const workoutsOnDay = logs.filter(l => l.completedAt.startsWith(isoDate)).length;
    const activitiesOnDay = activityLogs.filter(a => a.date === isoDate).length;

    return {
      date: isoDate,
      dayLabel,
      totalCount: workoutsOnDay + activitiesOnDay
    };
  });

  const maxDaily = Math.max(1, Math.max(...last7Days.map(d => d.totalCount)));

  const handleRunAIAnalysis = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch('/api/ai/analyze-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutHistory: logs,
          activityLogs,
          goals,
          streak: StorageService.calculateStreak()
        })
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        StorageService.saveAIAnalysis(data.analysis);
        onAnalysisUpdated(data.analysis);
      }
    } catch (e) {
      console.error('Error generating progress analysis:', e);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span>Progress & Fitness Analytics</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track your workout consistency, total active minutes, and receive AI progress evaluations.
          </p>
        </div>

        <button
          onClick={handleRunAIAnalysis}
          disabled={loadingAI}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
        >
          {loadingAI ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Progress...</span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" />
              <span>Run AI Progress Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Workouts Completed</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{totalWorkouts} Sessions</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Active Minutes</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{totalMinutes} Mins</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Est. Energy Burned</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{totalCalories} kcal</span>
          </div>
        </div>
      </div>

      {/* WEEKLY ACTIVITY GRAPH */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">7-Day Physical Activity Breakdown</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Workouts + Logged Activities</span>
        </div>

        {/* SVG Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="flex items-end justify-between gap-3 h-40 px-2">
            {last7Days.map((d, i) => {
              const heightPct = Math.round((d.totalCount / maxDaily) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-blue-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.totalCount}
                  </span>
                  
                  <div className="w-full bg-slate-50 rounded-t-xl h-full flex items-end p-1 border border-slate-200">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        d.totalCount > 0 
                          ? 'bg-blue-600 shadow-sm shadow-blue-600/20' 
                          : 'bg-slate-200/60'
                      }`}
                      style={{ height: d.totalCount > 0 ? `${Math.max(15, heightPct)}%` : '6%' }}
                    />
                  </div>

                  <span className="text-[11px] font-bold text-slate-600 font-mono">{d.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI PROGRESS EVALUATION REPORT */}
      {aiAnalysis && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Bot className="w-5 h-5" />
              <h3 className="text-sm font-bold text-blue-950">AI Progress Evaluation & Recommendations</h3>
            </div>
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Consistency Score: {aiAnalysis.consistencyScore}%
            </span>
          </div>

          <div>
            <h4 className="text-base font-extrabold text-blue-950">"{aiAnalysis.headline}"</h4>
            <p className="text-xs text-slate-700 mt-1">{aiAnalysis.encouragement}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Key Observations */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Key Performance Observations:</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {aiAnalysis.keyObservations.map((obs, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Adaptive Recommendations */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 space-y-2 shadow-xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Adaptive Next Steps:</span>
              <div className="space-y-2">
                {aiAnalysis.adaptiveRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block">{rec.title}</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">{rec.description}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED WORKOUT LOGS HISTORY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Full Workout History Logs ({logs.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Session Name</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Exercises</th>
                <th className="p-3">Est. Burn</th>
                <th className="p-3">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{new Date(log.completedAt).toLocaleDateString()}</td>
                  <td className="p-3 font-bold text-slate-900">{log.dayName}</td>
                  <td className="p-3 font-mono">{log.durationMinutes} mins</td>
                  <td className="p-3">{log.exercisesCompleted} / {log.totalExercises}</td>
                  <td className="p-3 text-blue-600 font-bold">{log.caloriesBurned} kcal</td>
                  <td className="p-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium text-[10px]">
                      {log.difficultyFeedback || 'Completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
