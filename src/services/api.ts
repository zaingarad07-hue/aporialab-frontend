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

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  token?: string;
  user?: {
    id?: string;
    _id?: string;
    name: string;
    email?: string;
    avatar?: string;
    bio?: string;
    reputation?: number;
    role?: string;
    isFoundingMember?: boolean;
    authProvider?: string;
    emailVerified?: boolean;
    discussionCount?: number;
    createdAt?: string;
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

const FALLBACK_DISCUSSIONS: DiscussionDetail[] = [
  {
    _id: 'fallback1',
    title: 'هل الديمقراطية النظام الأمثل للحكم في العالم العربي؟',
    content: 'نقاش مفتوح حول إمكانية تطبيق الديمقراطية في السياق العربي',
    category: 'advanced',
    tags: ['سياسة', 'ديمقراطية'],
    author: { _id: '0', name: 'نورة السعيد', reputation: 300 },
    views: 1240,
    upvotes: [],
    commentCount: 47,
    createdAt: new Date().toISOString()
  }
];

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

  async getDiscussions(filters?: { filter?: string; level?: string; sort?: string; page?: number }): Promise<ApiResponse<DiscussionData>> {
    try {
      const params = new URLSearchParams();
      if (filters?.filter) params.append('filter', filters.filter);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.page) params.append('page', filters.page.toString());
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(`${this.baseUrl}/api/discussions?${params}`, {
        headers: this.getHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return this.handleResponse(response);
    } catch (error) {
      return {
        success: true,
        data: { discussions: FALLBACK_DISCUSSIONS, pagination: { page: 1, pages: 1, total: FALLBACK_DISCUSSIONS.length } }
      } as ApiResponse<DiscussionData>;
    }
  }

  async getDiscussion(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async getDiscussionHistory(id: string): Promise<DiscussionHistoryResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}/history`, { headers: this.getHeaders() });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'فشل جلب السجل');
    return data;
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

  async getCircles(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/circles`, { headers: this.getHeaders() });
      return this.handleResponse(response);
    } catch {
      return { success: true, data: [] } as ApiResponse;
    }
  }

  async getCircle(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${id}`, { headers: this.getHeaders() });
    return this.handleResponse(response);
  }

  async joinCircle(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${id}/join`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

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

  async updateProfile(profile: { name?: string; bio?: string; avatar?: string }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profile),
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
}

export const api = new ApiService();
