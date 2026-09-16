import React, { useState } from 'react';
import {
  X,
  Star,
  ThumbsUp,
  MessageSquare,
  Clock,
  ShieldCheck,
  User as UserIcon,
  EyeOff,
  Trash2,
  Tag,
  Monitor,
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bug,
  Layout,
  Gauge,
  DollarSign,
  Lightbulb,
} from 'lucide-react';
import { FeedbackItem, FeedbackStatus, User } from '../types';

interface FeedbackDetailModalProps {
  feedback: FeedbackItem | null;
  currentUser: User | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: FeedbackStatus) => void;
  onToggleUpvote: (id: string) => void;
  onDeleteFeedback: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
}

const STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: { label: 'New', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  in_review: { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  resolved: { label: 'Resolved', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  feature: <Lightbulb className="w-3.5 h-3.5 text-amber-500" />,
  bug: <Bug className="w-3.5 h-3.5 text-rose-500" />,
  ui_ux: <Layout className="w-3.5 h-3.5 text-indigo-500" />,
  performance: <Gauge className="w-3.5 h-3.5 text-blue-500" />,
  pricing: <DollarSign className="w-3.5 h-3.5 text-emerald-500" />,
  general: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
};

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  currentUser,
  onClose,
  onUpdateStatus,
  onToggleUpvote,
  onDeleteFeedback,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!feedback) return null;

  const currentVoterId = currentUser?.id || 'guest-voter';
  const hasUpvoted = feedback.upvotedBy.includes(currentVoterId);
  const statusInfo = STATUS_CONFIG[feedback.status];

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(feedback.id, commentText.trim());
    setCommentText('');
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      id="feedback-detail-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="feedback-detail-content"
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              {statusInfo.label}
            </span>

            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {CATEGORY_ICONS[feedback.category]}
              <span className="capitalize">{feedback.category.replace('_', ' ')}</span>
            </span>

            <span className="text-xs font-mono text-slate-400">#{feedback.id}</span>
          </div>

          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[calc(85vh-8rem)] overflow-y-auto">
          {/* Title & Rating */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {feedback.title}
              </h2>
              <div className="flex items-center gap-1 shrink-0 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < feedback.rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-amber-900 ml-1">
                  {feedback.rating}.0
                </span>
              </div>
            </div>

            {/* Author Meta */}
            <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                {feedback.isAnonymous ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Anonymous Contributor</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {feedback.userName[0]}
                    </div>
                    <span className="font-medium text-slate-800">{feedback.userName}</span>
                  </>
                )}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(feedback.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            {feedback.description}
          </div>

          {/* Tags & Environment */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {feedback.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                {t}
              </span>
            ))}

            {feedback.deviceInfo && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-200">
                <Monitor className="w-3 h-3 text-slate-400" />
                {feedback.deviceInfo}
              </span>
            )}

            {feedback.attachmentName && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <FileText className="w-3 h-3 text-emerald-600" />
                {feedback.attachmentName}
              </span>
            )}
          </div>

          {/* Status Changer & Upvote Control */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100/70 border border-slate-200">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">
                Update Status:
              </label>
              <select
                id="modal-status-select"
                value={feedback.status}
                onChange={(e) =>
                  onUpdateStatus(feedback.id, e.target.value as FeedbackStatus)
                }
                className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer"
              >
                <option value="new">New</option>
                <option value="in_review">In Review</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="modal-upvote-btn"
                onClick={() => onToggleUpvote(feedback.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  hasUpvoted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-white' : ''}`} />
                <span>{hasUpvoted ? 'Upvoted' : 'Upvote'}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-black/10">
                  {feedback.upvotes}
                </span>
              </button>

              <button
                type="button"
                id="modal-delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete this feedback"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delete Confirmation Alert */}
          {showDeleteConfirm && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Are you sure you want to permanently delete this feedback?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteFeedback(feedback.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-1 bg-white text-slate-700 border border-slate-200 rounded-md font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Comments & Discussion Thread */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Team Responses & Comments ({feedback.comments.length})</span>
            </h3>

            {/* List of comments */}
            <div className="space-y-3 mb-4">
              {feedback.comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No comments or staff replies yet. Start the conversation below.
                </p>
              ) : (
                feedback.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">
                          {comment.authorName}
                        </span>
                        {comment.authorRole === 'admin' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Team Staff
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                id="comment-input"
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={`Reply as ${currentUser?.name || 'Guest'}...`}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                id="comment-submit-btn"
                disabled={!commentText.trim()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
