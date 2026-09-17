/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FeedbackForm } from './components/FeedbackForm';
import { AuthPage } from './components/AuthPage';
import { FeedbackDetailModal } from './components/FeedbackDetailModal';
import {
  FeedbackItem,
  FeedbackStatus,
  User,
  AppPage,
} from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getFeedbacks,
  updateFeedbackStatus,
  deleteFeedback,
  toggleFeedbackUpvote,
  addFeedbackComment,
  resetAllDataToDefault,
  loginUser,
} from './lib/storage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [currentUser, setUser] = useState<User | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data from local storage
  const reloadData = useCallback(() => {
    const user = getCurrentUser();
    setUser(user);
    const storedFeedbacks = getFeedbacks();
    setFeedbacks(storedFeedbacks);

    // Keep selected feedback updated if currently viewing
    setSelectedFeedback((prev) => {
      if (!prev) return null;
      return storedFeedbacks.find((f) => f.id === prev.id) || null;
    });
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
    showToast('Signed out successfully.');
  };

  const handleQuickSwitchUser = (targetRole: 'admin' | 'user') => {
    if (targetRole === 'admin') {
      const res = loginUser('admin@feedbackportal.com', 'admin123');
      if (res.success && res.user) {
        setUser(res.user);
        showToast('Switched to Lead PM Sarah (Admin role)');
      }
    } else {
      const res = loginUser('alex@company.com', 'demo123');
      if (res.success && res.user) {
        setUser(res.user);
        showToast('Switched to Alex Rivera (User role)');
      }
    }
    reloadData();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all feedback and user accounts to initial demo defaults?')) {
      resetAllDataToDefault();
      reloadData();
      showToast('All local storage data reset to initial demo state.');
    }
  };

  const handleToggleUpvote = (id: string) => {
    const voterId = currentUser?.id || 'guest-voter';
    const updated = toggleFeedbackUpvote(id, voterId);
    if (updated) {
      reloadData();
    }
  };

  const handleUpdateStatus = (id: string, newStatus: FeedbackStatus) => {
    const updated = updateFeedbackStatus(id, newStatus);
    if (updated) {
      reloadData();
      showToast(`Status updated to "${newStatus.replace('_', ' ')}"`);
    }
  };

  const handleDeleteFeedback = (id: string) => {
    const ok = deleteFeedback(id);
    if (ok) {
      reloadData();
      setSelectedFeedback(null);
      showToast('Feedback item deleted.');
    }
  };

  const handleAddComment = (id: string, text: string) => {
    const authorName = currentUser?.name || 'Guest User';
    const authorRole = currentUser?.role || 'user';
    const authorId = currentUser?.id || 'guest';

    const comment = addFeedbackComment(id, {
      authorId,
      authorName,
      authorRole,
      text,
    });

    if (comment) {
      reloadData();
      showToast('Comment posted.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast notification banner */}
      {toastMessage && (
        <div
          id="app-toast-alert"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 transition-all animate-bounce"
        >
          {toastMessage}
        </div>
      )}

      {/* Global Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page:AppPage) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
        onResetData={handleResetData}
        feedbackCount={feedbacks.length}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {currentPage === 'dashboard' && (
          <Dashboard
            feedbacks={feedbacks}
            currentUser={currentUser}
            onSelectFeedback={(item:FeedbackItem) => setSelectedFeedback(item)}
            onToggleUpvote={handleToggleUpvote}
            onNavigate={(page:AppPage) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRefreshData={reloadData}
          />
        )}

        {currentPage === 'form' && (
          <FeedbackForm
            currentUser={currentUser}
            onSuccessNavigate={() => {
              reloadData();
              setCurrentPage('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'login' && (
          <AuthPage
            initialMode="login"
            onSuccess={(u:User) => {
              setUser(u);
              showToast(`Logged in as ${u.name}`);
            }}
            onNavigate={(page:AppPage) => setCurrentPage(page)}
          />
        )}

        {currentPage === 'register' && (
          <AuthPage
            initialMode="register"
            onSuccess={(u:User) => {
              setUser(u);
              showToast(`Welcome, ${u.name}!`);
            }}
            onNavigate={(page:AppPage) => setCurrentPage(page)}
          />
        )}
      </main>

      {/* Detail & Response Thread Modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          currentUser={currentUser}
          onClose={() => setSelectedFeedback(null)}
          onUpdateStatus={handleUpdateStatus}
          onToggleUpvote={handleToggleUpvote}
          onDeleteFeedback={handleDeleteFeedback}
          onAddComment={handleAddComment}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Feedback Portal_2 • Local Browser Persistence</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="hover:text-slate-900 transition-colors"
            >
              Dashboard
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentPage('form')}
              className="hover:text-slate-900 transition-colors"
            >
              Submit Feedback
            </button>
            <span>•</span>
            <button
              onClick={handleResetData}
              className="hover:text-rose-600 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
