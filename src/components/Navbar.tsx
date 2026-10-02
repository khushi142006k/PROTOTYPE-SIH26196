import React, { useState } from 'react';
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
  Sparkles,
  Home,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Zap
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
  onOpenLogin: (mode?: 'login' | 'register' | 'admin_login') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
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
  isLoggedIn,
  onLogout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Compact tab definitions for clean laptop & desktop fit
  const publicNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'exerciseLibrary', label: 'Exercises', icon: Dumbbell },
  ];

  // Logged in normal users see user features
  const authenticatedNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workoutPlan', label: 'Workout Plan', icon: CalendarDays },
    { id: 'exerciseLibrary', label: 'Exercises', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'aiAssistant', label: 'AI Coach', icon: Bot },
  ];

  // Admin users in admin mode see strictly Admin features
  const adminNavItems = [
    { id: 'adminPanel', label: 'Admin Control Center', icon: ShieldCheck },
    { id: 'exerciseLibrary', label: 'Exercise Catalog', icon: Dumbbell },
  ];

  const currentNavItems = !isLoggedIn 
    ? publicNavItems 
    : (isAdminMode ? adminNavItems : authenticatedNavItems);

  const languagesList: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs text-slate-900 w-full overflow-visible">
      {/* Click outside backdrop for dropdown menus */}
      {(showProfileMenu || showLangMenu) && (
        <div 
          className="fixed inset-0 z-30 bg-transparent" 
          onClick={() => {
            setShowProfileMenu(false);
            setShowLangMenu(false);
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 relative z-40">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab(isLoggedIn ? (isAdminMode ? 'adminPanel' : 'dashboard') : 'home')} 
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
                <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 -rotate-45" />
              </div>

              <div className="whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-heading">
                    {getTranslation(language, 'appName')}
                  </span>
                  {isAdminMode ? (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                    </span>
                  ) : (
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5 text-blue-600" /> AI
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 hidden md:block font-medium">
                  {isAdminMode ? 'Administrator Portal' : getTranslation(language, 'appTagline')}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Nav Items (Compact Spacing to prevent cutoff) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 shrink">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? (isAdminMode ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-blue-600 text-white shadow-xs shadow-blue-600/20')
                      : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (isAdminMode ? 'text-slate-950' : 'text-white') : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controls & Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Workout Streak Counter (User mode only) */}
            {isLoggedIn && !isAdminMode && (
              <div 
                className="hidden sm:flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap"
                title={`${streak} day workout streak!`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                <span>{streak}</span>
                <span className="hidden md:inline text-[10px] text-orange-600 font-semibold uppercase">
                  {getTranslation(language, 'days')}
                </span>
              </div>
            )}

            {/* Language Switcher */}
            <div className="relative shrink-0">
              <button 
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors"
                title="Select Language"
              >
                <Globe2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase text-[11px] font-bold text-slate-700">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between ${
                        language === lang.code 
                          ? 'bg-blue-50 text-blue-600 font-bold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                      {language === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment CTA (Logged In user mode only) */}
            {isLoggedIn && !isAdminMode && (
              <button
                onClick={onOpenAssessment}
                className="hidden xl:flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs shadow-blue-600/20 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                <span>Assessment</span>
              </button>
            )}

            {/* User Login / Profile Pill */}
            {!isLoggedIn ? (
              <button
                onClick={() => onOpenLogin('login')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs shadow-blue-600/20 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            ) : (
              /* Profile Menu Dropdown */
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-1.5 p-1 pl-2.5 border rounded-full transition-all text-xs font-bold ${
                    isAdminMode
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950'
                      : 'bg-blue-50/90 hover:bg-blue-100/90 border-blue-200 text-blue-900'
                  }`}
                >
                  <span className="hidden md:inline font-extrabold text-xs truncate max-w-[80px]">
                    {user.name.split(' ')[0]}
                  </span>
                  
                  <div className={`w-7 h-7 rounded-full text-white font-extrabold flex items-center justify-center text-xs shadow-xs shrink-0 ${
                    isAdminMode ? 'bg-amber-500 text-slate-950' : 'bg-blue-600'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <ChevronDown className="w-3 h-3 text-slate-600" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 divide-y divide-slate-100">
                    <div className="p-2 pb-2.5">
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-xs text-slate-900 truncate">{user.name}</p>
                        {(user.isAdmin || isAdminMode) && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-300">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{user.email}</p>
                    </div>

                    <div className="pt-1 space-y-1">
                      {!isAdminMode && (
                        <button
                          onClick={() => { setActiveTab('profile'); setShowProfileMenu(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          <span>My Profile</span>
                        </button>
                      )}

                      {user.isAdmin && (
                        <button
                          onClick={() => {
                            onToggleAdmin();
                            setShowProfileMenu(false);
                            setActiveTab(isAdminMode ? 'dashboard' : 'adminPanel');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-2 border transition-colors ${
                            isAdminMode
                              ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isAdminMode ? 'Switch to User View' : 'Switch to Admin View'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => { 
                          e.stopPropagation();
                          setShowProfileMenu(false); 
                          onLogout(); 
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Logout Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className="lg:hidden border-t border-slate-200 bg-white px-2 py-1.5 flex items-center justify-around overflow-x-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${
                isActive ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
