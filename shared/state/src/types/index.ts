export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
  companyId: string;
  avatar?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  industry: string;
  employees: number;
  founded: string;
  website: string;
  description: string;
  logo?: string;
  status: 'active' | 'inactive' | 'suspended';
  modules: string[];
  subscription: {
    plan: string;
    startDate: string;
    endDate: string;
    features: string[];
  };
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
  menus: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'security';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
  expiresAt?: string | null;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  tags: string[];
  lastUpdated: string;
  author: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  ssoProvider?: string;
  sessionTimeout?: number;
}

export interface AppState {
  selectedCompany: Company | null;
  activeModule: string | null;
  moduleMenus: Record<string, MenuItem[]>;
  notifications: Notification[];
  unreadNotificationsCount: number;
  searchResults: Company[];
  isSearching: boolean;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  moduleThemes: Record<string, any>;
}
