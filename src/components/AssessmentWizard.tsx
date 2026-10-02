import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  X, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Target, 
  Home, 
  Building2, 
  Zap,
  Bot,
  AlertCircle
} from 'lucide-react';
import { UserProfile, GoalType, WorkoutPlan, Language } from '../types';
import { SupabaseService, supabase } from '../services/supabaseClient';

interface AssessmentWizardProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (plan: WorkoutPlan, updatedProfile: UserProfile) => void;
  language: Language;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  user,
  isOpen,
  onClose,
  onPlanGenerated,
  language
}) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assessment form state
  const [experience, setExperience] = useState<UserProfile['experience']>(user.experience || 'Beginner');
  const [location, setLocation] = useState<UserProfile['location']>(user.location || 'Home');
  const [availableDays, setAvailableDays] = useState<number>(user.availableDays || 4);
  const [durationMinutes, setDurationMinutes] = useState<number>(user.durationMinutes || 30);
  const [selectedGoal, setSelectedGoal] = useState<GoalType>('General Fitness');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    user.equipment?.length ? user.equipment : ['None (Bodyweight)']
  );

  if (!isOpen) return null;

  const equipmentOptions = [
    'None (Bodyweight)',
    'Dumbbells',
    'Resistance Bands',
    'Kettlebells',
    'Yoga Mat',
    'Pull-up Bar',
    'Gym Machines'
  ];

  const goalsList: GoalType[] = [
    'General Fitness',
    'Improve Stamina',
    'Build Strength',
    'Improve Flexibility',
    'Increase Physical Activity',
    'Maintain Fitness',
    'Improve Consistency'
  ];

  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      if (selectedEquipment.length === 1) return;
      setSelectedEquipment(selectedEquipment.filter(e => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleFinishAssessment = async () => {
    setLoading(true);
    setError(null);

    const updatedProfile: UserProfile = {
      ...user,
      experience,
      location,
      availableDays,
      durationMinutes,
      equipment: selectedEquipment,
      onboardingCompleted: true
    };

    try {
      // 1. Save Fitness Assessment to Supabase
      await SupabaseService.saveAssessment({
        userId: user.id,
        ageGroup: user.ageGroup || '25-34',
        activityLevel: user.activityLevel || 'Lightly Active',
        experience,
        location,
        availableDays,
        durationMinutes,
        preferredTime: user.preferredTime || 'Morning (7:00 AM)',
        equipment: selectedEquipment,
        preferredActivities: [selectedGoal]
      });

      // 2. Update Profile in Supabase
      await SupabaseService.upsertProfile(updatedProfile);

      // 3. Get Auth Token for backend API call
      const session = (await supabase.auth.getSession()).data.session;
      const token = session?.access_token;

      // 4. Generate AI Workout Plan via Backend
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          goals: [selectedGoal],
          availableDays,
          duration: durationMinutes,
          equipment: selectedEquipment,
          location,
          experience
        }),
      });

      const data = await response.json();

      if (data.success && data.plan) {
        setLoading(false);
        onPlanGenerated(data.plan, updatedProfile);
        onClose();
      } else {
        throw new Error(data.error || 'AI plan generation request failed.');
      }
    } catch (err: any) {
      console.error('Assessment generation error:', err);
      setLoading(false);
      setError(err.message || 'Failed to connect to AI server. Please retry.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-xl relative">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Fitness Assessment</h3>
              <p className="text-xs text-slate-500">Step {step} of 3 — Tailor your AI Fitness Companion</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Experience & Location */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" /> What is your fitness experience level?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperience(lvl)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        experience === lvl
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{lvl}</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        {lvl === 'Beginner' ? 'New or restarting' : lvl === 'Intermediate' ? 'Regular exercise' : 'High conditioning'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-600" /> Where do you prefer to exercise?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Home', label: 'Home', icon: Home, desc: 'Bodyweight & bands' },
                    { id: 'Gym', label: 'Gym', icon: Building2, desc: 'Full equipment' },
                    { id: 'Outdoor', label: 'Outdoor', icon: Dumbbell, desc: 'Parks & tracks' }
                  ].map((loc) => {
                    const Icon = loc.icon;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => setLocation(loc.id as any)}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          location === loc.id
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-blue-600 mb-1" />
                        <div className="text-xs">{loc.label}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">{loc.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Equipment & Goal */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-blue-600" /> Available Equipment (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {equipmentOptions.map((eq) => {
                    const isSelected = selectedEquipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => toggleEquipment(eq)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-blue-600" />}
                        {eq}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" /> Primary Fitness Goal
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {goalsList.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGoal(g)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        selectedGoal === g
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Schedule & Duration */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" /> Available Days per Week
                  </span>
                  <span className="text-blue-600 font-bold">{availableDays} days/week</span>
                </label>
                <div className="flex items-center gap-3">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setAvailableDays(num)}
                      className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all ${
                        availableDays === num
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {num} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" /> Preferred Session Duration
                  </span>
                  <span className="text-blue-600 font-bold">{durationMinutes} minutes</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        durationMinutes === mins
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-3">
                <Bot className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950">AI Personalization Ready</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Clicking "Generate AI Plan" will invoke FitMate AI to structure exercises, rep targets, rest periods, and safety tips for your goal ({selectedGoal}). Saved directly to your Supabase account.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm shadow-blue-600/20"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishAssessment}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>AI Engine Generating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Workout Plan</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
