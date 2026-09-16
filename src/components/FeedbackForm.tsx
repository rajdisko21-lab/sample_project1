import React, { useState, useEffect } from 'react';
import {
  Star,
  Send,
  UploadCloud,
  CheckCircle,
  Tag,
  Monitor,
  EyeOff,
  AlertCircle,
  Lightbulb,
  Bug,
  Layout,
  Gauge,
  HelpCircle,
  DollarSign,
  ArrowRight,
  FileText,
  X,
  User as UserIcon,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { FeedbackCategory, FeedbackPriority, FeedbackItem, User } from '../types';
import { addFeedback } from '../lib/storage';

export interface FeedbackFormProps {
  currentUser?: User | null;
  onSuccessNavigate?: () => void;
  onSubmitSuccess?: (createdItem: FeedbackItem) => void;
  onCancel?: () => void;
  variant?: 'page' | 'card' | 'compact' | 'drawer';
  title?: string;
  description?: string;
  initialValues?: Partial<{
    name: string;
    email: string;
    feedbackText: string;
    title: string;
    rating: number;
    category: FeedbackCategory;
    priority: FeedbackPriority;
    isAnonymous: boolean;
    tags: string[];
  }>;
  showCategorySelect?: boolean;
  showPrioritySelect?: boolean;
  showSubjectField?: boolean;
  allowAnonymous?: boolean;
  compact?: boolean;
}

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'feature', label: 'Feature Request', icon: <Lightbulb className="w-3.5 h-3.5" />, desc: 'Ideas and enhancements' },
  { id: 'bug', label: 'Bug Report', icon: <Bug className="w-3.5 h-3.5" />, desc: 'Something is broken or wrong' },
  { id: 'ui_ux', label: 'UI & UX Design', icon: <Layout className="w-3.5 h-3.5" />, desc: 'Layout, contrast, readability' },
  { id: 'performance', label: 'Performance', icon: <Gauge className="w-3.5 h-3.5" />, desc: 'Speed, latency, or responsiveness' },
  { id: 'pricing', label: 'Pricing & Plans', icon: <DollarSign className="w-3.5 h-3.5" />, desc: 'Cost, tiers, or billing feedback' },
  { id: 'general', label: 'General Praise/Note', icon: <HelpCircle className="w-3.5 h-3.5" />, desc: 'General thoughts and comments' },
];

const PRIORITIES: { id: FeedbackPriority; label: string; color: string }[] = [
  { id: 'low', label: 'Low', color: 'border-slate-300 text-slate-700 hover:border-slate-400' },
  { id: 'medium', label: 'Medium', color: 'border-blue-300 text-blue-700 hover:border-blue-400' },
  { id: 'high', label: 'High', color: 'border-amber-300 text-amber-700 hover:border-amber-400' },
  { id: 'urgent', label: 'Urgent', color: 'border-rose-300 text-rose-700 hover:border-rose-400' },
];

const SUGGESTED_TAGS = ['Mobile', 'Dashboard', 'Speed', 'Export', 'Navigation', 'Dark Mode', 'Design', 'API'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  currentUser = null,
  onSuccessNavigate,
  onSubmitSuccess,
  onCancel,
  variant = 'page',
  title: customTitle,
  description: customDescription,
  initialValues,
  showCategorySelect = true,
  showPrioritySelect = true,
  showSubjectField = true,
  allowAnonymous = true,
  compact = false,
}) => {
  // Field state
  const [name, setName] = useState<string>(
    initialValues?.name ?? currentUser?.name ?? ''
  );
  const [email, setEmail] = useState<string>(
    initialValues?.email ?? currentUser?.email ?? ''
  );
  const [feedbackText, setFeedbackText] = useState<string>(
    initialValues?.feedbackText ?? ''
  );
  const [subjectTitle, setSubjectTitle] = useState<string>(
    initialValues?.title ?? ''
  );
  const [rating, setRating] = useState<number>(initialValues?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>(
    initialValues?.category ?? 'feature'
  );
  const [priority, setPriority] = useState<FeedbackPriority>(
    initialValues?.priority ?? 'medium'
  );
  const [tags, setTags] = useState<string[]>(
    initialValues?.tags ?? ['Dashboard']
  );
  const [tagInput, setTagInput] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(
    initialValues?.isAnonymous ?? false
  );
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({
    name: false,
    email: false,
    feedbackText: false,
    rating: false,
    subjectTitle: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedItem, setSubmittedItem] = useState<FeedbackItem | null>(null);

  // Synchronize when currentUser changes if not touched
  useEffect(() => {
    if (currentUser && !touched.name && !name) {
      setName(currentUser.name);
    }
    if (currentUser && !touched.email && !email) {
      setEmail(currentUser.email);
    }
  }, [currentUser, touched.name, touched.email, name, email]);

  // Client-side validation function
  const validate = (fieldValues = { name, email, feedbackText, rating, subjectTitle }) => {
    const errs: Record<string, string> = {};

    // Name validation
    if (!fieldValues.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (fieldValues.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters long.';
    } else if (fieldValues.name.trim().length > 70) {
      errs.name = 'Name cannot exceed 70 characters.';
    }

    // Email validation
    if (!fieldValues.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(fieldValues.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    // Feedback text validation
    if (!fieldValues.feedbackText.trim()) {
      errs.feedbackText = 'Feedback message cannot be empty.';
    } else if (fieldValues.feedbackText.trim().length < 10) {
      errs.feedbackText = `Please provide more detail (at least 10 characters, current: ${fieldValues.feedbackText.trim().length}).`;
    } else if (fieldValues.feedbackText.trim().length > 1500) {
      errs.feedbackText = 'Feedback text cannot exceed 1500 characters.';
    }

    // Rating validation
    if (!fieldValues.rating || fieldValues.rating < 1 || fieldValues.rating > 5) {
      errs.rating = 'Please select a rating score between 1 and 5 stars.';
    }

    // Subject/Title validation (if enabled)
    if (showSubjectField && fieldValues.subjectTitle.trim().length > 100) {
      errs.subjectTitle = 'Subject title cannot exceed 100 characters.';
    }

    return errs;
  };

  // Re-run validation on field changes
  useEffect(() => {
    const validationErrors = validate({ name, email, feedbackText, rating, subjectTitle });
    setErrors(validationErrors);
  }, [name, email, feedbackText, rating, subjectTitle, showSubjectField]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 1:
        return '1 / 5 • Poor / Major Frustrations';
      case 2:
        return '2 / 5 • Fair / Needs Improvement';
      case 3:
        return '3 / 5 • Good / Meets Expectations';
      case 4:
        return '4 / 5 • Very Good / High Quality';
      case 5:
        return '5 / 5 • Excellent / Outstanding Experience';
      default:
        return 'Select a star rating';
    }
  };

  const handleAddTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !tags.includes(clean) && tags.length < 5) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    setTouched({
      name: true,
      email: true,
      feedbackText: true,
      rating: true,
      subjectTitle: true,
    });

    const validationErrors = validate({ name, email, feedbackText, rating, subjectTitle });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus first error element
      if (validationErrors.name) {
        document.getElementById('feedback-name-input')?.focus();
      } else if (validationErrors.email) {
        document.getElementById('feedback-email-input')?.focus();
      } else if (validationErrors.rating) {
        document.getElementById('feedback-star-1')?.focus();
      } else if (validationErrors.feedbackText) {
        document.getElementById('feedback-text-input')?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    const derivedTitle = subjectTitle.trim()
      ? subjectTitle.trim()
      : feedbackText.trim().slice(0, 60) + (feedbackText.trim().length > 60 ? '...' : '');

    const browserInfo = typeof navigator !== 'undefined'
      ? `${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'} / ${navigator.platform || 'Desktop'}`
      : 'Web Browser';

    setTimeout(() => {
      const newItem = addFeedback({
        title: derivedTitle,
        description: feedbackText.trim(),
        category,
        rating,
        priority,
        status: 'new',
        userId: isAnonymous ? undefined : currentUser?.id,
        userName: isAnonymous ? 'Anonymous Contributor' : name.trim(),
        userEmail: isAnonymous ? 'anonymous@portal.local' : email.trim().toLowerCase(),
        isAnonymous,
        tags,
        deviceInfo: browserInfo,
        attachmentName: attachmentName || undefined,
      });

      setSubmittedItem(newItem);
      setIsSubmitting(false);

      if (onSubmitSuccess) {
        onSubmitSuccess(newItem);
      }
    }, 350);
  };

  const handleResetForm = () => {
    setName(currentUser?.name ?? '');
    setEmail(currentUser?.email ?? '');
    setFeedbackText('');
    setSubjectTitle('');
    setRating(5);
    setCategory('feature');
    setPriority('medium');
    setTags(['Dashboard']);
    setAttachmentName(null);
    setSubmittedItem(null);
    setTouched({
      name: false,
      email: false,
      feedbackText: false,
      rating: false,
      subjectTitle: false,
    });
    setErrors({});
  };

  // SUCCESS CONFIRMATION VIEW
  if (submittedItem) {
    return (
      <div className={`mx-auto ${variant === 'compact' ? 'p-4' : 'max-w-2xl py-10 px-4 sm:px-6'}`}>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
            Feedback Submitted Successfully!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
            Thank you, <strong className="text-slate-800">{isAnonymous ? 'Anonymous Contributor' : name}</strong>. Your feedback has been verified and saved to local storage, updating the dashboard in real-time.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left max-w-lg mx-auto mb-6 text-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="font-mono font-medium text-slate-700">#{submittedItem.id}</span>
              <span className="capitalize px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Status: New
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{submittedItem.title}</h3>
            <p className="text-slate-600 line-clamp-2 mb-3">{submittedItem.description}</p>
            <div className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < submittedItem.rating ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                  }`}
                />
              ))}
              <span className="font-semibold text-slate-700 ml-1.5">{submittedItem.rating}/5 Stars</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onSuccessNavigate && (
              <button
                id="feedback-success-dashboard-btn"
                type="button"
                onClick={onSuccessNavigate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              id="feedback-submit-another-btn"
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
            >
              Submit Another Feedback
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs sm:text-sm font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isCompact = compact || variant === 'compact';

  return (
    <div
      className={`mx-auto ${
        variant === 'page'
          ? 'max-w-3xl py-8 px-4 sm:px-6'
          : variant === 'drawer'
          ? 'w-full p-4'
          : 'w-full max-w-3xl p-4 sm:p-6'
      }`}
    >
      {/* Form Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {customTitle || 'Share Your Feedback'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {customDescription ||
              'We value your honest opinion, feature requests, and bug reports. Every submission is reviewed.'}
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* 1. Rating Field (Explicitly Required with validation) */}
        <div
          className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
            touched.rating && errors.rating
              ? 'border-rose-300 ring-2 ring-rose-100'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1">
              <span>Overall Rating</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <span className="text-[11px] font-semibold text-slate-500">
              {rating > 0 ? `${rating} / 5` : 'Required'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mb-3">
            Rate your satisfaction with the product experience.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div
              role="radiogroup"
              aria-label="Rating score from 1 to 5 stars"
              className="flex items-center gap-1.5"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    id={`feedback-star-${star}`}
                    role="radio"
                    aria-checked={rating === star}
                    aria-label={`${star} Star${star > 1 ? 's' : ''}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      setRating(star);
                      handleBlur('rating');
                    }}
                    onFocus={() => handleBlur('rating')}
                    className="p-1.5 rounded-xl hover:bg-amber-50/80 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                          : 'text-slate-200 hover:text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-xs font-semibold text-amber-900 self-start sm:self-center">
              {getRatingLabel(hoverRating || rating)}
            </div>
          </div>

          {touched.rating && errors.rating && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.rating}</span>
            </div>
          )}
        </div>

        {/* 2. Author Details: Name & Email with Client-Side Validation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="feedback-name-input"
                className="block text-xs sm:text-sm font-bold text-slate-900 mb-1"
              >
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  id="feedback-name-input"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  aria-invalid={!!(touched.name && errors.name)}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border transition-colors focus:outline-none ${
                    touched.name && errors.name
                      ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : touched.name && !errors.name && name.trim()
                      ? 'border-emerald-300 bg-emerald-50/10 focus:border-slate-900'
                      : 'border-slate-200 bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
              </div>
              {touched.name && errors.name ? (
                <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Visible to reviewers unless anonymous mode is chosen.
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="feedback-email-input"
                className="block text-xs sm:text-sm font-bold text-slate-900 mb-1"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="feedback-email-input"
                  name="email"
                  type="email"
                  required
                  placeholder="e.g. alex@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={!!(touched.email && errors.email)}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border transition-colors focus:outline-none ${
                    touched.email && errors.email
                      ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                      : touched.email && !errors.email && email.trim()
                      ? 'border-emerald-300 bg-emerald-50/10 focus:border-slate-900'
                      : 'border-slate-200 bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
              </div>
              {touched.email && errors.email ? (
                <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Used for status update alerts or follow-ups.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. Feedback Text Field with validation and Live Character Counter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          {showSubjectField && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="feedback-title-input"
                  className="text-xs sm:text-sm font-bold text-slate-900"
                >
                  Feedback Subject / Headline
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {subjectTitle.length}/100
                </span>
              </div>
              <input
                id="feedback-title-input"
                type="text"
                maxLength={100}
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
                onBlur={() => handleBlur('subjectTitle')}
                placeholder="Brief summary (e.g. Add dark mode contrast toggle, or CSV export feature)"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="feedback-text-input"
                className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Detailed Feedback Text</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-mono ${
                    feedbackText.trim().length >= 10 ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {feedbackText.trim().length} / 1500 chars (min 10)
                </span>
              </div>
            </div>

            <textarea
              id="feedback-text-input"
              name="feedbackText"
              required
              rows={isCompact ? 3 : 4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              onBlur={() => handleBlur('feedbackText')}
              placeholder="What did you like? What was confusing or broken? How can we make this tool better for you? Please be as specific as possible..."
              aria-invalid={!!(touched.feedbackText && errors.feedbackText)}
              className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border transition-colors focus:outline-none resize-y min-h-[100px] ${
                touched.feedbackText && errors.feedbackText
                  ? 'border-rose-300 bg-rose-50/20 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-100'
                  : 'border-slate-200 bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
              }`}
            />

            {touched.feedbackText && errors.feedbackText ? (
              <p className="flex items-center gap-1.5 text-xs text-rose-600 mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.feedbackText}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Constructive feedback helps our product team prioritize fixes and updates.
              </p>
            )}
          </div>
        </div>

        {/* 4. Category & Priority Selection (Configurable via props) */}
        {showCategorySelect && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1">
              Category
            </label>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-3">
              Tag your feedback to the relevant department or theme.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    id={`feedback-cat-${cat.id}`}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate">{cat.label}</div>
                      {!isCompact && (
                        <div
                          className={`text-[10px] mt-0.5 truncate ${
                            isSelected ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {cat.desc}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {showPrioritySelect && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-1">
              Priority / Urgency
            </label>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-3">
              Indicate how critically this affects your daily usage.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    id={`feedback-priority-${p.id}`}
                    onClick={() => setPriority(p.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : `bg-white ${p.color}`
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Tags & Optional Attachment */}
        {!isCompact && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tags (Optional, up to 5)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                  >
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="feedback-custom-tag-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="Add custom tag (press Enter)..."
                  className="w-48 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1 mt-2 text-[11px] text-slate-500">
                <span className="mr-1 font-medium">Suggestions:</span>
                {SUGGESTED_TAGS.filter((st) => !tags.includes(st)).slice(0, 5).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleAddTag(st)}
                    className="px-2 py-0.5 bg-slate-50 hover:bg-slate-200 text-slate-600 rounded border border-slate-200"
                  >
                    +{st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Attachment (Screenshot or Debug Log)
              </label>
              <div className="border border-dashed border-slate-200 rounded-xl p-3.5 text-center hover:border-slate-300 transition-colors">
                {attachmentName ? (
                  <div className="flex items-center justify-between max-w-sm mx-auto bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{attachmentName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachmentName(null)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                      Upload trace or screenshot
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 5MB</p>
                    <input
                      id="feedback-file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileSimulate}
                      accept="image/*,.pdf,.txt"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. Anonymous toggle & Privacy info */}
        {allowAnonymous && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <input
                id="feedback-anonymous-toggle"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="feedback-anonymous-toggle" className="text-xs text-slate-700 cursor-pointer select-none">
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Submit Anonymously</span>
                </span>
                Hides your name and email on public dashboards while recording verified metrics.
              </label>
            </div>

            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 shrink-0 self-start sm:self-center">
              <Monitor className="w-3.5 h-3.5" />
              <span>LocalStorage Persisted</span>
            </div>
          </div>
        )}

        {/* Form Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            id="feedback-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving locally...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
