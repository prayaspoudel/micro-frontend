import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AuthState, User, Company } from '../types';

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithSSO: () => Promise<void>;
  handleSSOCallback: (code: string, state: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => void;
  refreshToken: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set, get) => ({
    // State
    user: null,
    company: null,
    isAuthenticated: false,
    isLoading: true, // Start with loading true for initialization
    error: null,
    ssoProvider: undefined,
    sessionTimeout: undefined,

    // Actions
    login: async (email: string, password: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Mock API call - replace with actual API
        const mockUser: User = {
          id: '1',
          email,
          firstName: 'John',
          lastName: 'Admin',
          role: 'admin',
          companyId: '1',
          avatar: 'https://placehold.co/100x100?text=JA',
          permissions: ['read', 'write', 'delete', 'admin'],
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: '2024-01-01T00:00:00Z'
        };

        // Remove default company - user must select one

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        set((state) => {
          state.user = mockUser;
          state.company = null; // No default company
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
        });

        // Store in localStorage (no company stored here)
        localStorage.setItem('auth_token', 'mock_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));

      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = 'Login failed. Please try again.';
        });
      }
    },

    loginWithSSO: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // Dynamic import to avoid circular dependency
        const { ssoService } = await import('@shared/utils');
        
        if (!ssoService.isEnabled()) {
          throw new Error('SSO is not enabled');
        }
        
        await ssoService.login();
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : 'SSO login failed';
        });
      }
    },

    handleSSOCallback: async (code: string, state: string) => {
      set((draft) => {
        draft.isLoading = true;
        draft.error = null;
      });

      try {
        const { ssoService } = await import('@shared/utils');
        const ssoUser = await ssoService.handleCallback(code, state);
        
        // Map SSO user to app user
        const user: User = {
          id: ssoUser.id,
          email: ssoUser.email,
          firstName: ssoUser.firstName,
          lastName: ssoUser.lastName,
          role: ssoUser.roles.includes('admin') ? 'admin' : 
                ssoUser.roles.includes('manager') ? 'manager' : 'user',
          companyId: '1', // Default company for SSO users
          avatar: ssoUser.picture,
          permissions: ssoUser.permissions,
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };

        set((draft) => {
          draft.user = user;
          draft.company = null;
          draft.isAuthenticated = true;
          draft.isLoading = false;
          draft.ssoProvider = ssoService.getProviderName();
        });

        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_mode', 'sso');
      } catch (error) {
        set((draft) => {
          draft.isLoading = false;
          draft.error = error instanceof Error ? error.message : 'SSO callback failed';
        });
      }
    },

    refreshToken: async () => {
      try {
        const { ssoService } = await import('@shared/utils');
        await ssoService.refreshAccessToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    },

    validateSession: async (): Promise<boolean> => {
      try {
        const authMode = localStorage.getItem('auth_mode');
        
        if (authMode === 'sso') {
          const { ssoService } = await import('@shared/utils');
          return await ssoService.validateSession();
        }
        
        // For mock auth, check if token exists
        return !!localStorage.getItem('auth_token');
      } catch (error) {
        console.error('Session validation failed:', error);
        return false;
      }
    },

    logout: () => {
      const authMode = localStorage.getItem('auth_mode');
      
      set((state) => {
        state.user = null;
        state.company = null;
        state.isAuthenticated = false;
        state.error = null;
        state.ssoProvider = undefined;
      });

      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedCompany'); // Clear selected company on logout
      localStorage.removeItem('auth_mode');
      
      // If SSO mode, also logout from SSO provider
      if (authMode === 'sso') {
        import('@shared/utils').then(({ ssoService }) => {
          ssoService.logout().catch(console.error);
        });
      }
    },

    setUser: (user: User) => {
      set((state) => {
        state.user = user;
        state.isAuthenticated = true;
      });
    },

    setCompany: (company: Company) => {
      set((state) => {
        state.company = company;
      });
    },

    setLoading: (loading: boolean) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    setError: (error: string | null) => {
      set((state) => {
        state.error = error;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },

    initializeAuth: () => {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('user');
      const authMode = localStorage.getItem('auth_mode');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          set((state) => {
            state.user = user;
            state.company = null; // Company will be loaded separately by app store
            state.isAuthenticated = true;
            state.isLoading = false;
            state.ssoProvider = authMode === 'sso' ? localStorage.getItem('sso_provider') || undefined : undefined;
          });
          
          // If SSO mode, validate session (async check to avoid blocking init)
          // Note: This performs local token validation, not a network request
          if (authMode === 'sso') {
            import('@shared/utils').then(({ ssoService }) => {
              ssoService.validateSession().then(isValid => {
                if (!isValid) {
                  get().logout();
                }
              }).catch(err => {
                console.error('Session validation error:', err);
              });
            });
          }
        } catch (error) {
          // Failed to parse stored auth data, clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('auth_mode');
          
          set((state) => {
            state.isLoading = false;
          });
        }
      } else {
        set((state) => {
          state.isLoading = false;
        });
      }
    },
  }))
);
