import React from 'react';
import {
  MessageSquare,
  PlusCircle,
  LayoutDashboard,
  UserCheck,
  LogOut,
  LogIn,
  RotateCcw,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { User, AppPage } from '../types';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  currentUser: User | null;
  onLogout: () => void;
  onQuickSwitchUser: (role: 'admin' | 'user') => void;
  onResetData: () => void;
  feedbackCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  onQuickSwitchUser,
  onResetData,
  feedbackCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  Feedback<span className="text-emerald-600">Portal</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Local Store
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Centralized Voice & Product Insights
              </p>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-dashboard-btn"
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
                  currentPage === 'dashboard'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {feedbackCount}
              </span>
            </button>

            <button
              id="nav-submit-form-btn"
              onClick={() => onNavigate('form')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'form'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Submit Feedback</span>
            </button>
          </nav>

          {/* Right Action & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-xs text-slate-600">
              <span className="font-medium text-slate-500 mr-1">Switch:</span>
              <button
                id="switch-to-user-btn"
                onClick={() => onQuickSwitchUser('user')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  currentUser?.role === 'user'
                    ? 'bg-emerald-100 text-emerald-800 font-semibold'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Switch to regular member demo"
              >
                User
              </button>
              <button
                id="switch-to-admin-btn"
                onClick={() => onQuickSwitchUser('admin')}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  currentUser?.role === 'admin'
                    ? 'bg-indigo-100 text-indigo-800 font-semibold'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
                title="Switch to team admin / reviewer demo"
              >
                Admin
              </button>
            </div>

            {/* Reset data */}
            <button
              id="reset-demo-data-btn"
              onClick={onResetData}
              title="Reset sample feedbacks and users to factory defaults"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile Submit Button if not on form page */}
            {currentPage !== 'form' && (
              <button
                id="mobile-submit-btn"
                onClick={() => onNavigate('form')}
                className="md:hidden flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Give Feedback</span>
              </button>
            )}

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 text-left">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${
                      currentUser.role === 'admin'
                        ? 'bg-indigo-600'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5 leading-tight">
                      <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                        {currentUser.name}
                      </span>
                      {currentUser.role === 'admin' ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                          <UserCheck className="w-2.5 h-2.5" />
                          User
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>

                <button
                  id="logout-btn"
                  onClick={onLogout}
                  title="Sign out of current account"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="header-login-btn"
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log in</span>
                </button>
                <button
                  id="header-register-btn"
                  onClick={() => onNavigate('register')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex border-t border-slate-200 bg-white px-2 py-1.5 justify-around">
        <button
          id="mobile-nav-dashboard"
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium ${
            currentPage === 'dashboard'
              ? 'text-slate-900 font-semibold bg-slate-100'
              : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard ({feedbackCount})</span>
        </button>

        <button
          id="mobile-nav-form"
          onClick={() => onNavigate('form')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium ${
            currentPage === 'form'
              ? 'text-slate-900 font-semibold bg-slate-100'
              : 'text-slate-500'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <span>Feedback Form</span>
        </button>

        {!currentUser ? (
          <button
            id="mobile-nav-login"
            onClick={() => onNavigate('login')}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium ${
              currentPage === 'login' || currentPage === 'register'
                ? 'text-slate-900 font-semibold bg-slate-100'
                : 'text-slate-500'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        ) : (
          <button
            id="mobile-nav-logout"
            onClick={onLogout}
            className="flex flex-col items-center gap-1 py-1 px-4 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};
