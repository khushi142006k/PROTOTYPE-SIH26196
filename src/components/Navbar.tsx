import React from 'react';
import { 
  Flame, 
  LayoutDashboard, 
  CalendarDays, 
  Dumbbell, 
  LineChart, 
  Bot, 
  ShieldCheck, 
  User, 
  Globe2,
  Sparkles
} from 'lucide-react';
import { UserProfile, Language } from '../types';
import { getTranslation } from '../translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile;
  streak: number;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isAdminMode: boolean;
  onToggleAdmin: () => void;
  onOpenAssessment: () => void;
  onOpenLogin: () => void;
  isLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  streak,
  language,
  onLanguageChange,
  isAdminMode,
  onToggleAdmin,
  onOpenAssessment,
  onOpenLogin,
  isLoggedIn
}) => {
  const navItems = [
    { id: 'dashboard', label: getTranslation(language, 'dashboard'), icon: LayoutDashboard },
    { id: 'workoutPlan', label: getTranslation(language, 'workoutPlan'), icon: CalendarDays },
    { id: 'exerciseLibrary', label: getTranslation(language, 'exerciseLibrary'), icon: Dumbbell },
    { id: 'progress', label: getTranslation(language, 'progress'), icon: LineChart },
    { id: 'aiAssistant', label: getTranslation(language, 'aiAssistant'), icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
                <Dumbbell className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-blue-900">
                    {getTranslation(language, 'appName')}
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-blue-600" /> AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block font-medium">
                  {getTranslation(language, 'appTagline')}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {isAdminMode && (
              <button
                onClick={() => setActiveTab('adminPanel')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'adminPanel'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-blue-900 hover:bg-blue-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>{getTranslation(language, 'adminPanel')}</span>
              </button>
            )}
          </nav>

          {/* Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Streak Counter */}
            <div 
              className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-2.5 py-1.5 rounded-full"
              title={`${streak} day workout streak!`}
            >
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>{streak}</span>
              <span className="hidden sm:inline text-[10px] text-orange-600 font-normal">
                {getTranslation(language, 'days')}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="relative group">
              <button 
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs flex items-center gap-1.5"
                title="Select Language"
              >
                <Globe2 className="w-4 h-4 text-blue-600" />
                <span className="uppercase text-[11px] font-bold text-slate-700">{language}</span>
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50 p-1">
                <button
                  onClick={() => onLanguageChange('en')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => onLanguageChange('hi')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${language === 'hi' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  हिंदी (HI)
                </button>
                <button
                  onClick={() => onLanguageChange('gu')}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-md ${language === 'gu' ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  ગુજરાતી (GU)
                </button>
              </div>
            </div>

            {/* Role Switcher Toggle */}
            <button
              onClick={onToggleAdmin}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
                isAdminMode
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}
              title="Toggle between User view and Admin Portal"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${isAdminMode ? 'text-blue-300' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">
                {isAdminMode ? getTranslation(language, 'roleAdmin') : getTranslation(language, 'roleUser')}
              </span>
            </button>

            {/* Assessment Trigger */}
            <button
              onClick={onOpenAssessment}
              className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-sm shadow-blue-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assessment</span>
            </button>

            {/* Login / Auth Modal Trigger */}
            <button
              onClick={onOpenLogin}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isLoggedIn
                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-xs'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{isLoggedIn ? 'Account' : 'Login'}</span>
            </button>

            {/* User Profile Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-9 h-9 rounded-full bg-blue-50 border flex items-center justify-center font-bold text-xs text-blue-600 transition-all ${
                activeTab === 'profile' ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 hover:border-slate-300'
              }`}
              title={user.name}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Toolbar */}
      <div className="lg:hidden border-t border-slate-200 bg-white px-2 py-1.5 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        {isAdminMode && (
          <button
            onClick={() => setActiveTab('adminPanel')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-all ${
              activeTab === 'adminPanel' ? 'text-blue-900 bg-blue-50 font-bold' : 'text-blue-900/70 hover:text-blue-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-0.5" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
