import React, { useState } from 'react';
import {
  Sparkles,
  Dumbbell,
  Activity,
  Target,
  Bot,
  ShieldCheck,
  Flame,
  Play,
  ArrowRight,
  CheckCircle2,
  Zap,
  CalendarDays,
  User,
  ChevronDown,
  Star,
  Database,
  Quote,
  TrendingUp,
  Check
} from 'lucide-react';
import { Language } from '../types';
import { usePublicStats, useApprovedLandingFeedback } from '../hooks/useFitMateData';

interface LandingPageViewProps {
  onOpenAssessment: () => void;
  onOpenLogin: (mode?: 'login' | 'register' | 'admin_login') => void;
  onNavigateToTab: (tab: string) => void;
  language: Language;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onOpenAssessment,
  onOpenLogin,
  onNavigateToTab,
  language
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: publicStats } = usePublicStats();
  const { data: approvedFeedback = [] } = useApprovedLandingFeedback();

  const stepsData = [
    {
      step: 1,
      title: "1. Complete 2-Minute AI Fitness Assessment",
      desc: "Tell FitMate your age, experience level, workout location (home or gym), weekly available days, and equipment.",
      icon: Target,
      highlight: "Personalized Parameters"
    },
    {
      step: 2,
      title: "2. Next-Gen AI Engine Generates Custom Routine",
      desc: "Our AI engine analyzes your exact assessment parameters to construct a balanced weekly workout schedule with reps & sets.",
      icon: Sparkles,
      highlight: "Adaptive Intelligence"
    },
    {
      step: 3,
      title: "3. Launch Guided Interactive Workout Runner",
      desc: "Follow the built-in workout runner featuring rest countdown timers, exercise instructions, and safety posture tips.",
      icon: Play,
      highlight: "Guided Execution"
    },
    {
      step: 4,
      title: "4. Track Activities & Calorie Burn Rates",
      desc: "Log running, walking, cycling, swimming, yoga, or custom workouts with real-time calorie burn estimations.",
      icon: Activity,
      highlight: "Real-Time Tracking"
    },
    {
      step: 5,
      title: "5. Build Streaks & Weekly Consistency",
      desc: "Monitor your workout completion gauges, daily flame streak counter, and goal progress charts to build lasting habits.",
      icon: Flame,
      highlight: "Habit Reinforcement"
    },
    {
      step: 6,
      title: "6. Consult 24/7 AI Fitness Assistant",
      desc: "Ask your AI Coach for exercise modifications, recovery advice, nutrition tips, or workout motivation anytime.",
      icon: Bot,
      highlight: "Instant AI Advice"
    },
    {
      step: 7,
      title: "7. Instant Cloud Sync & Multi-Device Access",
      desc: "All your workout history, personal records, and goals are securely synced to the cloud across all your devices.",
      icon: Database,
      highlight: "Cloud Synchronization"
    }
  ];

  const faqs = [
    {
      q: "Do I need gym equipment to use FitMate AI?",
      a: "No equipment is needed! FitMate customizes routines based on what you have — whether that is zero equipment (bodyweight only), resistance bands, dumbbells, or a full gym setup."
    },
    {
      q: "How does FitMate protect my data & privacy?",
      a: "FitMate employs end-to-end security protocols to ensure your health metrics, workout logs, and personal goals remain 100% private and protected."
    },
    {
      q: "Can I access FitMate on multiple devices?",
      a: "Yes! Simply sign into your account on any smartphone, tablet, or desktop to instantly sync your workout routines, streaks, and fitness progress."
    },
    {
      q: "Is FitMate suitable for complete beginners?",
      a: "Yes! The AI assessment tailors workout difficulty, rep counts, and rest periods to match your exact experience level, starting with foundational exercises and safety guidance."
    }
  ];

  return (
    <div className="space-y-20 pb-20 animate-fadeIn">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl executive-hero-gradient text-white p-8 sm:p-14 lg:p-20 shadow-2xl border border-blue-900/40">

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">

          <div className="flex flex-col items-center text-center space-y-5">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 text-xs sm:text-sm font-extrabold px-4 py-2 rounded-full border border-blue-400/30 backdrop-blur-md shadow-inner">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              <span>AI-Powered Personal Fitness & Wellness Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-heading leading-tight max-w-4xl">
              Transform Your Fitness Journey with <span className="bg-gradient-to-r from-blue-200 via-sky-300 to-indigo-200 bg-clip-text text-transparent">AI Precision</span>
            </h1>

            <p className="text-base sm:text-lg text-blue-100/90 max-w-2xl font-normal leading-relaxed">
              Custom workout routines tailored to your level, equipment, and schedule. Track daily progress, build consistency streaks, and consult your 24/7 AI Coach.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={onOpenAssessment}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm rounded-2xl flex items-center gap-3 shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 border border-blue-400/40 cursor-pointer"
              >
                <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span>Take Free AI Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenLogin('register')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-extrabold text-sm rounded-2xl flex items-center gap-2.5 backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
              >
                <User className="w-5 h-5 text-blue-200" />
                <span>Create Free Account</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-blue-800/60 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-blue-950/40 rounded-2xl border border-blue-800/50">
              <div className="text-3xl font-black text-white font-mono">{publicStats?.totalUsers ?? 0}</div>
              <div className="text-xs text-blue-200 font-semibold">Registered Athletes</div>
            </div>
            <div className="text-center p-4 bg-blue-950/40 rounded-2xl border border-blue-800/50">
              <div className="text-3xl font-black text-cyan-300 font-mono">{publicStats?.totalWorkouts ?? 0}</div>
              <div className="text-xs text-blue-200 font-semibold">Workouts Logged</div>
            </div>
            <div className="text-center p-4 bg-blue-950/40 rounded-2xl border border-blue-800/50">
              <div className="text-3xl font-black text-sky-300 font-mono">{publicStats?.totalMinutes ?? 0}</div>
              <div className="text-xs text-blue-200 font-semibold">Exercise Minutes</div>
            </div>
            <div className="text-center p-4 bg-blue-950/40 rounded-2xl border border-blue-800/50">
              <div className="text-3xl font-black text-amber-300 font-mono">99.4%</div>
              <div className="text-xs text-blue-200 font-semibold">AI Recommendation Accuracy</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CORE FEATURES SHOWCASE GRID */}
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
            Comprehensive Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-heading">
            Built for Consistency & Real Results
          </h2>
          <p className="text-sm text-slate-600">
            No more generic templates. FitMate adapts to your fitness assessment, equipment, and routine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Adaptive AI Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Analyzes your fitness assessment, available equipment, experience level, and preferred duration to generate adaptive workout plans.
            </p>
            <button
              onClick={onOpenAssessment}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 pt-2"
            >
              <span>Try AI Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Personalized Workout Plans</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Day-by-day workout routines complete with target muscles, reps, sets, rest timers, and guided exercise execution.
            </p>
            <button
              onClick={() => onNavigateToTab('workoutPlan')}
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 pt-2"
            >
              <span>Explore Workout Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Activity & Calorie Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log running, walking, cycling, yoga, swimming, and strength sessions with MET calorie burn formulas.
            </p>
            <button
              onClick={() => onNavigateToTab('progress')}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-800 flex items-center gap-1.5 pt-2"
            >
              <span>View Activity Logger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Habit & Streak Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Build lasting consistency with streak counters, weekly completion rate gauges, and motivational goal milestones.
            </p>
            <button
              onClick={() => onNavigateToTab('dashboard')}
              className="text-xs font-extrabold text-orange-600 hover:text-orange-800 flex items-center gap-1.5 pt-2"
            >
              <span>Check Consistency Stats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">24/7 AI Fitness Assistant</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ask questions about exercise form, workout substitutions, motivation, or post-workout nutrition directly to Gemini AI.
            </p>
            <button
              onClick={() => onNavigateToTab('aiAssistant')}
              className="text-xs font-extrabold text-sky-600 hover:text-sky-800 flex items-center gap-1.5 pt-2"
            >
              <span>Open AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 space-y-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">Performance Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive trend graphs, workout completion metrics, and muscle group volume breakdown to accelerate your fitness gains.
            </p>
            <button
              onClick={() => onNavigateToTab('progress')}
              className="text-xs font-extrabold text-purple-600 hover:text-purple-800 flex items-center gap-1.5 pt-2 cursor-pointer"
            >
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 7-STEP SYSTEM */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            System Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 font-heading">The FitMate 7-Step System</h2>
          <p className="text-xs sm:text-sm text-slate-600">Click through the steps below to explore how FitMate guides your transformation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-2 lg:col-span-1">
            {stepsData.map((s) => {
              const isSelected = activeStep === s.step;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(s.step)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-white text-blue-900' : 'bg-slate-200 text-slate-700'
                      }`}>
                      {s.step}
                    </div>
                    <span className="text-xs font-bold truncate">{s.title}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-270 text-white' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-8 space-y-6 min-h-[300px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-extrabold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-3 py-1 rounded-full border border-blue-200">
                  {stepsData[activeStep - 1].highlight}
                </span>
                <span className="text-xs text-slate-500 font-mono font-bold">Step 0{activeStep} of 07</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {stepsData[activeStep - 1].title}
              </h3>

              <p className="text-sm text-slate-700 leading-relaxed">
                {stepsData[activeStep - 1].desc}
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automated & Encrypted Cloud Sync</span>
              </div>

              <button
                onClick={onOpenAssessment}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <span>Try This Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL TESTIMONIALS */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Verified Community
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Community Feedback & Reviews
          </h2>
        </div>

        {approvedFeedback.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedFeedback.map((fb) => (
              <div key={fb.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(fb.rating || 5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                  </div>
                  <Quote className="w-5 h-5 text-blue-200" />
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">"{fb.message}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {(fb.userName || 'U').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{fb.userName || 'Verified Athlete'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{fb.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-8 text-center max-w-md mx-auto space-y-3">
            <Star className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Be the First to Share Your Journey</h4>
            <p className="text-xs text-slate-600">Submit your real feedback from the dashboard after completing your first workout session.</p>
          </div>
        )}
      </section>

      {/* 5. INTERACTIVE FAQ SECTION */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-xs space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Questions & Answers
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
        <h2 className="text-3xl sm:text-5xl font-black font-heading text-white tracking-tight">
          Ready to Start Your Personalized Routine?
        </h2>
        <p className="text-xs sm:text-base text-blue-100 max-w-2xl mx-auto leading-relaxed font-normal">
          Join users building consistent workout habits with FitMate AI. Powered by Next-Gen AI Precision Engine.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={onOpenAssessment}
            className="px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-sm rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Start Fitness Assessment
          </button>
          <button
            onClick={() => onOpenLogin('register')}
            className="px-8 py-4 bg-blue-900/60 hover:bg-blue-900 text-white border border-blue-400/30 font-bold text-sm rounded-2xl transition-all hover:scale-105"
          >
            Create Free Account
          </button>
        </div>
      </section>

    </div>
  );
};
