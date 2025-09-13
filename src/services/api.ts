// API Configuration and Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// API Response Types
export interface ApiResponse<T = any> {
  status?: string;
  message?: string;
  error?: string;
  data?: T;
  history?: any[];
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  age: number;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  age: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('sunflower-token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('sunflower-token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('sunflower-token');
    localStorage.removeItem('sunflower-user');
  }

  // Get authentication headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
    console.log('📤 Request config:', config);

    try {
      const response = await fetch(url, config);
      console.log(`📥 Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ API Error Response:', errorData);
        } catch (e) {
          console.error('❌ Failed to parse error response');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ API Success Response:', data);
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      console.error('🔍 Request details:', { url, config });
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to backend server at ${this.baseURL}. Make sure the backend is running.`);
      }
      
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token and user data
    if (response.access_token) {
      this.setToken(response.access_token);
      localStorage.setItem('sunflower-user', JSON.stringify(response.user));
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<{ message: string; user: User }> {
    const response = await this.request<{ message: string; user: User }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  // User Profile Methods
  async getProfile(userId: number): Promise<{ status: string; user: User }> {
    return this.request<{ status: string; user: User }>(`/profile/${userId}`);
  }

  async updateProfile(userId: number, userData: Partial<User>): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/profile/${userId}`, {
      method: 'DELETE',
    });
  }

  // Get all users (Admin)
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<ApiResponse<User[]>>('/users');
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  // Upload sunflower image for analysis
  async uploadSunflowerImage(formData: FormData): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/predict`, {
        method: 'POST',
        headers: {
          'Authorization': this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Get sunflower analysis history
  async getSunflowerHistory(): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/history`);
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('sunflower-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  logout() {
    this.removeToken();
  }

  // Test backend connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      console.log('✅ Backend connection successful');
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error);
      return false;
    }
  }
}

// Create and export API service instance
export const apiService = new ApiService();

// Export default
export default apiService;
