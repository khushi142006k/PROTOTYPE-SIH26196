import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Flame, 
  Play, 
  Sparkles, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Bot,
  X
} from 'lucide-react';
import { WorkoutPlan, WorkoutDay, Language } from '../types';
import { getTranslation } from '../translations';

interface WorkoutPlanViewProps {
  plan: WorkoutPlan | null;
  language: Language;
  onStartWorkout: (dayIndex: number) => void;
  onOpenAssessment: () => void;
  onAdaptPlan: (feedback: string) => void;
}

export const WorkoutPlanView: React.FC<WorkoutPlanViewProps> = ({
  plan,
  language,
  onStartWorkout,
  onOpenAssessment,
  onAdaptPlan
}) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [adaptFeedback, setAdaptFeedback] = useState('');
  const [isAdapting, setIsAdapting] = useState(false);
  const [showAdaptModal, setShowAdaptModal] = useState(false);

  const handleAdaptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adaptFeedback.trim()) return;
    setIsAdapting(true);
    await onAdaptPlan(adaptFeedback);
    setIsAdapting(false);
    setShowAdaptModal(false);
    setAdaptFeedback('');
  };

  if (!plan) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Workout Plan</h2>
        <p className="text-xs text-slate-600">
          Take our quick 1-minute assessment so FitMate AI can generate your personalized weekly workout routine.
        </p>
        <button
          onClick={onOpenAssessment}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20"
        >
          {getTranslation(language, 'generateNewPlan')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Plan Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600" /> AI Generated Plan
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {plan.recommendedDays} Days / Week
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{plan.planTitle}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">{plan.summary}</p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAdaptModal(true)}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>{getTranslation(language, 'adaptPlan')}</span>
            </button>

            <button
              onClick={onOpenAssessment}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Plan</span>
            </button>
          </div>
        </div>

        {/* Plan Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">Weekly Days</span>
            <span className="text-sm font-bold text-blue-900 font-mono">{plan.recommendedDays} Days</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">Est. Weekly Burn</span>
            <span className="text-sm font-bold text-blue-900 font-mono">{plan.estimatedWeeklyBurn}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">AI Model</span>
            <span className="text-sm font-bold text-slate-800">Gemini 3.8 Flash</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">Status</span>
            <span className="text-sm font-bold text-green-600">{plan.status}</span>
          </div>
        </div>
      </div>

      {/* Schedule Days Accordion List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Weekly Schedule Breakdown ({plan.weeklySchedule?.length || 0} Sessions)</span>
        </h2>

        {plan.weeklySchedule?.map((day, dayIdx) => {
          const isExpanded = expandedDay === dayIdx;
          return (
            <div 
              key={dayIdx}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              {/* Accordion Bar */}
              <div 
                onClick={() => setExpandedDay(isExpanded ? null : dayIdx)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold font-mono text-sm">
                    D{day.dayNumber || dayIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">{day.dayName}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>Focus: {day.focus}</span>
                      <span>•</span>
                      <span>Target: {day.targetArea}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    {day.durationMinutes} mins • {day.estimatedCalories} kcal
                  </span>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartWorkout(dayIdx);
                    }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start</span>
                  </button>

                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Expanded Exercises Detail */}
              {isExpanded && (
                <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Exercises ({day.exercises.length}):
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {day.exercises.map((ex, exIdx) => (
                      <div key={exIdx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase">{ex.category || 'Exercise'}</span>
                            <h5 className="text-xs font-bold text-slate-900">{ex.name}</h5>
                          </div>
                          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {ex.sets} sets × {ex.reps}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-normal">{ex.instructions}</p>

                        {ex.safetyTip && (
                          <div className="text-[10px] text-amber-700 pt-1 border-t border-slate-100 font-medium">
                            <span className="font-bold">Safety:</span> {ex.safetyTip}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onStartWorkout(dayIdx)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Guided Workout Session</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* ADAPT PLAN MODAL */}
      {showAdaptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-blue-600">
                <Bot className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Adapt Workout Plan with AI</h3>
              </div>
              <button onClick={() => setShowAdaptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Tell FitMate AI what changes you need (e.g., "Exercises felt too hard", "I have knee stiffness", "Make sessions 20 minutes shorter").
            </p>

            <form onSubmit={handleAdaptSubmit} className="space-y-4">
              <textarea
                rows={4}
                placeholder="e.g., Please reduce pushup intensity and add more cardio intervals..."
                value={adaptFeedback}
                onChange={(e) => setAdaptFeedback(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                required
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdaptModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdapting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {isAdapting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adapting...</span>
                    </>
                  ) : (
                    <span>Apply AI Adaptation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
