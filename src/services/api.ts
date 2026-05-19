const rawApiUrl = import.meta.env.VITE_API_URL || 'https://aporialab-backend.vercel.app';
const API_BASE_URL = rawApiUrl?.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;

export type Stance = 'pro' | 'con' | 'neutral';
export type ReactionType = 'logical' | 'illogical' | 'inspiring' | 'unclear';
export type DiscussionDuration = '12h' | '24h' | '3d' | '7d' | null;

export interface PlatformStats {
  users: number;
  discussions: number;
  circles: number;
  comments: number;
  contributions: number;
}

export interface SearchUser {
  id: string;
  _id: string;
  name: string;
  avatar?: string;
  bio?: string;
  reputation?: number;
  role?: string;
  isFoundingMember?: boolean;
}

export interface SearchResponse {
  success: boolean;
  query?: string;
  discussions: DiscussionDetail[];
  users: SearchUser[];
  message?: string;
}

export interface CommentReactions {
  logical: string[];
  illogical: string[];
  inspiring: string[];
  unclear: string[];
}

export interface EditHistoryEntry {
  editedAt: string;
  editedBy: {
    _id: string;
    name: string;
  };
  previousTitle?: string;
  previousContent?: string;
  reason?: string;
}

export interface DiscussionHistoryResponse {
  success: boolean;
  editHistory: EditHistoryEntry[];
  editsCount: number;
  editedAt?: string | null;
  currentTitle: string;
  currentContent: string;
}

export interface PendingRequest {
  userId: string;
  userName: string;
  userAvatar?: string;
  requestedAt: string;
  message?: string;
}

export interface Circle {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  members: number;
  isPrivate: boolean;
  icon?: string;
  color?: string;
  bannerColor?: string;
  tags?: string[];
  memberIds: string[];
  pendingRequests?: PendingRequest[];
  discussionCount?: number;
  createdBy?: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CirclesResponse {
  success: boolean;
  circles: Circle[];
  message?: string;
}

export interface CircleResponse {
  success: boolean;
  circle?: Circle;
  message?: string;
}

export interface JoinCircleResponse {
  success: boolean;
  joined?: boolean;
  status?: 'pending' | 'joined' | 'left';
  members?: number;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
    pagination?: {
    page: number;
    pages: number;
    total: number;
  };
  message?: string;
  errors?: string[];
  token?: string;
  user?: {
    id?: string;
    _id?: string;
    username?: string | null;
    name: string;
    email?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    reputation?: number;
    role?: string;
    isFoundingMember?: boolean;
    authProvider?: string;
    emailVerified?: boolean;
    discussionCount?: number;
    createdAt?: string;
    notificationPreferences?: NotificationPreferences;
  };
  discussion?: DiscussionDetail;
  discussions?: DiscussionDetail[];
  comment?: Comment;
  upvotesCount?: number;
  upvoted?: boolean;
  liked?: boolean;
  qualityScore?: number;
  reactionType?: ReactionType;
  active?: boolean;
  removedReactionType?: ReactionType | null;
  counts?: {
    logical: number;
    illogical: number;
    inspiring: number;
    unclear: number;
  };
  stats?: PlatformStats;
}

export interface Comment {
  _id: string;
  discussionId: string;
  content: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    reputation?: number;
    isFoundingMember?: boolean;
  };
  stance: Stance;
  upvotes: string[];
  reactions: CommentReactions;
  qualityScore: number;
  parentCommentId?: string | null;
  isReply?: boolean;
  editedAt?: string | null;
  createdAt: string;
}

export interface StanceStats {
  pro: number;
  con: number;
  neutral: number;
}

export interface DiscussionDetail {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    avatar?: string;
    reputation?: number;
    isFoundingMember?: boolean;
  };
  views: number;
  upvotes: string[];
  commentCount: number;
  comments?: Comment[];
  duration?: DiscussionDuration;
  expiresAt?: string | null;
  isExpired?: boolean;
  stanceStats?: StanceStats;
  editedAt?: string | null;
  editsCount?: number;
  createdAt: string;
}

export interface DiscussionData {
  discussions: DiscussionDetail[];
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

export type AudioRoomStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface AudioRoomHost {
  _id: string | null;
  name?: string;
  avatar?: string;
  isFoundingMember?: boolean;
}

export interface AudioRoom {
  _id: string;
  discussionId: string | null;
  host: AudioRoomHost | null;
  title: string;
  description: string;
  scheduledAt: string;
  status: AudioRoomStatus;
  startedAt?: string | null;
  endedAt?: string | null;
  recordingUrl?: string | null;
  livekitRoomName?: string | null;
  maxParticipants: number;
  rsvpedUserIds: string[];
  rsvpCount: number;
  attendeesPeakCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'comment'
  | 'reply'
  | 'discussion_upvote'
  | 'comment_upvote'
  | 'reaction_logical'
  | 'reaction_inspiring'
  | 'circle_join_request'
  | 'circle_approved'
  | 'circle_rejected';

export type NotificationPreferences = Record<NotificationType, boolean>;

export type NotificationFilter =
  | 'all'
  | 'unread'
  | 'comment'
  | 'reply'
  | 'upvote'
  | 'reaction'
  | 'circle';

export interface NotificationSender {
  _id: string | null;
  name: string;
  avatar: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  sender: NotificationSender | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  metadata: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: NotificationItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

class ApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'حدث خطأ ما');
    return data;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await this.handleResponse(response);
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const data = await this.handleResponse(response);
    if (data.token) this.setToken(data.token);
    return data;
  }

  async loginWithGoogle(credential: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ credential }),
    });
    const data = await this.handleResponse(response);
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getDiscussions(filters?: { filter?: string; level?: string; sort?: string; page?: number; q?: string; limit?: number }): Promise<ApiResponse<DiscussionData>> {
    const params = new URLSearchParams();
    if (filters?.filter) params.append('filter', filters.filter);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.q) params.append('q', filters.q);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${this.baseUrl}/api/discussions?${params}`, {
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      return this.handleResponse(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getDiscussion(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getFeaturedDiscussions(limit?: number): Promise<ApiResponse<{ discussions: DiscussionDetail[] }>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const response = await fetch(`${this.baseUrl}/api/discussions/featured?${params}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async sendPresenceHeartbeat(discussionId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/discussions/${discussionId}/heartbeat`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch {
      // Heartbeat is fire-and-forget; failures are intentionally silent.
    }
  }

  async getDiscussionsPresence(ids: string[]): Promise<{ success: boolean; counts: Record<string, number> }> {
    if (ids.length === 0) return { success: true, counts: {} };
    const params = new URLSearchParams({ ids: ids.join(',') });
    const response = await fetch(`${this.baseUrl}/api/discussions/presence-batch?${params}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) return { success: false, counts: {} };
    const data = await response.json();
    return { success: !!data.success, counts: data.counts || {} };
  }

  async getDiscussionHistory(id: string): Promise<DiscussionHistoryResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}/history`, { headers: this.getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل جلب السجل');
    return data;
  }

  async scheduleRoom(discussionId: string, payload: {
    title: string;
    description?: string;
    scheduledAt: string;
    maxParticipants?: number;
  }): Promise<ApiResponse<{ room: AudioRoom }>> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${discussionId}/rooms`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    return this.handleResponse(response);
  }

  async getRooms(filters?: { status?: string; limit?: number }): Promise<ApiResponse<{ rooms: AudioRoom[] }>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const response = await fetch(`${this.baseUrl}/api/rooms?${params}`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getDiscussionRooms(discussionId: string): Promise<ApiResponse<{ rooms: AudioRoom[] }>> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${discussionId}/rooms`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getRoom(id: string): Promise<ApiResponse<{ room: AudioRoom }>> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async toggleRoomRsvp(id: string): Promise<ApiResponse<{ room: AudioRoom; isRsvped: boolean }>> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${id}/rsvp`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async cancelRoom(id: string): Promise<ApiResponse<{ room: AudioRoom }>> {
    const response = await fetch(`${this.baseUrl}/api/rooms/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createDiscussion(discussion: { 
    title: string; 
    content: string; 
    level: string; 
    tags: string[];
    duration?: DiscussionDuration;
  }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(discussion),
    });
    return this.handleResponse(response);
  }

  async editDiscussion(id: string, updates: { title?: string; content?: string; reason?: string }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return this.handleResponse(response);
  }

  async deleteDiscussion(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async likeDiscussion(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}/like`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async addComment(discussionId: string, content: string, stance: Stance, parentCommentId?: string | null): Promise<ApiResponse> {
    const body: { content: string; stance: Stance; parentCommentId?: string } = { content, stance };
    if (parentCommentId) body.parentCommentId = parentCommentId;
    
    const response = await fetch(`${this.baseUrl}/api/discussions/${discussionId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async editComment(commentId: string, content: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/comments/${commentId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
    });
    return this.handleResponse(response);
  }

  async upvoteComment(commentId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/comments/${commentId}/upvote`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async reactToComment(commentId: string, type: ReactionType): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/comments/${commentId}/react`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ type }),
    });
    return this.handleResponse(response);
  }

  async deleteComment(commentId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ============================
  // CIRCLES ENDPOINTS (v4.1)
  // ============================
  
  async getCircles(): Promise<CirclesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/circles`, { headers: this.getHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'فشل تحميل الدوائر');
      return data;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'فشل تحميل الدوائر';
      return { success: false, circles: [], message: msg };
    }
  }

  async getCircle(id: string): Promise<CircleResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${id}`, { headers: this.getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل تحميل الدائرة');
    return data;
  }

  async createCircle(payload: {
    name: string;
    description?: string;
    category?: string;
    isPrivate?: boolean;
    icon?: string;
    color?: string;
    tags?: string[];
  }): Promise<CircleResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل إنشاء الدائرة');
    return data;
  }

  async joinCircle(id: string, message?: string): Promise<JoinCircleResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${id}/join`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(message ? { message } : {}),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل الانضمام');
    return data;
  }

  async approveCircleRequest(circleId: string, userId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${circleId}/approve/${userId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async rejectCircleRequest(circleId: string, userId: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${circleId}/reject/${userId}`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ============================
  // USERS & PROFILE
  // ============================

  async getLeaderboard(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/leaderboard`, { headers: this.getHeaders() });
      return this.handleResponse(response);
    } catch {
      return { success: true, data: [] } as ApiResponse;
    }
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/profile`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async updateProfile(profile: { name?: string; bio?: string; avatar?: string; location?: string; website?: string }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profile),
    });
    return this.handleResponse(response);
  }

  async getAvatarUploadSignature(): Promise<{
    success: boolean;
    signature?: string;
    timestamp?: number;
    apiKey?: string;
    cloudName?: string;
    folder?: string;
    publicId?: string;
    message?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/users/avatar/signature`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async updateAvatar(avatarUrl: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/avatar`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ avatarUrl }),
    });
    return this.handleResponse(response);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/change-password`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return this.handleResponse(response);
  }

  async updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/notification-preferences`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(prefs),
    });
    return this.handleResponse(response);
  }

  async checkUsername(username: string): Promise<{ success: boolean; available?: boolean; reason?: string; username?: string }> {
    const response = await fetch(`${this.baseUrl}/api/users/check-username?username=${encodeURIComponent(username)}`);
    return response.json();
  }

  async updateUsername(username: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/username`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ username }),
    });
    return this.handleResponse(response);
  }

  async getUserById(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getStats(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`, { headers: this.getHeaders() });
      return this.handleResponse(response);
    } catch {
      return {
        success: true,
        stats: { users: 0, discussions: 0, circles: 0, comments: 0, contributions: 0 }
      } as ApiResponse;
    }
  }

  async search(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/search?q=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'خطأ في البحث');
      return data;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'خطأ في البحث';
      return { success: false, discussions: [], users: [], message: msg };
    }
  }

  async getNotifications(filter: NotificationFilter = 'all', page = 1, limit = 20): Promise<NotificationsResponse> {
    const params = new URLSearchParams({ filter, page: page.toString(), limit: limit.toString() });
    const response = await fetch(`${this.baseUrl}/api/notifications?${params}`, { headers: this.getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل تحميل الإشعارات');
    return data;
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const response = await fetch(`${this.baseUrl}/api/notifications/unread-count`, { headers: this.getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل جلب العدّاد');
    return data;
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsRead(): Promise<ApiResponse<{ modifiedCount: number }>> {
    const response = await fetch(`${this.baseUrl}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/notifications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiService();
