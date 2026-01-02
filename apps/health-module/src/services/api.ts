// API service for communicating with Evero Healthcare backend
const HEALTHCARE_API_URL = import.meta.env.VITE_HEALTHCARE_API_URL || 'http://localhost:8080';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

class HealthcareApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = HEALTHCARE_API_URL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    
    const token = this.getAuthToken();
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User/Auth endpoints
  async register(data: { username: string; password: string; name: string }) {
    return this.request('/api/users', {
      method: 'POST',
      body: data,
    });
  }

  async login(data: { username: string; password: string }) {
    return this.request('/api/users/_login', {
      method: 'POST',
      body: data,
    });
  }

  async getCurrentUser() {
    return this.request('/api/users/_current');
  }

  async logout() {
    return this.request('/api/users', {
      method: 'DELETE',
    });
  }

  // Contact endpoints (treating contacts as patients)
  async getContacts() {
    return this.request('/api/contacts');
  }

  async getContact(contactId: string) {
    return this.request(`/api/contacts/${contactId}`);
  }

  async createContact(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    return this.request('/api/contacts', {
      method: 'POST',
      body: data,
    });
  }

  async updateContact(contactId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) {
    return this.request(`/api/contacts/${contactId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteContact(contactId: string) {
    return this.request(`/api/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  // Address endpoints
  async getAddresses(contactId: string) {
    return this.request(`/api/contacts/${contactId}/addresses`);
  }

  async getAddress(contactId: string, addressId: string) {
    return this.request(`/api/contacts/${contactId}/addresses/${addressId}`);
  }

  async createAddress(contactId: string, data: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  }) {
    return this.request(`/api/contacts/${contactId}/addresses`, {
      method: 'POST',
      body: data,
    });
  }

  async updateAddress(contactId: string, addressId: string, data: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
  }) {
    return this.request(`/api/contacts/${contactId}/addresses/${addressId}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteAddress(contactId: string, addressId: string) {
    return this.request(`/api/contacts/${contactId}/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }
}

export const healthcareApi = new HealthcareApiService();
export default healthcareApi;
