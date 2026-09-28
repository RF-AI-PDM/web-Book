export interface Chapter {
  id: string;
  number: number;
  title: string;
  readTimeMinutes: number;
  content: string[];
  keyQuote?: string;
  actionItem?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  readTimeMinutes: number;
  subtitle: string;
  description: string;
  coverColor: string;
  coverAccent: string;
  coverIcon?: string;
  badge?: string;
  publishedYear?: number;
  chapters: Chapter[];
  isPremium?: boolean;
  previewChaptersCount?: number;
  uploadedBy?: 'admin' | 'user';
  uploadedAt?: string;
  fileType?: string;
  price?: number;
  hasSubcollectionChapters?: boolean;
}

export interface Annotation {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  selectedText: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'orange';
  note?: string;
  createdAt: string;
  isShared?: boolean; // Private by default (false)
  isAnonymous?: boolean;
}

export interface SharedHighlight {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  selectedText: string;
  note?: string;
  color: 'yellow' | 'green' | 'blue' | 'purple' | 'orange';
  userId: string;
  userDisplayName?: string;
  userPhotoURL?: string;
  isAnonymous?: boolean;
  likesCount: number;
  likedBy: string[]; // List of user IDs who liked this quote
  createdAt: string;
}

export interface SavedBook {
  bookId: string;
  title: string;
  author: string;
  category: string;
  progress: number; // 0 to 100
  currentChapterId: string;
  currentChapterTitle: string;
  completed: boolean;
  savedAt: string;
  lastReadAt: string;
}

export interface ReadingStats {
  completedCount: number;
  totalNotesCount: number;
  favoriteTopic: string;
  joinedDate: string;
}

export interface ReadingGoal {
  targetMinutesPerDay: number; // e.g. 15, 20, 30
  mode: 'daily' | 'weekly';
  weeklyTargetDays?: number; // e.g. 7
}

export interface DayReadingLog {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export type ReaderTheme = 'dark' | 'sepia' | 'light' | 'cream' | 'sage' | 'midnight';
export type ReaderFontSize = 'xs' | 'small' | 'standard' | 'large' | 'xl';
export type ReaderFontFamily = 'newsreader' | 'jakarta' | 'merriweather' | 'mono' | 'literata';
export type ReaderLineHeight = 'compact' | 'standard' | 'relaxed';

export type BookSortOption = 
  | 'title-asc' 
  | 'title-desc' 
  | 'author-asc' 
  | 'author-desc' 
  | 'recent' 
  | 'progress' 
  | 'duration';

export type CloudSyncStatus = 'synced' | 'syncing' | 'offline' | 'local_only' | 'error';

export interface UserBadge {
  id: string;
  name: string;
  nameId: string;
  description: string;
  category: 'time' | 'speed' | 'habit' | 'depth' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  criteria: string;
  currentProgress: number;
  targetProgress: number;
  progressUnit: string;
}

export interface ReadingReminderSchedule {
  enabled: boolean;
  time: string; // "HH:mm" e.g. "20:30"
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  customMessage: string;
  soundEnabled: boolean;
  lastNotifiedDate?: string; // YYYY-MM-DD to prevent duplicate notifications on the same day
}

export interface PomodoroConfig {
  focusMinutes: number; // default 15
  breakMinutes: number; // default 5
  soundEnabled: boolean;
  autoLogProgress: boolean;
}

export type SubscriptionTier = 'free' | 'vip_monthly' | 'vip_yearly';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  isActive: boolean;
  startedAt?: string;
  expiresAt?: string;
  paymentMethod?: string;
  orderId?: string;
}

export type PaymentMethodType = 'qris' | 'gopay' | 'ovo' | 'bca_va' | 'mandiri_va' | 'bri_va';

