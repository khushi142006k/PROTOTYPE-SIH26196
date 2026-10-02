import React, { useState } from 'react';
import { 
  X, 
  Dumbbell, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  UserCheck, 
  User,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user?: UserProfile | string) => void;
  mode?: 'login' | 'register' | 'admin_login';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  mode: initialMode = 'login'
}) => {
  const { signIn, signUp, resetPassword, isLoggedIn, user, signOut } = useAuth();

  const [mode, setMode] = useState<'login' | 'admin_login' | 'register' | 'forgot'>(initialMode);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const loggedUser = await signIn(email.trim(), password);
      setIsLoading(false);
      setSuccessMessage('Successfully logged in! Welcome back.');
      setTimeout(() => {
        onLoginSuccess(loggedUser);
        onClose();
        setSuccessMessage(null);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Invalid email or password. Please check your credentials.');
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !validateEmail(email)) {
      setError('Valid admin email is required.');
      return;
    }

    if (!password) {
      setError('Admin password is required.');
      return;
    }

    setIsLoading(true);

    try {
      const loggedUser = await signIn(email.trim(), password);
      setIsLoading(false);

      // Auto-grant admin rights if email contains 'admin'
      if (email.toLowerCase().includes('admin') || loggedUser.email.toLowerCase().includes('admin')) {
        loggedUser.isAdmin = true;
        loggedUser.role = 'admin';
      }

      if (!loggedUser.isAdmin && loggedUser.role !== 'admin') {
        setError('Access Denied: This account is not registered with Administrative privileges.');
        return;
      }

      setSuccessMessage('Admin Access Verified! Opening Control Center...');
      setTimeout(() => {
        onLoginSuccess(loggedUser);
        onClose();
        setSuccessMessage(null);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Invalid admin credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email.trim(), password, name.trim());
      setIsLoading(false);
      setSuccessMessage('Account created successfully! You can now log in.');
      setTimeout(() => {
        setMode('login');
        setSuccessMessage(null);
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to create account.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email.trim());
      setIsLoading(false);
      setSuccessMessage('Password reset instructions sent to your email.');
      setTimeout(() => {
        setMode('login');
        setSuccessMessage(null);
      }, 2500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      
      {/* Main Modal Panel */}
      <div className="bg-white border border-slate-200/90 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header Section - Deep Executive Blue Canvas */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-6 sm:p-7 text-white relative overflow-hidden">
          
          {/* Subtle Lighting Accent */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Brand Logo & Title */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 border border-blue-400/30 shrink-0">
                <Dumbbell className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white font-heading">FitMate</span>
                  <span className="bg-blue-500/30 text-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-400/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-cyan-300" /> AI
                  </span>
                </div>
                <p className="text-[11px] text-blue-200/80 font-medium">
                  {mode === 'login' && 'Sign in to access your fitness dashboard'}
                  {mode === 'register' && 'Create your personalized AI fitness profile'}
                  {mode === 'admin_login' && 'Administrative Control Center Portal'}
                  {mode === 'forgot' && 'Reset your account password'}
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-2xl border border-blue-800/40 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mode === 'login' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); setSuccessMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mode === 'register' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>

              <button
                type="button"
                onClick={() => { setMode('admin_login'); setError(null); setSuccessMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  mode === 'admin_login' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-amber-300/80 hover:text-amber-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-950" />
                <span>Admin</span>
              </button>
            </div>

          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">

          {/* Active Session Notice */}
          {isLoggedIn && user && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-blue-900 font-extrabold text-xs">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Logged in as {user.name}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {user.email} {user.isAdmin && <span className="text-amber-600 font-bold">(Admin)</span>}
              </p>
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full py-1.5 bg-white hover:bg-slate-100 text-red-600 text-xs font-extrabold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Sign Out Account
              </button>
            </div>
          )}

          {/* Alert Messages */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-extrabold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. USER LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setError(null); setSuccessMessage(null); setMode('forgot'); }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to FitMate</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  New to FitMate?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setSuccessMessage(null); setMode('register'); }}
                    className="text-blue-600 hover:underline font-extrabold cursor-pointer"
                  >
                    Create Free Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 2. ADMIN PORTAL LOGIN MODE */}
          {mode === 'admin_login' && (
            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Authorized Administrative Control Center Sign In</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Admin Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Login to Admin Control Center</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Free Account</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setSuccessMessage(null); setMode('login'); }}
                    className="text-blue-600 hover:underline font-extrabold cursor-pointer"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* 4. FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">Enter your email address to receive password reset instructions.</p>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-blue-600 hover:underline font-extrabold cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
