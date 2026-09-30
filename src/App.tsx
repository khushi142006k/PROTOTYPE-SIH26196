import React, { useState } from 'react';
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
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { SafetyBanner } from './components/SafetyBanner';
import { AssessmentWizard } from './components/AssessmentWizard';
import { WorkoutRunnerModal } from './components/WorkoutRunnerModal';
import { ActivityLoggerModal } from './components/ActivityLoggerModal';
import { GoalModal } from './components/GoalModal';
import { FeedbackModal } from './components/FeedbackModal';
import { LoginModal } from './components/LoginModal';

import { DashboardView } from './views/DashboardView';
import { WorkoutPlanView } from './views/WorkoutPlanView';
import { ExerciseLibraryView } from './views/ExerciseLibraryView';
import { ProgressAnalyticsView } from './views/ProgressAnalyticsView';
import { AIAssistantView } from './views/AIAssistantView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { UserProfileView } from './views/UserProfileView';

export default function App() {
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUserProfile());
  const [plan, setPlan] = useState<WorkoutPlan | null>(() => StorageService.getActivePlan());
  const [goals, setGoals] = useState<Goal[]>(() => StorageService.getGoals());
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutSessionLog[]>(() => StorageService.getWorkoutLogs());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => StorageService.getActivityLogs());
  const [aiAnalysis, setAiAnalysis] = useState<AIProgressAnalysis | null>(() => StorageService.getAIAnalysis());
  const [streak, setStreak] = useState<number>(() => StorageService.calculateStreak());
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(user.language || 'en');

  // Modals state
  const [showAssessment, setShowAssessment] = useState<boolean>(false);
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<WorkoutDay | null>(null);
  const [showWorkoutRunner, setShowWorkoutRunner] = useState<boolean>(false);
  const [showActivityLogger, setShowActivityLogger] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
    refreshLogsAndStreak();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLoginModal(false);
    setActiveTab('dashboard');
  };

  // Sync state helpers
  const refreshLogsAndStreak = () => {
    setWorkoutLogs(StorageService.getWorkoutLogs());
    setActivityLogs(StorageService.getActivityLogs());
    setStreak(StorageService.calculateStreak());
  };

  const handleStartWorkout = (dayIndex: number) => {
    if (plan && plan.weeklySchedule && plan.weeklySchedule[dayIndex]) {
      setSelectedWorkoutDay(plan.weeklySchedule[dayIndex]);
      setShowWorkoutRunner(true);
    }
  };

  const handleWorkoutCompleted = (log: WorkoutSessionLog) => {
    refreshLogsAndStreak();
  };

  const handleActivityLogged = (act: ActivityLog) => {
    refreshLogsAndStreak();
  };

  const handleGoalAdded = (newGoal: Goal) => {
    setGoals(StorageService.getGoals());
  };

  const handleUpdateGoalProgress = (goalId: string, currentProgress: number) => {
    StorageService.updateGoalProgress(goalId, currentProgress);
    setGoals(StorageService.getGoals());
  };

  const handlePlanGenerated = (newPlan: WorkoutPlan, updatedProfile: UserProfile) => {
    setPlan(newPlan);
    setUser(updatedProfile);
  };

  const handleAdaptPlan = async (feedback: string) => {
    try {
      const response = await fetch('/api/ai/adapt-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan: plan,
          feedback,
          missedDaysCount: 1
        })
      });

      const data = await response.json();
      if (data.success && data.plan) {
        const adaptedPlan: WorkoutPlan = {
          ...plan!,
          planTitle: data.plan.planTitle || plan?.planTitle || 'Adapted Plan',
          summary: data.plan.summary || plan?.summary || 'Adapted for your feedback.',
          weeklySchedule: data.plan.weeklySchedule || plan?.weeklySchedule || []
        };
        StorageService.saveActivePlan(adaptedPlan);
        setPlan(adaptedPlan);
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
        setActiveTab={setActiveTab}
        user={user}
        streak={streak}
        language={language}
        onLanguageChange={setLanguage}
        isAdminMode={isAdminMode}
        onToggleAdmin={() => setIsAdminMode(!isAdminMode)}
        onOpenAssessment={() => setShowAssessment(true)}
        onOpenLogin={() => setShowLoginModal(true)}
        isLoggedIn={isLoggedIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 space-y-4">
        
        {/* Safety Disclaimer Banner */}
        <SafetyBanner language={language} />

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            plan={plan}
            goals={goals}
            logs={workoutLogs}
            activityLogs={activityLogs}
            aiAnalysis={aiAnalysis}
            streak={streak}
            language={language}
            onStartWorkout={handleStartWorkout}
            onOpenActivityLogger={() => setShowActivityLogger(true)}
            onOpenGoalModal={() => setShowGoalModal(true)}
            onOpenFeedbackModal={() => setShowFeedbackModal(true)}
            onNavigateToTab={setActiveTab}
            onUpdateGoalProgress={handleUpdateGoalProgress}
          />
        )}

        {activeTab === 'workoutPlan' && (
          <WorkoutPlanView
            plan={plan}
            language={language}
            onStartWorkout={handleStartWorkout}
            onOpenAssessment={() => setShowAssessment(true)}
            onAdaptPlan={handleAdaptPlan}
          />
        )}

        {activeTab === 'exerciseLibrary' && (
          <ExerciseLibraryView language={language} />
        )}

        {activeTab === 'progress' && (
          <ProgressAnalyticsView
            logs={workoutLogs}
            activityLogs={activityLogs}
            goals={goals}
            aiAnalysis={aiAnalysis}
            onAnalysisUpdated={setAiAnalysis}
            language={language}
          />
        )}

        {activeTab === 'aiAssistant' && (
          <AIAssistantView user={user} language={language} />
        )}

        {activeTab === 'adminPanel' && isAdminMode && (
          <AdminDashboardView />
        )}

        {activeTab === 'profile' && (
          <UserProfileView
            user={user}
            onProfileUpdated={setUser}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

      </main>

      {/* App Modals */}
      <AssessmentWizard
        user={user}
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
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">FitMate — AI Personal Fitness & Wellness Platform © {new Date().getFullYear()}</p>
        <p className="text-[11px] text-slate-500">Assess → Set Goal → Personalize → Workout → Track → Analyze → Adapt → Improve</p>
      </footer>

    </div>
  );
}
