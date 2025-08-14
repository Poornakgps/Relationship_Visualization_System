import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Transaction, 
  CreateUserRequest, 
  CreateTransactionRequest,
  UserConnection,
  TransactionConnection 
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.api.get<User[]>('/users');
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.api.get<User>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await this.api.post<User>('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: Partial<CreateUserRequest>): Promise<User> {
    const response = await this.api.put<User>(`/users/${id}`, userData);
    return response.data;
  }



  async getUserConnections(id: number): Promise<UserConnection[]> {
    const response = await this.api.get<UserConnection[]>(`/users/${id}/connections`);
    return response.data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await this.api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Transaction endpoints
  async getTransactions(): Promise<Transaction[]> {
    const response = await this.api.get<Transaction[]>('/transactions');
    return response.data;
  }

  async getTransactionById(id: number): Promise<Transaction> {
    const response = await this.api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const response = await this.api.post<Transaction>('/transactions', transactionData);
    return response.data;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction> {
    const response = await this.api.put<Transaction>(`/transactions/${id}/status`, { status });
    return response.data;
  }

  async getTransactionConnections(id: number): Promise<TransactionConnection[]> {
    const response = await this.api.get<TransactionConnection[]>(`/transactions/${id}/connections`);
    return response.data;
  }

  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    const response = await this.api.get<Transaction[]>(`/transactions/user/${userId}`);
    return response.data;
  }

  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    const response = await this.api.get<Transaction[]>(`/transactions/status/${status}`);
    return response.data;
  }

  async getHighValueTransactions(minAmount: number = 10000): Promise<Transaction[]> {
    const response = await this.api.get<Transaction[]>(`/transactions/high-value?amount=${minAmount}`);
    return response.data;
  }



  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/users');
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 