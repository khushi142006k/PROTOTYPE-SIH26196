import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  SkipForward, 
  X, 
  Clock, 
  Flame, 
  Dumbbell, 
  Sparkles
} from 'lucide-react';
import { WorkoutDay, WorkoutExercise, WorkoutSessionLog, Language } from '../types';
import { StorageService } from '../services/storage';

interface WorkoutRunnerModalProps {
  workoutDay: WorkoutDay;
  isOpen: boolean;
  onClose: () => void;
  onWorkoutCompleted: (log: WorkoutSessionLog) => void;
  language: Language;
}

export const WorkoutRunnerModal: React.FC<WorkoutRunnerModalProps> = ({
  workoutDay,
  isOpen,
  onClose,
  onWorkoutCompleted,
  language
}) => {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(30);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [completedExercisesCount, setCompletedExercisesCount] = useState(0);
  
  // Post workout feedback state
  const [isFinished, setIsFinished] = useState(false);
  const [difficultyRating, setDifficultyRating] = useState<'Too Easy' | 'Just Right' | 'Too Hard'>('Just Right');
  const [userNotes, setUserNotes] = useState('');
  const [startTime] = useState<number>(Date.now());

  const currentEx: WorkoutExercise | undefined = workoutDay.exercises[currentExerciseIdx];
  const totalExercises = workoutDay.exercises.length;

  const playChimeSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio context fallback
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isResting && !isTimerPaused && restSecondsLeft > 0) {
      interval = setInterval(() => {
        setRestSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isResting && restSecondsLeft === 0) {
      setIsResting(false);
      playChimeSound();
    }
    return () => clearInterval(interval);
  }, [isResting, isTimerPaused, restSecondsLeft]);

  if (!isOpen) return null;

  const handleCompleteSet = () => {
    playChimeSound();
    if (!currentEx) return;

    if (currentSet < currentEx.sets) {
      setCurrentSet(currentSet + 1);
      setRestSecondsLeft(currentEx.restSeconds || 30);
      setIsResting(true);
    } else {
      setCompletedExercisesCount(prev => prev + 1);
      if (currentExerciseIdx + 1 < totalExercises) {
        setCurrentExerciseIdx(currentExerciseIdx + 1);
        setCurrentSet(1);
        setRestSecondsLeft(currentEx.restSeconds || 45);
        setIsResting(true);
      } else {
        setIsFinished(true);
      }
    }
  };

  const handleSkipExercise = () => {
    if (currentExerciseIdx + 1 < totalExercises) {
      setCurrentExerciseIdx(currentExerciseIdx + 1);
      setCurrentSet(1);
      setIsResting(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleFinalSubmitLog = () => {
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const newLog = StorageService.addWorkoutLog({
      userId: StorageService.getUserProfile().id,
      planId: StorageService.getActivePlan()?.id || 'active',
      dayName: workoutDay.dayName,
      durationMinutes: elapsedMinutes,
      caloriesBurned: Math.round((workoutDay.estimatedCalories || 180) * (completedExercisesCount / totalExercises)),
      completedAt: new Date().toISOString(),
      exercisesCompleted: completedExercisesCount,
      totalExercises,
      difficultyFeedback: difficultyRating,
      notes: userNotes
    });

    onWorkoutCompleted(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl relative">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Dumbbell className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{workoutDay.dayName}</h3>
              <p className="text-xs text-slate-500">Target Area: {workoutDay.targetArea}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WORKOUT IN PROGRESS VIEW */}
        {!isFinished && currentEx && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Exercise Progress Header */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-medium">
              <span className="text-slate-500">Exercise {currentExerciseIdx + 1} of {totalExercises}</span>
              <div className="flex items-center gap-1.5 font-bold text-blue-600">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Set {currentSet} of {currentEx.sets}</span>
              </div>
              <span className="text-slate-900 font-bold">{currentEx.reps}</span>
            </div>

            {/* REST TIMER MODE */}
            {isResting ? (
              <div className="bg-blue-50/60 p-8 rounded-2xl border border-blue-200 text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full border border-blue-200 font-bold">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Rest Interval</span>
                </div>
                <div className="text-6xl font-black font-mono text-blue-900 tracking-wider">
                  {restSecondsLeft}s
                </div>
                <p className="text-xs text-slate-600">Catch your breath & prepare for Set {currentSet}</p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                  >
                    {isTimerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    <span>{isTimerPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                  <button
                    onClick={() => setIsResting(false)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Skip Rest
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE EXERCISE VIEW */
              <div className="space-y-4">
                
                {/* Visual Exercise Graphics */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center mb-3 text-blue-600 shadow-sm animate-bounce">
                    <Dumbbell className="w-8 h-8 -rotate-12" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900">{currentEx.name}</h2>
                  <p className="text-xs text-blue-600 font-semibold mt-1">Target: {currentEx.targetMuscles}</p>
                </div>

                {/* Form Instructions & Safety Guidance */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>How to Perform:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{currentEx.instructions}</p>
                  
                  {currentEx.safetyTip && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-amber-800 flex items-start gap-2 font-medium">
                      <span className="font-bold shrink-0">Safety Tip:</span>
                      <span>{currentEx.safetyTip}</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleSkipExercise}
                className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors font-medium"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip Exercise</span>
              </button>

              <button
                onClick={handleCompleteSet}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Set {currentSet}</span>
              </button>
            </div>

          </div>
        )}

        {/* WORKOUT COMPLETED / FEEDBACK SCREEN */}
        {isFinished && (
          <div className="p-6 text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-50 border-2 border-green-500 flex items-center justify-center text-green-600 shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">Workout Complete!</h2>
              <p className="text-xs text-slate-600 mt-1">
                Awesome effort! You logged {completedExercisesCount} of {totalExercises} exercises in this session.
              </p>
            </div>

            {/* Rating difficulty */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left space-y-3">
              <label className="text-xs font-bold text-slate-900 block">
                How did the workout difficulty feel?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Too Easy', 'Just Right', 'Too Hard'] as const).map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setDifficultyRating(rating)}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      difficultyRating === rating
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Optional Notes / Feedback for AI Adaptation
                </label>
                <input
                  type="text"
                  placeholder="e.g., Felt great energy on squats, pushups felt tough"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              onClick={handleFinalSubmitLog}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
            >
              Save Workout Log & Update Streak
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
