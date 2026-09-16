export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export type FeedbackCategory =
  | 'feature'
  | 'bug'
  | 'ui_ux'
  | 'performance'
  | 'general'
  | 'pricing';

export type FeedbackStatus =
  | 'new'
  | 'in_review'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface FeedbackComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  rating: number; // 1 - 5
  priority: FeedbackPriority;
  status: FeedbackStatus;
  userId?: string;
  userName: string;
  userEmail: string;
  isAnonymous: boolean;
  upvotes: number;
  upvotedBy: string[]; // user IDs or device IDs
  tags: string[];
  deviceInfo?: string;
  attachmentName?: string;
  comments: FeedbackComment[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackFilters {
  search: string;
  category: string; // 'all' or FeedbackCategory
  status: string; // 'all' or FeedbackStatus
  rating: number; // 0 for all, or 1-5
  priority: string; // 'all' or FeedbackPriority
  sortBy: 'newest' | 'oldest' | 'rating-high' | 'rating-low' | 'upvotes';
}

export type AppPage = 'dashboard' | 'form' | 'login' | 'register';
