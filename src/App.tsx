import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  WorkoutPlan, 
  Goal, 
  WorkoutSessionLog, 
  ActivityLog, 
  AIProgressAnalysis, 
  WorkoutDay, 
  Language 
} from './types';
import { useAuth } from './context/AuthContext';
import { 
  useActivePlan, 
  useGoals, 
  useWorkoutLogs, 
  useActivityLogs, 
  useStreak, 
  useAIAnalysis,
  useDataMutations
} from './hooks/useFitMateData';
import { SupabaseService } from './services/supabaseClient';

import { Navbar } from './components/Navbar';
import { SafetyBanner } from './components/SafetyBanner';
import { AssessmentWizard } from './components/AssessmentWizard';
import { WorkoutRunnerModal } from './components/WorkoutRunnerModal';
import { ActivityLoggerModal } from './components/ActivityLoggerModal';
import { GoalModal } from './components/GoalModal';
import { FeedbackModal } from './components/FeedbackModal';
import { LoginModal } from './components/LoginModal';

import { LandingPageView } from './views/LandingPageView';
import { DashboardView } from './views/DashboardView';
import { WorkoutPlanView } from './views/WorkoutPlanView';
import { ExerciseLibraryView } from './views/ExerciseLibraryView';
import { ProgressAnalyticsView } from './views/ProgressAnalyticsView';
import { AIAssistantView } from './views/AIAssistantView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { UserProfileView } from './views/UserProfileView';

export default function App() {
  const { user: authUser, session, isLoggedIn, isAdmin, signOut, setUser: setAuthUser } = useAuth();
  const userId = authUser?.id;

  // Real-time Supabase hooks via React Query
  const { data: dbPlan } = useActivePlan(userId);
  const { data: dbGoals = [] } = useGoals(userId);
  const { data: dbWorkoutLogs = [] } = useWorkoutLogs(userId);
  const { data: dbActivityLogs = [] } = useActivityLogs(userId);
  const { data: dbStreak = 0 } = useStreak(userId);
  const { data: dbAnalysis = null } = useAIAnalysis(userId);

  const { updateGoalProgress } = useDataMutations(userId);

  // Local state fallbacks & active tab state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(isAdmin);
  const [language, setLanguage] = useState<Language>(authUser?.language || 'en');

  // Modals state
  const [showAssessment, setShowAssessment] = useState<boolean>(false);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<WorkoutDay | null>(null);
  const [showWorkoutRunner, setShowWorkoutRunner] = useState<boolean>(false);
  const [showActivityLogger, setShowActivityLogger] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginModalMode, setLoginModalMode] = useState<'login' | 'register' | 'admin_login'>('login');

  useEffect(() => {
    if (isAdmin !== undefined) {
      setIsAdminMode(isAdmin);
    }
  }, [isAdmin]);

  // Ensure logged-in users are routed to appropriate default view
  useEffect(() => {
    if (isLoggedIn) {
      if (isAdminMode && (activeTab === 'home' || activeTab === 'dashboard' || activeTab === 'workoutPlan' || activeTab === 'progress' || activeTab === 'aiAssistant')) {
        setActiveTab('adminPanel');
      } else if (!isAdminMode && (activeTab === 'home' || activeTab === 'adminPanel')) {
        setActiveTab('dashboard');
      }
    }
  }, [isLoggedIn, isAdminMode]);

  const currentUser: UserProfile = authUser || {
    id: 'guest',
    name: 'Fitness Member',
    email: '',
    ageGroup: '25-34',
    activityLevel: 'Lightly Active',
    experience: 'Beginner',
    location: 'Home',
    availableDays: 4,
    durationMinutes: 30,
    preferredTime: 'Morning (7:00 AM)',
    equipment: ['None (Bodyweight)'],
    preferredActivities: ['Bodyweight Training'],
    preferences: '',
    language: language,
    isAdmin: false
  };

  const handleOpenLogin = (mode: 'login' | 'register' | 'admin_login' = 'login') => {
    setLoginModalMode(mode);
    setShowLoginModal(true);
  };

  const handleTabChange = (tab: string) => {
    const protectedTabs = ['dashboard', 'workoutPlan', 'progress', 'aiAssistant', 'profile', 'adminPanel'];
    
    if (protectedTabs.includes(tab) && !isLoggedIn) {
      if (tab === 'adminPanel') {
        handleOpenLogin('admin_login');
      } else {
        handleOpenLogin('login');
      }
      return;
    }

    setActiveTab(tab);
  };

  const handleLoginSuccess = (loggedInUser?: UserProfile | string) => {
    if (typeof loggedInUser === 'object' && loggedInUser) {
      setAuthUser(loggedInUser);
      setIsAdminMode(loggedInUser.isAdmin || false);
      if (loggedInUser.isAdmin) {
        setActiveTab('adminPanel');
      } else {
        setActiveTab('dashboard');
      }
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsAdminMode(false);
    setShowLoginModal(false);
    setActiveTab('home');
  };

  const handleStartWorkout = (dayIndex: number) => {
    if (!isLoggedIn) {
      handleOpenLogin('login');
      return;
    }
    if (dbPlan && dbPlan.weeklySchedule && dbPlan.weeklySchedule[dayIndex]) {
      setSelectedWorkoutDay(dbPlan.weeklySchedule[dayIndex]);
      setShowWorkoutRunner(true);
    }
  };

  const handleWorkoutCompleted = () => {
    // React Query automatically invalidates and refetches workout logs & streak
  };

  const handleActivityLogged = () => {
    // React Query automatically refetches activity logs
  };

  const handleGoalAdded = () => {
    // React Query automatically refetches goals
  };

  const handleUpdateGoalProgress = (goalId: string, currentProgress: number) => {
    updateGoalProgress({ goalId, progress: currentProgress });
  };

  const handlePlanGenerated = (newPlan: WorkoutPlan, updatedProfile: UserProfile) => {
    setAuthUser(updatedProfile);
    setActiveTab('workoutPlan');
  };

  const handleAdaptPlan = async (feedback: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/ai/adapt-plan', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPlan: dbPlan,
          feedback,
          missedDaysCount: 1
        })
      });

      const data = await response.json();
      if (data.success && data.plan && userId) {
        const adaptedPlan: WorkoutPlan = {
          ...dbPlan!,
          planTitle: data.plan.planTitle || dbPlan?.planTitle || 'Adapted Plan',
          summary: data.plan.summary || dbPlan?.summary || 'Adapted for your feedback.',
          weeklySchedule: data.plan.weeklySchedule || dbPlan?.weeklySchedule || []
        };
        await SupabaseService.saveActivePlan(userId, adaptedPlan);
      }
    } catch (e) {
      console.error('Error adapting plan:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        user={currentUser}
        streak={dbStreak}
        language={language}
        onLanguageChange={setLanguage}
        isAdminMode={isAdminMode}
        onToggleAdmin={() => {
          if (!isLoggedIn) {
            handleOpenLogin('admin_login');
          } else {
            const nextAdminMode = !isAdminMode;
            setIsAdminMode(nextAdminMode);
            setActiveTab(nextAdminMode ? 'adminPanel' : 'dashboard');
          }
        }}
        onOpenAssessment={() => {
          if (!isLoggedIn) {
            handleOpenLogin('login');
          } else {
            setShowAssessment(true);
          }
        }}
        onOpenLogin={handleOpenLogin}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-4">
        
        {/* Safety Disclaimer Banner */}
        <SafetyBanner language={language} />

        {/* Tab Views */}
        {activeTab === 'home' && (
          <LandingPageView
            onOpenAssessment={() => {
              if (!isLoggedIn) {
                handleOpenLogin('login');
              } else {
                setShowAssessment(true);
              }
            }}
            onOpenLogin={handleOpenLogin}
            onNavigateToTab={handleTabChange}
            language={language}
          />
        )}

        {activeTab === 'dashboard' && isLoggedIn && (
          <DashboardView
            user={currentUser}
            plan={dbPlan || null}
            goals={dbGoals}
            logs={dbWorkoutLogs}
            activityLogs={dbActivityLogs}
            aiAnalysis={dbAnalysis}
            streak={dbStreak}
            language={language}
            onStartWorkout={handleStartWorkout}
            onOpenActivityLogger={() => setShowActivityLogger(true)}
            onOpenGoalModal={() => setShowGoalModal(true)}
            onOpenFeedbackModal={() => setShowFeedbackModal(true)}
            onNavigateToTab={handleTabChange}
            onUpdateGoalProgress={handleUpdateGoalProgress}
          />
        )}

        {activeTab === 'workoutPlan' && isLoggedIn && (
          <WorkoutPlanView
            plan={dbPlan || null}
            language={language}
            onStartWorkout={handleStartWorkout}
            onOpenAssessment={() => setShowAssessment(true)}
            onAdaptPlan={handleAdaptPlan}
          />
        )}

        {activeTab === 'exerciseLibrary' && (
          <ExerciseLibraryView language={language} />
        )}

        {activeTab === 'progress' && isLoggedIn && (
          <ProgressAnalyticsView
            logs={dbWorkoutLogs}
            activityLogs={dbActivityLogs}
            goals={dbGoals}
            aiAnalysis={dbAnalysis}
            onAnalysisUpdated={() => {}}
            language={language}
          />
        )}

        {activeTab === 'aiAssistant' && isLoggedIn && (
          <AIAssistantView user={currentUser} language={language} />
        )}

        {activeTab === 'adminPanel' && isLoggedIn && isAdminMode && (
          <AdminDashboardView />
        )}

        {activeTab === 'profile' && isLoggedIn && (
          <UserProfileView
            user={currentUser}
            onProfileUpdated={(updated) => setAuthUser(updated)}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

      </main>

      {/* App Modals */}
      <AssessmentWizard
        user={currentUser}
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        onPlanGenerated={handlePlanGenerated}
        language={language}
      />

      {selectedWorkoutDay && (
        <WorkoutRunnerModal
          workoutDay={selectedWorkoutDay}
          isOpen={showWorkoutRunner}
          onClose={() => setShowWorkoutRunner(false)}
          onWorkoutCompleted={handleWorkoutCompleted}
          language={language}
        />
      )}

      <ActivityLoggerModal
        isOpen={showActivityLogger}
        onClose={() => setShowActivityLogger(false)}
        onActivityLogged={handleActivityLogged}
      />

      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onGoalAdded={handleGoalAdded}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        mode={loginModalMode}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">FitMate — AI Personal Fitness & Wellness Platform © {new Date().getFullYear()}</p>
        <p className="text-[11px] text-slate-500">Assess → Set Goal → Personalize → Workout → Track → Analyze → Adapt → Improve</p>
      </footer>

    </div>
  );
}
