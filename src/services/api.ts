const rawApiUrl = import.meta.env.VITE_API_URL || 'https://aporialab-backend.vercel.app';
const API_BASE_URL = rawApiUrl?.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;

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
    discussionCount?: number;
    createdAt?: string;
  };
  discussion?: DiscussionDetail;
  discussions?: DiscussionDetail[];
  comment?: Comment;
  upvotesCount?: number;
  liked?: boolean;
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
  };
  upvotes: string[];
  createdAt: string;
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
  };
  views: number;
  upvotes: string[];
  commentCount: number;
  comments?: Comment[];
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

  async createDiscussion(discussion: { title: string; content: string; level: string; tags: string[] }): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(discussion),
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

  async addComment(discussionId: string, content: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${discussionId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
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
}

export const api = new ApiService();
