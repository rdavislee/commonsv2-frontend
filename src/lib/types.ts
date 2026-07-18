// Type definitions for the Commons API

export interface User {
  _id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  _id: string;
  userId: string;
  username: string;
  name: string;
  bio: string;
  bioImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeResponse {
  userId: string;
  email: string;
  isAdmin: boolean;
}

export interface AuthorSummary {
  _id: string;
  username: string;
  name: string;
  bioImageUrl: string;
}

export interface PostContent {
  caption: string;
  imageUrl: string | null;
  supportersOnly: boolean;
}

export type ModerationStatus =
  | 'pending'
  | 'approved'
  | 'flagged'
  | 'admin_approved'
  | 'admin_removed';

export type ModerationRule =
  | 'harassment'
  | 'hate'
  | 'sexually_explicit'
  | 'spam';

export interface Post {
  _id: string;
  authorId: string | null;
  author: AuthorSummary | null;
  content: PostContent;
  type: 'image';
  isLocked: boolean;
  isLiked: boolean;
  isOwner: boolean;
  likeCount: number;
  commentCount: number;
  moderationStatus: ModerationStatus;
  moderationRuleViolated: ModerationRule | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  item: string;
  authorId: string | null;
  author: AuthorSummary | null;
  content: string;
  isOwner: boolean;
  moderationStatus: ModerationStatus;
  moderationRuleViolated: ModerationRule | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  actorId: string;
  actor: { _id: string; username: string; name: string; bioImageUrl: string } | null;
  type: 'like' | 'comment' | 'follow';
  targetPostId: string | null;
  targetPost: { _id: string; caption: string; imageUrl: string | null } | null;
  read: boolean;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  userId: string | null;
  status:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'incomplete'
    | 'pending';
  planId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  userId: string;
  displayName: string;
  avatarUrl: string;
  joinedAt: string;
  followerCount: number;
}

export interface ModerationQueueItem {
  reviewId: string;
  targetType: 'post' | 'comment';
  targetId: string;
  authorId: string | null;
  author: AuthorSummary | null;
  status: ModerationStatus;
  ruleViolated: ModerationRule | null;
  rationale: string;
  content: {
    caption?: string;
    imageUrl?: string | null;
    supportersOnly?: boolean;
    text?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminPrincipal {
  subject: string;
  source: 'root' | 'promoted';
  createdAt: string;
}

export interface AuthResponse {
  user?: User;
  admin?: AdminPrincipal;
  accessToken: string;
  refreshToken: string;
}

export interface MeProfileResponse {
  profile: Profile;
  followerCount: number;
  followingCount: number;
  hasActiveSubscription: boolean;
}

export interface UserProfileResponse {
  profile: Profile;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  posts: Post[];
}

export interface PostsListResponse {
  posts: Post[];
  nextCursor: string | number | null;
}

export interface PostDetailResponse {
  post: Post;
  comments: Comment[];
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface SubscriptionResponse {
  subscription: Subscription | null;
  hasActiveAccess: boolean;
}

export interface ModerationQueueResponse {
  items: ModerationQueueItem[];
}

export interface MembersResponse {
  members: Member[];
}

export interface ProfilesSearchResponse {
  profiles: Profile[];
}