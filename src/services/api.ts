/**
 * Copyright (c) 2026 AporiaLab
 * جميع الحقوق محفوظة
 * 
 * FIXED: إصلاح مشكلة تكرار /api في URL
 */

// إزالة /api من نهاية URL إذا كانت موجودة لتجنب التكرار
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://aporialab-api.vercel.app';
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
    email: string;
    avatar?: string;
    bio?: string;
    reputation?: number;
    role?: string;
  };
}

export interface DiscussionData {
  discussions: Array<{
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
    createdAt: string;
  }>;
  pagination: {
    page: number;
    pages: number;
    total: number;
  };
}

// ===== FALLBACK DATA (عند عدم اتصال Backend) =====
const FALLBACK_DISCUSSIONS = [
  {
    _id: 'd1',
    title: 'هل الديمقراطية النظام الأمثل للحكم في العالم العربي؟',
    content: 'نقاش مفتوح حول إمكانية تطبيق الديمقراطية في السياق العربي مع مراعاة الخصوصية الثقافية والدينية والتاريخية',
    category: 'advanced',
    tags: ['سياسة', 'ديمقراطية', 'حوكمة'],
    author: { _id: '4', name: 'نورة السعيد', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noura', reputation: 300 },
    views: 1240,
    upvotes: ['1', '2', '3'],
    commentCount: 47,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'd2',
    title: 'الذكاء الاصطناعي والأخلاق: أين نضع الحدود؟',
    content: 'مع تسارع تطور الذكاء الاصطناعي، كيف نضمن أنه يخدم الإنسانية دون أن يهدد قيمنا وحقوقنا الأساسية؟',
    category: 'intermediate',
    tags: ['تكنولوجيا', 'أخلاق', 'ذكاء اصطناعي'],
    author: { _id: '2', name: 'سارة محمد', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara', reputation: 200 },
    views: 892,
    upvotes: ['1', '4'],
    commentCount: 33,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'd3',
    title: 'هل التعليم التقليدي كافٍ في عصر المعلومات؟',
    content: 'مناقشة جدية حول مدى ملاءمة مناهج التعليم الحالية لمتطلبات سوق العمل والحياة في القرن الحادي والعشرين',
    category: 'beginner',
    tags: ['تعليم', 'مستقبل', 'شباب'],
    author: { _id: '1', name: 'أحمد الفيصل', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed', reputation: 150 },
    views: 654,
    upvotes: ['2', '3', '5'],
    commentCount: 28,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'd4',
    title: 'الهوية الثقافية في زمن العولمة',
    content: 'كيف نحافظ على هويتنا وموروثنا الثقافي في ظل موجة العولمة المتسارعة وانفتاح العالم؟',
    category: 'advanced',
    tags: ['ثقافة', 'هوية', 'عولمة'],
    author: { _id: '3', name: 'خالد العمري', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khaled', reputation: 180 },
    views: 445,
    upvotes: ['1'],
    commentCount: 19,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'd5',
    title: 'أزمة المناخ: مسؤولية الأفراد أم الحكومات؟',
    content: 'نقاش حول توزيع المسؤولية في مواجهة التغير المناخي بين المواطن العادي والجهات الحكومية والشركات الكبرى',
    category: 'intermediate',
    tags: ['بيئة', 'مناخ', 'سياسة'],
    author: { _id: '5', name: 'فهد الراشد', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fahd', reputation: 120 },
    views: 387,
    upvotes: ['2', '4'],
    commentCount: 15,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'd6',
    title: 'حرية التعبير: متى تصبح خطراً على المجتمع؟',
    content: 'هل لحرية التعبير حدود يجب احترامها؟ وأين يقع الخط الفاصل بين الرأي الحر والخطاب الضار؟',
    category: 'advanced',
    tags: ['حرية', 'قانون', 'مجتمع'],
    author: { _id: '4', name: 'نورة السعيد', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noura', reputation: 300 },
    views: 312,
    upvotes: ['1', '3', '5'],
    commentCount: 41,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'حدث خطأ ما');
    }

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

  // Auth
  async register(name: string, email: string, password: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });

    const data = await this.handleResponse(response);
    
    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    const data = await this.handleResponse(response);
    
    if (data.token) {
      this.setToken(data.token);
    }

    return data;
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Discussions - مع fallback عند عدم وجود Backend
  async getDiscussions(filters?: { filter?: string; level?: string; sort?: string; page?: number }): Promise<ApiResponse<DiscussionData>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.filter) params.append('filter', filters.filter);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.sort) params.append('sort', filters.sort);
      if (filters?.page) params.append('page', filters.page.toString());

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`${this.baseUrl}/api/discussions?${params}`, {
        headers: this.getHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return this.handleResponse(response);
    } catch (error) {
      // Fallback to local data if backend unavailable
      console.warn('Backend unavailable, using fallback data');
      return {
        success: true,
        data: {
          discussions: FALLBACK_DISCUSSIONS,
          pagination: { page: 1, pages: 1, total: FALLBACK_DISCUSSIONS.length }
        }
      } as ApiResponse<DiscussionData>;
    }
  }

  async getDiscussion(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createDiscussion(discussion: {
    title: string;
    description: string;
    content: string;
    level: string;
    tags: string[];
  }): Promise<ApiResponse> {
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

  // Comments
  async addComment(discussionId: string, content: string, parentCommentId?: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/discussions/${discussionId}/comments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ content, parentCommentId }),
    });

    return this.handleResponse(response);
  }

  // Circles
  async getCircles(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/circles`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch {
      return { success: true, data: [] } as ApiResponse;
    }
  }

  async getCircle(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${id}`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async joinCircle(id: string): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/circles/${id}/join`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Users
  async getLeaderboard(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/leaderboard`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch {
      return { success: true, data: [] } as ApiResponse;
    }
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await fetch(`${this.baseUrl}/api/users/profile`, {
      headers: this.getHeaders(),
    });

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
}

export const api = new ApiService();
