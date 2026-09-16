import React, { useState } from 'react';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { loginUser, registerUser } from '../lib/storage';
import { User, AppPage } from '../types';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: User) => void;
  onNavigate: (page: AppPage) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccess,
  onNavigate,
}) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please fill in all required credentials.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (isLogin) {
        const res = loginUser(email, password);
        if (res.success && res.user) {
          setSuccessMessage(`Welcome back, ${res.user.name}!`);
          setTimeout(() => {
            onSuccess(res.user!);
            onNavigate('dashboard');
          }, 600);
        } else {
          setError(res.error || 'Failed to authenticate.');
          setIsSubmitting(false);
        }
      } else {
        if (!name.trim()) {
          setError('Please provide your full name.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 5) {
          setError('Password must be at least 5 characters long.');
          setIsSubmitting(false);
          return;
        }

        const res = registerUser(name, email, password, role);
        if (res.success && res.user) {
          setSuccessMessage(`Account created successfully! Welcome, ${res.user.name}.`);
          setTimeout(() => {
            onSuccess(res.user!);
            onNavigate('dashboard');
          }, 700);
        } else {
          setError(res.error || 'Failed to create account.');
          setIsSubmitting(false);
        }
      }
    }, 350);
  };

  const handleQuickLogin = (demoRole: 'user' | 'admin') => {
    setError(null);
    if (demoRole === 'admin') {
      setEmail('admin@feedbackportal.com');
      setPassword('admin123');
      const res = loginUser('admin@feedbackportal.com', 'admin123');
      if (res.success && res.user) {
        onSuccess(res.user);
        onNavigate('dashboard');
      }
    } else {
      setEmail('alex@company.com');
      setPassword('demo123');
      const res = loginUser('alex@company.com', 'demo123');
      if (res.success && res.user) {
        onSuccess(res.user);
        onNavigate('dashboard');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full">
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-3 shadow-sm">
            {isLogin ? (
              <LogIn className="w-6 h-6 text-emerald-400" />
            ) : (
              <UserPlus className="w-6 h-6 text-indigo-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isLogin ? 'Sign in to Feedback Portal' : 'Create your local account'}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {isLogin
              ? 'Access the feedback management hub, submit reviews, and track statuses.'
              : 'Stored safely in your browser local storage. No external server needed.'}
          </p>
        </div>

        {/* Quick Demo Pre-fill Banner */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Accounts (One-Click Test)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="quick-demo-user"
              onClick={() => handleQuickLogin('user')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-xs group"
            >
              <span className="font-semibold text-slate-900 group-hover:text-emerald-700">
                Alex (User)
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Submit & vote feedback
              </span>
            </button>
            <button
              type="button"
              id="quick-demo-admin"
              onClick={() => handleQuickLogin('admin')}
              className="flex flex-col text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition-all text-xs group"
            >
              <span className="font-semibold text-slate-900 group-hover:text-indigo-700">
                Sarah (Admin)
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                Manage, resolve & reply
              </span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {isLogin && (
                  <span className="text-[11px] text-slate-400">
                    Demo: admin123 or demo123
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                      role === 'user'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Regular User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-all ${
                      role === 'admin'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Team Admin</span>
                  </button>
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : isLogin ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-semibold text-slate-900 hover:underline"
              >
                {isLogin ? 'Register now' : 'Sign in instead'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
