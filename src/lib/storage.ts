import { FeedbackItem, User, FeedbackComment } from '../types';

const USERS_STORAGE_KEY = 'fp_users_v1';
const CURRENT_USER_KEY = 'fp_current_user_v1';
const FEEDBACKS_STORAGE_KEY = 'fp_feedbacks_v1';

// Seed default users
const DEFAULT_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-admin-1',
    name: 'Sarah Chen (Lead PM)',
    email: 'admin@feedbackportal.com',
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: 'admin123',
  },
  {
    id: 'user-member-1',
    name: 'Alex Rivera',
    email: 'alex@company.com',
    role: 'user',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: 'demo123',
  },
];

// Initial realistic feedback items
const DEFAULT_FEEDBACKS: FeedbackItem[] = [
  {
    id: 'fb-101',
    title: 'Dark mode contrast in table cells is slightly low',
    description:
      'When reviewing detailed reports in dark mode, the secondary text headers and muted status badges have insufficient contrast ratio against the slate background. Bumping to 4.5:1 would greatly improve accessibility.',
    category: 'ui_ux',
    rating: 4,
    priority: 'medium',
    status: 'in_progress',
    userId: 'user-member-1',
    userName: 'Alex Rivera',
    userEmail: 'alex@company.com',
    isAnonymous: false,
    upvotes: 14,
    upvotedBy: ['user-admin-1', 'user-member-1'],
    tags: ['Dark Mode', 'Accessibility', 'Contrast'],
    deviceInfo: 'Chrome 128 / macOS Sequoia',
    comments: [
      {
        id: 'c-1',
        authorId: 'user-admin-1',
        authorName: 'Sarah Chen',
        authorRole: 'admin',
        text: 'Thanks Alex! Our design systems team already has an updated palette token in the pipeline for this.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-102',
    title: 'Export to CSV and spreadsheet format option',
    description:
      'We need a quick one-click export button on the feedback list view to share weekly customer sentiments with executive stakeholders without manual copy-pasting.',
    category: 'feature',
    rating: 5,
    priority: 'high',
    status: 'resolved',
    userName: 'Anonymous Customer',
    userEmail: 'anonymous@guest.com',
    isAnonymous: true,
    upvotes: 28,
    upvotedBy: ['user-member-1'],
    tags: ['Export', 'Reports', 'Analytics'],
    deviceInfo: 'Firefox 129 / Windows 11',
    comments: [
      {
        id: 'c-2',
        authorId: 'user-admin-1',
        authorName: 'Sarah Chen',
        authorRole: 'admin',
        text: 'Shipped! You can now export filtered lists to CSV and JSON directly from the dashboard toolbar.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-103',
    title: 'Intermittent lag when submitting forms with attachments',
    description:
      'Submitting forms with attached image files larger than 2MB causes a 3-second UI freeze before the success modal shows. An optimistic progress bar would be much smoother.',
    category: 'performance',
    rating: 3,
    priority: 'urgent',
    status: 'in_review',
    userId: 'user-member-1',
    userName: 'Alex Rivera',
    userEmail: 'alex@company.com',
    isAnonymous: false,
    upvotes: 9,
    upvotedBy: [],
    tags: ['Performance', 'Uploads', 'UX'],
    deviceInfo: 'Safari 17 / iPadOS',
    attachmentName: 'trace_log_2026.png',
    comments: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-104',
    title: 'Add support for team-based tags and custom category tagging',
    description:
      'We have multiple departments (Billing, Platform, Mobile, Growth) reviewing feedback. Allowing custom category or team tagging will make routing items so much faster.',
    category: 'feature',
    rating: 5,
    priority: 'medium',
    status: 'new',
    userName: 'Jordan Lee',
    userEmail: 'jordan.lee@fintech.io',
    isAnonymous: false,
    upvotes: 19,
    upvotedBy: ['user-admin-1'],
    tags: ['Teams', 'Tagging', 'Workflow'],
    deviceInfo: 'Edge 127 / Windows 10',
    comments: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-105',
    title: 'Loving the clean typography and responsiveness!',
    description:
      'The new design layout is snappy and very easy to navigate on mobile. Kudos to the engineering and product design team for prioritizing simplicity over clutter.',
    category: 'general',
    rating: 5,
    priority: 'low',
    status: 'resolved',
    userName: 'Elena Rostova',
    userEmail: 'elena@studio.design',
    isAnonymous: false,
    upvotes: 31,
    upvotedBy: ['user-admin-1', 'user-member-1'],
    tags: ['Praise', 'Mobile', 'Design'],
    deviceInfo: 'Mobile Safari / iOS 18',
    comments: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-106',
    title: 'Dropdown menu clips behind header on narrow screens',
    description:
      'On viewport width below 640px, opening the sort dropdown caused it to get clipped by the sticky navigation container z-index. Should be elevated.',
    category: 'bug',
    rating: 2,
    priority: 'high',
    status: 'closed',
    userName: 'Marcus Aurel',
    userEmail: 'marcus@cloud.net',
    isAnonymous: false,
    upvotes: 6,
    upvotedBy: [],
    tags: ['Mobile Bug', 'Z-Index', 'CSS'],
    deviceInfo: 'Chrome Mobile / Android 14',
    comments: [
      {
        id: 'c-3',
        authorId: 'user-admin-1',
        authorName: 'Sarah Chen',
        authorRole: 'admin',
        text: 'Fixed in the latest patch with standard z-index stacking context.',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// User Storage Management
export function getStoredUsers(): (User & { passwordHash: string })[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read users from localStorage', e);
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: (User & { passwordHash: string })[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      // Default to demo user if not logged in for instant seamless testing
      const defaultUser: User = {
        id: DEFAULT_USERS[1].id,
        name: DEFAULT_USERS[1].name,
        email: DEFAULT_USERS[1].email,
        role: DEFAULT_USERS[1].role,
        createdAt: DEFAULT_USERS[1].createdAt,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read current user from localStorage', e);
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to update current user in localStorage', e);
  }
}

export function loginUser(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers();
  const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!found) {
    return { success: false, error: 'No account found with this email address.' };
  }
  if (found.passwordHash !== password) {
    return { success: false, error: 'Incorrect password. (Try demo123 or admin123)' };
  }
  const cleanUser: User = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role,
    avatarUrl: found.avatarUrl,
    createdAt: found.createdAt,
  };
  setCurrentUser(cleanUser);
  return { success: true, user: cleanUser };
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'user' = 'user'
): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }
  const newUserRecord = {
    id: 'user-' + Date.now().toString(36),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    createdAt: new Date().toISOString(),
    passwordHash: password,
  };
  users.push(newUserRecord);
  saveStoredUsers(users);

  const cleanUser: User = {
    id: newUserRecord.id,
    name: newUserRecord.name,
    email: newUserRecord.email,
    role: newUserRecord.role,
    createdAt: newUserRecord.createdAt,
  };
  setCurrentUser(cleanUser);
  return { success: true, user: cleanUser };
}

// Feedbacks Storage Management
export function getFeedbacks(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(FEEDBACKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(DEFAULT_FEEDBACKS));
      return DEFAULT_FEEDBACKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_FEEDBACKS;
  } catch (e) {
    console.error('Failed to read feedbacks from localStorage', e);
    return DEFAULT_FEEDBACKS;
  }
}

export function saveFeedbacks(feedbacks: FeedbackItem[]) {
  try {
    localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(feedbacks));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('feedback_updated', { detail: { count: feedbacks.length } }));
    }
  } catch (e) {
    console.error('Failed to save feedbacks to localStorage', e);
  }
}

export function subscribeToFeedbackUpdates(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleCustom = () => callback();
  const handleStorage = (e: StorageEvent) => {
    if (e.key === FEEDBACKS_STORAGE_KEY || e.key === CURRENT_USER_KEY || !e.key) {
      callback();
    }
  };
  window.addEventListener('feedback_updated', handleCustom);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('feedback_updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

export function addFeedback(item: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedBy' | 'comments'>): FeedbackItem {
  const feedbacks = getFeedbacks();
  const now = new Date().toISOString();
  const newItem: FeedbackItem = {
    ...item,
    id: 'fb-' + Date.now().toString(36),
    upvotes: 1,
    upvotedBy: item.userId ? [item.userId] : ['anonymous-creator'],
    comments: [],
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newItem, ...feedbacks];
  saveFeedbacks(updated);
  return newItem;
}

export function updateFeedbackStatus(id: string, newStatus: FeedbackItem['status']): FeedbackItem | null {
  const feedbacks = getFeedbacks();
  const index = feedbacks.findIndex((f) => f.id === id);
  if (index === -1) return null;

  feedbacks[index] = {
    ...feedbacks[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
  saveFeedbacks(feedbacks);
  return feedbacks[index];
}

export function deleteFeedback(id: string): boolean {
  const feedbacks = getFeedbacks();
  const filtered = feedbacks.filter((f) => f.id !== id);
  if (filtered.length === feedbacks.length) return false;
  saveFeedbacks(filtered);
  return true;
}

export function toggleFeedbackUpvote(id: string, voterIdentifier: string): FeedbackItem | null {
  const feedbacks = getFeedbacks();
  const index = feedbacks.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const item = feedbacks[index];
  const hasUpvoted = item.upvotedBy.includes(voterIdentifier);

  const updatedUpvotedBy = hasUpvoted
    ? item.upvotedBy.filter((uid) => uid !== voterIdentifier)
    : [...item.upvotedBy, voterIdentifier];

  const updatedVotes = updatedUpvotedBy.length;

  feedbacks[index] = {
    ...item,
    upvotes: updatedVotes,
    upvotedBy: updatedUpvotedBy,
  };
  saveFeedbacks(feedbacks);
  return feedbacks[index];
}

export function addFeedbackComment(
  feedbackId: string,
  comment: Omit<FeedbackComment, 'id' | 'createdAt'>
): FeedbackComment | null {
  const feedbacks = getFeedbacks();
  const index = feedbacks.findIndex((f) => f.id === feedbackId);
  if (index === -1) return null;

  const newComment: FeedbackComment = {
    ...comment,
    id: 'c-' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };

  feedbacks[index] = {
    ...feedbacks[index],
    comments: [...feedbacks[index].comments, newComment],
    updatedAt: new Date().toISOString(),
  };
  saveFeedbacks(feedbacks);
  return newComment;
}

export function resetAllDataToDefault() {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  localStorage.setItem(FEEDBACKS_STORAGE_KEY, JSON.stringify(DEFAULT_FEEDBACKS));
  const member = DEFAULT_USERS[1];
  const cleanUser: User = {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    createdAt: member.createdAt,
  };
  setCurrentUser(cleanUser);
}
